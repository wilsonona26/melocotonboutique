const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload a product image to Cloudinary using an unsigned upload preset.
 * Returns the secure URL of the uploaded image.
 */
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET environment variables.'
    );
  }

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', `products/${productId}`);

  const response = await fetch(url, { method: 'POST', body: formData });

  if (!response.ok) {
    throw new Error(`Failed to upload image to Cloudinary: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.secure_url as string;
}

/**
 * Delete a product image from Cloudinary.
 *
 * NOTE: Cloudinary image deletion requires the API secret which must NOT be
 * exposed in frontend code. To safely delete images, implement a server-side
 * endpoint or use Cloudinary's auto-delete / lifecycle features.
 * This function is intentionally a no-op on the frontend.
 */
export async function deleteProductImage(_url: string): Promise<void> {
  // No-op: Cloudinary deletion requires the API secret and cannot be performed
  // safely from the client side. Use a server-side function or Cloudinary's
  // Media Library UI to remove unused images.
}
