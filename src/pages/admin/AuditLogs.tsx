import { useEffect, useState } from 'react';
import { getAuditLogs } from '../../firebase/audit';
import type { AuditLog } from '../../types';

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLogs(200)
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-4">{[...Array(10)].map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded-lg" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Registro de Auditoría</h1>
        <p className="text-gray-500 text-sm">Historial de acciones del sistema</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-600">
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Acción</th>
                <th className="px-4 py-3 font-medium">Recurso</th>
                <th className="px-4 py-3 font-medium">Detalles</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-t border-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {log.createdAt instanceof Date ? log.createdAt.toLocaleString() : new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs">{log.userEmail}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{log.action}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{log.resource}{log.resourceId ? ` (${log.resourceId.slice(0, 8)}...)` : ''}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{log.details ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logs.length === 0 && (
          <div className="text-center py-8 text-gray-400">No hay registros de auditoría</div>
        )}
      </div>
    </div>
  );
}
