import {
  collection, getDocs, addDoc, deleteDoc, doc,
  query, where, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { WishlistItem } from '../types';

const col = collection(db, 'wishlist');

export async function getUserWishlist(userId: string): Promise<WishlistItem[]> {
  const q = query(col, where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId as string,
      productId: data.productId as string,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    };
  });
}

export async function addToWishlist(userId: string, productId: string): Promise<string> {
  // Check if already exists
  const q = query(col, where('userId', '==', userId), where('productId', '==', productId));
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].id;
  const ref = await addDoc(col, { userId, productId, createdAt: serverTimestamp() });
  return ref.id;
}

export async function removeFromWishlist(userId: string, productId: string): Promise<void> {
  const q = query(col, where('userId', '==', userId), where('productId', '==', productId));
  const snap = await getDocs(q);
  for (const d of snap.docs) {
    await deleteDoc(doc(db, 'wishlist', d.id));
  }
}

export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  const q = query(col, where('userId', '==', userId), where('productId', '==', productId));
  const snap = await getDocs(q);
  return !snap.empty;
}
