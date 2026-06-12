import {
  collection, getDocs, addDoc, query, orderBy, limit, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { AuditLog } from '../types';

const col = collection(db, 'auditLogs');

export async function addAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(col, { ...log, createdAt: serverTimestamp() });
  return ref.id;
}

export async function getAuditLogs(maxResults = 100): Promise<AuditLog[]> {
  const q = query(col, orderBy('createdAt', 'desc'), limit(maxResults));
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId as string,
      userEmail: data.userEmail as string,
      action: data.action as string,
      resource: data.resource as string,
      resourceId: (data.resourceId as string) ?? undefined,
      details: (data.details as string) ?? undefined,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    };
  });
}
