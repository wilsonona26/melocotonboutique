import {
  collection, getDocs, getDoc, updateDoc, doc, query, orderBy, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { User, UserRole } from '../types';

const col = collection(db, 'users');

function toUser(data: Record<string, unknown>): User {
  return {
    uid: data.uid as string,
    email: data.email as string,
    displayName: data.displayName as string,
    role: (data.role as UserRole) ?? 'CUSTOMER',
    active: (data.active as boolean) ?? true,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
  };
}

export async function getAllUsers(): Promise<User[]> {
  const snap = await getDocs(query(col, orderBy('createdAt', 'desc')));
  return snap.docs.map(d => toUser(d.data() as Record<string, unknown>));
}

export async function getUserById(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return toUser(snap.data() as Record<string, unknown>);
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { role, updatedAt: serverTimestamp() });
}

export async function toggleUserActive(uid: string, active: boolean): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { active, updatedAt: serverTimestamp() });
}
