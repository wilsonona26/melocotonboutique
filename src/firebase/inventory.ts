import {
  collection, getDocs, addDoc, query, where, orderBy, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { InventoryMovement } from '../types';

const col = collection(db, 'inventoryMovements');

export async function addInventoryMovement(movement: Omit<InventoryMovement, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(col, { ...movement, createdAt: serverTimestamp() });
  return ref.id;
}

export async function getInventoryHistory(productId?: string): Promise<InventoryMovement[]> {
  let q = query(col, orderBy('createdAt', 'desc'));
  if (productId) {
    q = query(col, where('productId', '==', productId), orderBy('createdAt', 'desc'));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    } as InventoryMovement;
  });
}
