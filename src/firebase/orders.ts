import {
  collection, doc, getDocs, getDoc, updateDoc,
  query, where, orderBy, serverTimestamp, Timestamp, runTransaction,
} from 'firebase/firestore';
import { db } from './config';
import type { Order, OrderStatus } from '../types';

const col = collection(db, 'orders');

function toOrder(id: string, data: Record<string, unknown>): Order {
  return {
    ...(data as Omit<Order, 'id' | 'createdAt' | 'updatedAt'>),
    id,
    createdAt: (data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date()),
    updatedAt: (data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()),
  };
}

export async function createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  let newId = '';
  await runTransaction(db, async (tx) => {
    for (const item of order.items) {
      const prodRef = doc(db, 'products', item.productId);
      const prodSnap = await tx.get(prodRef);
      if (!prodSnap.exists()) throw new Error(`Producto ${item.productName} no encontrado`);
      const currentStock = prodSnap.data().stock as number;
      if (currentStock < item.quantity) throw new Error(`Stock insuficiente para ${item.productName}`);
      tx.update(prodRef, { stock: currentStock - item.quantity, updatedAt: serverTimestamp() });
    }
    const ref = doc(col);
    newId = ref.id;
    tx.set(ref, { ...order, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  });
  return newId;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, 'orders', id));
  if (!snap.exists()) return null;
  return toOrder(snap.id, snap.data() as Record<string, unknown>);
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const q = query(col, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => toOrder(d.id, d.data() as Record<string, unknown>));
}

export async function getAllOrders(): Promise<Order[]> {
  const snap = await getDocs(query(col, orderBy('createdAt', 'desc')));
  return snap.docs.map(d => toOrder(d.id, d.data() as Record<string, unknown>));
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  if (status === 'cancelled') {
    await runTransaction(db, async (tx) => {
      const orderRef = doc(db, 'orders', id);
      const orderSnap = await tx.get(orderRef);
      if (!orderSnap.exists()) return;
      const order = orderSnap.data() as Order;
      if (order.status === 'cancelled') return;
      for (const item of order.items) {
        const prodRef = doc(db, 'products', item.productId);
        const prodSnap = await tx.get(prodRef);
        if (prodSnap.exists()) {
          tx.update(prodRef, { stock: (prodSnap.data().stock as number) + item.quantity, updatedAt: serverTimestamp() });
        }
      }
      tx.update(orderRef, { status, updatedAt: serverTimestamp() });
    });
  } else {
    await updateDoc(doc(db, 'orders', id), { status, updatedAt: serverTimestamp() });
  }
}

export async function getOrderStats(): Promise<{
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  monthlyRevenue: number;
}> {
  const snap = await getDocs(col);
  const orders = snap.docs.map(d => d.data() as Order);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  let totalRevenue = 0;
  let pendingOrders = 0;
  let monthlyRevenue = 0;
  for (const o of orders) {
    if (o.status !== 'cancelled') {
      totalRevenue += o.total;
      const created = (o.createdAt instanceof Timestamp ? o.createdAt.toDate() : new Date(o.createdAt));
      if (created >= monthStart) monthlyRevenue += o.total;
    }
    if (o.status === 'pending') pendingOrders++;
  }
  return { totalOrders: orders.length, totalRevenue, pendingOrders, monthlyRevenue };
}
