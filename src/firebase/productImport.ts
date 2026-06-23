import Papa from 'papaparse';
import { getAllProducts, createProduct } from './products';
import type { ProductImportRow, ImportValidationResult, Product } from '../types';

const CSV_TEMPLATE_HEADERS = [
  'sku', 'code', 'name', 'description', 'category', 'brand',
  'publicPrice', 'wholesalePrice', 'stock', 'featured', 'active', 'color', 'size',
];

export function downloadCSVTemplate(): void {
  const csv = CSV_TEMPLATE_HEADERS.join(',') + '\n' +
    'SKU001,CODE001,Producto Ejemplo,Descripción del producto,Ropa,MarcaX,29.99,19.99,100,false,true,Rojo,M\n';
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla_productos.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function parseCSV(file: File): Promise<ProductImportRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows: ProductImportRow[] = results.data.map(row => ({
          sku: (row.sku ?? '').trim(),
          code: (row.code ?? '').trim(),
          name: (row.name ?? '').trim(),
          description: (row.description ?? '').trim(),
          category: (row.category ?? '').trim(),
          brand: (row.brand ?? '').trim(),
          publicPrice: parseFloat(row.publicPrice) || 0,
          wholesalePrice: parseFloat(row.wholesalePrice) || 0,
          stock: parseInt(row.stock) || 0,
          featured: row.featured === 'true' || row.featured === '1',
          active: row.active !== 'false' && row.active !== '0',
          color: (row.color ?? '').trim(),
          size: (row.size ?? '').trim(),
        }));
        resolve(rows);
      },
      error: (error) => reject(error),
    });
  });
}

export function parseExcelCSV(text: string): ProductImportRow[] {
  // Handle tab-separated or semicolon-separated Excel exports
  const separator = text.includes('\t') ? '\t' : text.includes(';') ? ';' : ',';
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(separator).map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  const rows: ProductImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(separator).map(v => v.trim().replace(/['"]/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx] ?? ''; });

    rows.push({
      sku: row.sku ?? '',
      code: row.code ?? '',
      name: row.name ?? '',
      description: row.description ?? '',
      category: row.category ?? '',
      brand: row.brand ?? '',
      publicPrice: parseFloat(row.publicprice || row.public_price || row.precio || '0') || 0,
      wholesalePrice: parseFloat(row.wholesaleprice || row.wholesale_price || row.precio_mayoreo || '0') || 0,
      stock: parseInt(row.stock || row.inventario || '0') || 0,
      featured: row.featured === 'true' || row.featured === '1',
      active: row.active !== 'false' && row.active !== '0',
      color: row.color ?? '',
      size: row.size ?? row.talla ?? '',
    });
  }

  return rows;
}

export async function validateImportRows(rows: ProductImportRow[]): Promise<ImportValidationResult[]> {
  const existingProducts = await getAllProducts();
  const existingSkus = new Set(existingProducts.map(p => p.sku.toLowerCase()));
  const seenSkus = new Set<string>();

  return rows.map((data, index) => {
    const errors: string[] = [];
    let isDuplicate = false;

    if (!data.sku) errors.push('SKU es requerido');
    if (!data.name) errors.push('Nombre es requerido');
    if (!data.category) errors.push('Categoría es requerida');
    if (data.publicPrice <= 0) errors.push('Precio público debe ser mayor a 0');
    if (data.stock < 0) errors.push('Stock no puede ser negativo');

    if (data.sku) {
      const skuLower = data.sku.toLowerCase();
      if (existingSkus.has(skuLower) || seenSkus.has(skuLower)) {
        isDuplicate = true;
        errors.push(`SKU duplicado: ${data.sku}`);
      }
      seenSkus.add(skuLower);
    }

    return {
      row: index + 1,
      data,
      valid: errors.length === 0,
      errors,
      isDuplicate,
    };
  });
}

export async function importProducts(rows: ProductImportRow[]): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      await createProduct({
        sku: row.sku,
        code: row.code || row.sku,
        name: row.name,
        description: row.description,
        category: row.category,
        brand: row.brand,
        publicPrice: row.publicPrice,
        wholesalePrice: row.wholesalePrice,
        stock: row.stock,
        images: [],
        mainImage: 0,
        variants: [],
        featured: row.featured,
        active: row.active,
        color: row.color,
        size: row.size,
        tags: [],
        seoTitle: '',
        seoDescription: '',
      });
      success++;
    } catch (err) {
      failed++;
      errors.push(`Fila ${row.sku}: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  }

  return { success, failed, errors };
}

export async function bulkUpdateStock(updates: { sku: string; stock: number }[]): Promise<{ success: number; failed: number }> {
  const products = await getAllProducts();
  const skuMap = new Map<string, Product>();
  products.forEach(p => { if (p.sku) skuMap.set(p.sku.toLowerCase(), p); });

  let success = 0;
  let failed = 0;

  const { updateProduct } = await import('./products');
  for (const u of updates) {
    const product = skuMap.get(u.sku.toLowerCase());
    if (product) {
      try {
        await updateProduct(product.id, { stock: u.stock });
        success++;
      } catch {
        failed++;
      }
    } else {
      failed++;
    }
  }

  return { success, failed };
}

export async function bulkUpdatePrices(updates: { sku: string; publicPrice?: number; wholesalePrice?: number }[]): Promise<{ success: number; failed: number }> {
  const products = await getAllProducts();
  const skuMap = new Map<string, Product>();
  products.forEach(p => { if (p.sku) skuMap.set(p.sku.toLowerCase(), p); });

  let success = 0;
  let failed = 0;

  const { updateProduct } = await import('./products');
  for (const u of updates) {
    const product = skuMap.get(u.sku.toLowerCase());
    if (product) {
      try {
        const upd: Partial<Product> = {};
        if (u.publicPrice !== undefined) upd.publicPrice = u.publicPrice;
        if (u.wholesalePrice !== undefined) upd.wholesalePrice = u.wholesalePrice;
        await updateProduct(product.id, upd);
        success++;
      } catch {
        failed++;
      }
    } else {
      failed++;
    }
  }

  return { success, failed };
}
