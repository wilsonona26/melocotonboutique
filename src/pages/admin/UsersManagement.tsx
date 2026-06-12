import { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole, toggleUserActive } from '../../firebase/users';
import { addAuditLog } from '../../firebase/audit';
import { useAuth } from '../../context/AuthContext';
import type { User, UserRole } from '../../types';

const ROLES: UserRole[] = ['CUSTOMER', 'STAFF', 'ADMIN', 'SUPER_ADMIN'];

const ROLE_COLORS: Record<UserRole, string> = {
  CUSTOMER: 'bg-gray-100 text-gray-700',
  STAFF: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-purple-100 text-purple-700',
  SUPER_ADMIN: 'bg-red-100 text-red-700',
};

export default function UsersManagement() {
  const { userProfile, hasPermission } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<UserRole | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const all = await getAllUsers();
      setUsers(all);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(user: User, newRole: UserRole) {
    if (!hasPermission('canAssignRoles')) return;
    if (user.role === 'SUPER_ADMIN' && userProfile?.role !== 'SUPER_ADMIN') return;
    if (newRole === 'SUPER_ADMIN' && userProfile?.role !== 'SUPER_ADMIN') return;

    try {
      await updateUserRole(user.uid, newRole);
      await addAuditLog({
        userId: userProfile!.uid,
        userEmail: userProfile!.email,
        action: 'ROLE_CHANGE',
        resource: 'users',
        resourceId: user.uid,
        details: `Changed role from ${user.role} to ${newRole} for ${user.email}`,
      });
      setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Error updating role:', err);
    }
  }

  async function handleToggleActive(user: User) {
    if (!hasPermission('canManageUsers')) return;
    try {
      await toggleUserActive(user.uid, !user.active);
      await addAuditLog({
        userId: userProfile!.uid,
        userEmail: userProfile!.email,
        action: user.active ? 'USER_DEACTIVATED' : 'USER_ACTIVATED',
        resource: 'users',
        resourceId: user.uid,
        details: `${user.active ? 'Deactivated' : 'Activated'} user ${user.email}`,
      });
      setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, active: !u.active } : u));
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
  }

  const filteredUsers = users.filter(u => {
    if (filter !== 'ALL' && u.role !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return u.email.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) {
    return <div className="animate-pulse space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-lg" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-500 text-sm">{users.length} usuarios registrados</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por email o nombre..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="input flex-1"
        />
        <select value={filter} onChange={e => setFilter(e.target.value as UserRole | 'ALL')} className="input w-full sm:w-48">
          <option value="ALL">Todos los roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-600">
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Registrado</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.uid} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{user.displayName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {hasPermission('canAssignRoles') && user.uid !== userProfile?.uid ? (
                      <select
                        value={user.role}
                        onChange={e => handleRoleChange(user, e.target.value as UserRole)}
                        className="text-xs rounded-lg border-gray-200 py-1 px-2"
                        disabled={user.role === 'SUPER_ADMIN' && userProfile?.role !== 'SUPER_ADMIN'}
                      >
                        {ROLES.map(r => (
                          <option key={r} value={r} disabled={r === 'SUPER_ADMIN' && userProfile?.role !== 'SUPER_ADMIN'}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {user.createdAt instanceof Date ? user.createdAt.toLocaleDateString() : new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {hasPermission('canManageUsers') && user.uid !== userProfile?.uid && (
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`text-xs px-3 py-1 rounded-lg font-medium ${user.active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                      >
                        {user.active ? 'Desactivar' : 'Activar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-400">No se encontraron usuarios</div>
        )}
      </div>
    </div>
  );
}
