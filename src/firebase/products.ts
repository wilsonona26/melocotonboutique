import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { Product } from '../types';

const col = collection(db, 'products');

function toProduct(id: string, data: Record<string, unknown>): Product {
  return {
    id,
    code: data.code as string,
    sku: (data.sku as string) ?? '',
    name: data.name as string,
    description: data.description as string,
    category: data.category as string,
    brand: (data.brand as string) ?? '',
    publicPrice: data.publicPrice as number,
    wholesalePrice: data.wholesalePrice as number,
    stock: data.stock as number,
    images: (data.images as string[]) ?? [],
    mainImage: (data.mainImage as number) ?? 0,
    variants: (data.variants as Product['variants']) ?? [],
    featured: (data.featured as boolean) ?? false,
    active: data.active as boolean ?? true,
    color: (data.color as string) ?? '',
    size: (data.size as string) ?? '',
    tags: (data.tags as string[]) ?? [],
    seoTitle: (data.seoTitle as string) ?? '',
    seoDescription: (data.seoDescription as string) ?? '',
    createdAt: (data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date()),
    updatedAt: (data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()),
  };
}

export async function getProducts(category?: string): Promise<Product[]> {
  let q = query(col, where('active', '==', true), orderBy('createdAt', 'desc'));
  if (category) {
    q = query(col, where('active', '==', true), where('category', '==', category), orderBy('createdAt', 'desc'));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => toProduct(d.id, d.data() as Record<string, unknown>));
}

export async function getAllProducts(): Promise<Product[]> {
  const snap = await getDocs(query(col, orderBy('createdAt', 'desc')));
  return snap.docs.map(d => toProduct(d.id, d.data() as Record<string, unknown>));
}

export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, 'products', id));
  if (!snap.exists()) return null;
  return toProduct(snap.id, snap.data() as Record<string, unknown>);
}

export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(col, { ...product, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return ref.id;
}

export async function updateProduct(id: string, product: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<void> {
  await updateDoc(doc(db, 'products', id), { ...product, updatedAt: serverTimestamp() });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, 'products', id));
}

export async function updateStock(id: string, quantity: number): Promise<void> {
  await updateDoc(doc(db, 'products', id), { stock: quantity, updatedAt: serverTimestamp() });
}

export async function searchProducts(searchQuery: string): Promise<Product[]> {
  const all = await getProducts();
  const q = searchQuery.toLowerCase();
  return all.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.code.toLowerCase().includes(q) ||
    (p.sku && p.sku.toLowerCase().includes(q))
  );
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const q = query(col, where('active', '==', true), where('featured', '==', true), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => toProduct(d.id, d.data() as Record<string, unknown>));
}

export async function getLowStockProducts(threshold = 5): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter(p => p.stock <= threshold && p.active);
}
