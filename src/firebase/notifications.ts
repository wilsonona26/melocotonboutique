import {
  collection, getDocs, addDoc, updateDoc, doc,
  query, where, orderBy, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { UserNotification } from '../types';

const col = collection(db, 'notifications');

export async function getUserNotifications(userId: string): Promise<UserNotification[]> {
  const q = query(col, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId as string,
      title: data.title as string,
      message: data.message as string,
      type: data.type as UserNotification['type'],
      read: (data.read as boolean) ?? false,
      link: (data.link as string) ?? undefined,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    };
  });
}

export async function createNotification(notification: Omit<UserNotification, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(col, { ...notification, createdAt: serverTimestamp() });
  return ref.id;
}

export async function markNotificationRead(id: string): Promise<void> {
  await updateDoc(doc(db, 'notifications', id), { read: true });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const q = query(col, where('userId', '==', userId), where('read', '==', false));
  const snap = await getDocs(q);
  const updates = snap.docs.map(d => updateDoc(doc(db, 'notifications', d.id), { read: true }));
  await Promise.all(updates);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const q = query(col, where('userId', '==', userId), where('read', '==', false));
  const snap = await getDocs(q);
  return snap.size;
}
