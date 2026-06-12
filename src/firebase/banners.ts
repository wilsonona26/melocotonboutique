import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
  query, where, orderBy, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { PromoBanner } from '../types';

const col = collection(db, 'banners');

function toBanner(id: string, data: Record<string, unknown>): PromoBanner {
  return {
    id,
    title: data.title as string,
    subtitle: data.subtitle as string ?? '',
    imageUrl: data.imageUrl as string,
    linkUrl: data.linkUrl as string ?? '/catalog',
    active: data.active as boolean ?? true,
    order: (data.order as number) ?? 0,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
  };
}

export async function getActiveBanners(): Promise<PromoBanner[]> {
  const q = query(col, where('active', '==', true), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => toBanner(d.id, d.data() as Record<string, unknown>));
}

export async function getAllBanners(): Promise<PromoBanner[]> {
  const snap = await getDocs(query(col, orderBy('order', 'asc')));
  return snap.docs.map(d => toBanner(d.id, d.data() as Record<string, unknown>));
}

export async function createBanner(banner: Omit<PromoBanner, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(col, { ...banner, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateBanner(id: string, data: Partial<PromoBanner>): Promise<void> {
  await updateDoc(doc(db, 'banners', id), data);
}

export async function deleteBanner(id: string): Promise<void> {
  await deleteDoc(doc(db, 'banners', id));
}
