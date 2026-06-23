import { useState, useRef } from 'react';
import { parseCSV, parseExcelCSV, validateImportRows, importProducts, downloadCSVTemplate, bulkUpdateStock, bulkUpdatePrices } from '../../firebase/productImport';
import { useAuth } from '../../context/AuthContext';
import { addAuditLog } from '../../firebase/audit';
import type { ImportValidationResult } from '../../types';

type ImportMode = 'products' | 'stock' | 'prices';

export default function ProductImport() {
  const { userProfile } = useAuth();
  const [mode, setMode] = useState<ImportMode>('products');
  const [validationResults, setValidationResults] = useState<ImportValidationResult[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [fileLoaded, setFileLoaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    setValidationResults([]);

    try {
      let rows;
      if (file.name.endsWith('.csv')) {
        rows = await parseCSV(file);
      } else {
        // Treat as text-based tabular format (TSV, etc.)
        const text = await file.text();
        rows = parseExcelCSV(text);
      }

      if (mode === 'products') {
        const results = await validateImportRows(rows);
        setValidationResults(results);
      } else if (mode === 'stock') {
        const updates = rows.map(r => ({ sku: r.sku, stock: r.stock })).filter(r => r.sku);
        setValidationResults(updates.map((u, i) => ({
          row: i + 1,
          data: { ...u, code: '', name: `Stock: ${u.stock}`, description: '', category: '', brand: '', publicPrice: 0, wholesalePrice: 0, featured: false, active: true, color: '', size: '' },
          valid: !!u.sku && u.stock >= 0,
          errors: !u.sku ? ['SKU requerido'] : u.stock < 0 ? ['Stock inválido'] : [],
          isDuplicate: false,
        })));
      } else if (mode === 'prices') {
        const updates = rows.map(r => ({ sku: r.sku, publicPrice: r.publicPrice, wholesalePrice: r.wholesalePrice })).filter(r => r.sku);
        setValidationResults(updates.map((u, i) => ({
          row: i + 1,
          data: { ...u, code: '', name: `Precio: $${u.publicPrice}`, description: '', category: '', brand: '', stock: 0, featured: false, active: true, color: '', size: '' },
          valid: !!u.sku && u.publicPrice > 0,
          errors: !u.sku ? ['SKU requerido'] : u.publicPrice <= 0 ? ['Precio inválido'] : [],
          isDuplicate: false,
        })));
      }
      setFileLoaded(true);
    } catch (err) {
      console.error('Error parsing file:', err);
      setResult({ success: 0, failed: 1, errors: ['Error al leer el archivo'] });
    }
  }

  async function handleImport() {
    setImporting(true);
    setResult(null);

    try {
      const validRows = validationResults.filter(r => r.valid);

      if (mode === 'products') {
        const res = await importProducts(validRows.map(r => r.data));
        setResult(res);
        if (userProfile) {
          await addAuditLog({
            userId: userProfile.uid,
            userEmail: userProfile.email,
            action: 'BULK_IMPORT',
            resource: 'products',
            details: `Imported ${res.success} products, ${res.failed} failed`,
          });
        }
      } else if (mode === 'stock') {
        const updates = validRows.map(r => ({ sku: r.data.sku, stock: r.data.stock }));
        const res = await bulkUpdateStock(updates);
        setResult({ ...res, errors: [] });
      } else if (mode === 'prices') {
        const updates = validRows.map(r => ({ sku: r.data.sku, publicPrice: r.data.publicPrice, wholesalePrice: r.data.wholesalePrice }));
        const res = await bulkUpdatePrices(updates);
        setResult({ ...res, errors: [] });
      }
    } catch (err) {
      setResult({ success: 0, failed: 0, errors: [err instanceof Error ? err.message : 'Error desconocido'] });
    } finally {
      setImporting(false);
    }
  }

  const validCount = validationResults.filter(r => r.valid).length;
  const invalidCount = validationResults.filter(r => !r.valid).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Importar Productos</h1>
        <p className="text-gray-500 text-sm">Importación masiva desde CSV</p>
      </div>

      {/* Mode Selection */}
      <div className="flex gap-2">
        {([['products', 'Productos'], ['stock', 'Stock Masivo'], ['prices', 'Precios Masivos']] as const).map(([m, label]) => (
          <button
            key={m}
            onClick={() => { setMode(m); setValidationResults([]); setResult(null); setFileLoaded(false); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          <button onClick={downloadCSVTemplate} className="btn btn-secondary text-sm">
            📥 Descargar Plantilla CSV
          </button>
          <label className="btn btn-primary text-sm cursor-pointer">
            📁 Seleccionar Archivo
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.tsv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {mode === 'products' && (
          <p className="text-xs text-gray-500">
            Campos: sku, code, name, description, category, brand, publicPrice, wholesalePrice, stock, featured, active, color, size
          </p>
        )}
        {mode === 'stock' && (
          <p className="text-xs text-gray-500">Campos requeridos: sku, stock</p>
        )}
        {mode === 'prices' && (
          <p className="text-xs text-gray-500">Campos requeridos: sku, publicPrice, wholesalePrice</p>
        )}
      </div>

      {/* Validation Preview */}
      {fileLoaded && validationResults.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Vista Previa de Importación</h3>
            <div className="flex gap-2 text-sm">
              <span className="px-2 py-1 rounded-full bg-green-100 text-green-700">{validCount} válidos</span>
              {invalidCount > 0 && <span className="px-2 py-1 rounded-full bg-red-100 text-red-700">{invalidCount} con errores</span>}
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 px-2">#</th>
                  <th className="pb-2 px-2">SKU</th>
                  <th className="pb-2 px-2">Nombre</th>
                  <th className="pb-2 px-2">Estado</th>
                  <th className="pb-2 px-2">Errores</th>
                </tr>
              </thead>
              <tbody>
                {validationResults.slice(0, 50).map(r => (
                  <tr key={r.row} className={`border-b border-gray-50 ${!r.valid ? 'bg-red-50' : ''}`}>
                    <td className="py-2 px-2">{r.row}</td>
                    <td className="py-2 px-2 font-mono">{r.data.sku}</td>
                    <td className="py-2 px-2">{r.data.name}</td>
                    <td className="py-2 px-2">
                      {r.valid ? <span className="text-green-600">✓</span> : <span className="text-red-600">✗</span>}
                      {r.isDuplicate && <span className="ml-1 text-yellow-600">⚠ Duplicado</span>}
                    </td>
                    <td className="py-2 px-2 text-red-500">{r.errors.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {validCount > 0 && (
            <button
              onClick={handleImport}
              disabled={importing}
              className="btn btn-primary"
            >
              {importing ? 'Importando...' : `Importar ${validCount} registros válidos`}
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className={`rounded-2xl p-6 ${result.failed > 0 || result.errors.length > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
          <h3 className="font-semibold mb-2">{result.failed === 0 && result.errors.length === 0 ? '✅ Importación Exitosa' : '⚠️ Importación Completada con Errores'}</h3>
          <p className="text-sm">Éxitos: {result.success} | Fallidos: {result.failed}</p>
          {result.errors.length > 0 && (
            <ul className="mt-2 text-xs text-red-600 space-y-1">
              {result.errors.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
