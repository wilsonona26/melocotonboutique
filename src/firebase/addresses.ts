import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
  query, where,
} from 'firebase/firestore';
import { db } from './config';
import type { SavedAddress } from '../types';

const col = collection(db, 'addresses');

export async function getUserAddresses(userId: string): Promise<SavedAddress[]> {
  const q = query(col, where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId as string,
      label: data.label as string,
      address: data.address as string,
      city: data.city as string,
      state: data.state as string,
      zipCode: data.zipCode as string,
      country: data.country as string ?? 'Ecuador',
      isDefault: data.isDefault as boolean ?? false,
    };
  });
}

export async function addAddress(address: Omit<SavedAddress, 'id'>): Promise<string> {
  if (address.isDefault) {
    // Remove default from other addresses
    const existing = await getUserAddresses(address.userId);
    for (const a of existing) {
      if (a.isDefault) {
        await updateDoc(doc(db, 'addresses', a.id), { isDefault: false });
      }
    }
  }
  const ref = await addDoc(col, address);
  return ref.id;
}

export async function updateAddress(id: string, data: Partial<SavedAddress>): Promise<void> {
  await updateDoc(doc(db, 'addresses', id), data);
}

export async function deleteAddress(id: string): Promise<void> {
  await deleteDoc(doc(db, 'addresses', id));
}

export async function setDefaultAddress(userId: string, addressId: string): Promise<void> {
  const addresses = await getUserAddresses(userId);
  for (const a of addresses) {
    await updateDoc(doc(db, 'addresses', a.id), { isDefault: a.id === addressId });
  }
}
