import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { Coupon } from '../types';

const col = collection(db, 'coupons');

function toCoupon(id: string, data: Record<string, unknown>): Coupon {
  return {
    id,
    code: data.code as string,
    discountType: data.discountType as 'percentage' | 'fixed',
    discountValue: data.discountValue as number,
    minOrderAmount: (data.minOrderAmount as number) ?? 0,
    maxUses: (data.maxUses as number) ?? 0,
    currentUses: (data.currentUses as number) ?? 0,
    active: data.active as boolean ?? true,
    expiresAt: data.expiresAt instanceof Timestamp ? data.expiresAt.toDate() : new Date(data.expiresAt as string),
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
  };
}

export async function getAllCoupons(): Promise<Coupon[]> {
  const snap = await getDocs(col);
  return snap.docs.map(d => toCoupon(d.id, d.data() as Record<string, unknown>));
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const q = query(col, where('code', '==', code.toUpperCase()), where('active', '==', true));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return toCoupon(d.id, d.data() as Record<string, unknown>);
}

export async function validateCoupon(code: string, orderTotal: number): Promise<{ valid: boolean; coupon?: Coupon; error?: string }> {
  const coupon = await getCouponByCode(code);
  if (!coupon) return { valid: false, error: 'Cupón no encontrado' };
  if (!coupon.active) return { valid: false, error: 'Cupón inactivo' };
  if (new Date() > coupon.expiresAt) return { valid: false, error: 'Cupón expirado' };
  if (coupon.maxUses > 0 && coupon.currentUses >= coupon.maxUses) return { valid: false, error: 'Cupón agotado' };
  if (orderTotal < coupon.minOrderAmount) return { valid: false, error: `Mínimo de compra: $${coupon.minOrderAmount}` };
  return { valid: true, coupon };
}

export async function applyCoupon(couponId: string): Promise<void> {
  const ref = doc(db, 'coupons', couponId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const current = snap.data().currentUses as number ?? 0;
    await updateDoc(ref, { currentUses: current + 1 });
  }
}

export async function createCoupon(coupon: Omit<Coupon, 'id' | 'createdAt' | 'currentUses'>): Promise<string> {
  const ref = await addDoc(col, { ...coupon, code: coupon.code.toUpperCase(), currentUses: 0, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateCoupon(id: string, data: Partial<Coupon>): Promise<void> {
  await updateDoc(doc(db, 'coupons', id), data);
}

export async function deleteCoupon(id: string): Promise<void> {
  await deleteDoc(doc(db, 'coupons', id));
}
