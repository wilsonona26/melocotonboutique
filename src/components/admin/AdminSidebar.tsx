import { NavLink } from 'react-router-dom';
import {
  HomeIcon, ShoppingBagIcon, ArchiveBoxIcon,
  ClipboardDocumentListIcon, Squares2X2Icon, MegaphoneIcon,
  UsersIcon, DocumentArrowUpIcon, SparklesIcon, ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import type { RolePermissions } from '../../types';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  end?: boolean;
  permission?: keyof RolePermissions;
}

const navItems: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: HomeIcon, end: true },
  { to: '/admin/products', label: 'Productos', icon: ShoppingBagIcon, permission: 'canViewProducts' },
  { to: '/admin/products/import', label: 'Importar', icon: DocumentArrowUpIcon, permission: 'canImportProducts' },
  { to: '/admin/products/ai-generator', label: 'Generador AI', icon: SparklesIcon, permission: 'canCreateProducts' },
  { to: '/admin/inventory', label: 'Inventario', icon: ArchiveBoxIcon, permission: 'canManageInventory' },
  { to: '/admin/orders', label: 'Pedidos', icon: ClipboardDocumentListIcon, permission: 'canViewOrders' },
  { to: '/admin/marketing', label: 'Marketing', icon: MegaphoneIcon, permission: 'canManageBanners' },
  { to: '/admin/users', label: 'Usuarios', icon: UsersIcon, permission: 'canManageUsers' },
  { to: '/admin/audit-logs', label: 'Auditoría', icon: ShieldCheckIcon, permission: 'canViewAuditLogs' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: Props) {
  const { hasPermission, role } = useAuth();

  const visibleItems = navItems.filter(item => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white flex flex-col transform transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
          <Squares2X2Icon className="w-6 h-6 text-primary-400" />
          <div>
            <p className="font-display font-bold text-primary-400">Melocoton</p>
            <p className="text-xs text-gray-500">Panel Admin • {role}</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {visibleItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-gray-800">
          <NavLink to="/" className="text-gray-500 hover:text-gray-300 text-sm flex items-center gap-2 transition-colors">
            ← Volver a la tienda
          </NavLink>
        </div>
      </aside>
    </>
  );
}
