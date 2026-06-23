import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

export async function uploadProductImage(file: File, productId: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `products/${productId}/${Date.now()}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteProductImage(url: string): Promise<void> {
  try {
    const imageRef = ref(storage, url);
    await deleteObject(imageRef);
  } catch {
    // Image may not exist, ignore error
  }
}
