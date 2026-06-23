import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBagIcon, MagnifyingGlassIcon, Bars3Icon, XMarkIcon,
  UserCircleIcon, ArrowRightOnRectangleIcon, UserIcon, ClipboardDocumentListIcon,
  Cog6ToothIcon, HeartIcon, MapPinIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import logoDark from '../../assets/logo-dark.svg';

interface Props {
  onCartOpen?: () => void;
}

export default function Navbar({ onCartOpen }: Props) {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md shadow-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logoDark} alt="Melocoton Boutique" className="h-10" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-300 hover:text-primary-500 font-medium transition-colors">Inicio</Link>
            <Link to="/catalog" className="text-gray-300 hover:text-primary-500 font-medium transition-colors">Catálogo</Link>
          </nav>

          {/* Search + Actions */}
          <div className="flex items-center gap-3">
            {/* Search Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="pl-9 pr-4 py-1.5 text-sm border border-gray-700 bg-gray-900 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 w-48 focus:w-64 transition-all placeholder-gray-500"
                />
                <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </form>

            {/* Cart */}
            <button
              onClick={onCartOpen}
              className="relative p-2 text-gray-300 hover:text-primary-500 transition-colors"
              aria-label="Carrito"
            >
              <ShoppingBagIcon className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* User Menu */}
            {currentUser ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-gray-300 hover:text-primary-500 transition-colors p-1"
                >
                  <UserCircleIcon className="w-7 h-7" />
                  <span className="text-sm font-medium max-w-[100px] truncate">
                    {userProfile?.displayName || currentUser.email}
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 transition-colors">
                      <UserIcon className="w-4 h-4" /> Mi Perfil
                    </Link>
                    <Link to="/orders" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 transition-colors">
                      <ClipboardDocumentListIcon className="w-4 h-4" /> Mis Pedidos
                    </Link>
                    <Link to="/wishlist" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 transition-colors">
                      <HeartIcon className="w-4 h-4" /> Favoritos
                    </Link>
                    <Link to="/addresses" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 transition-colors">
                      <MapPinIcon className="w-4 h-4" /> Mis Direcciones
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-primary-500 hover:bg-primary-50 transition-colors font-medium">
                        <Cog6ToothIcon className="w-4 h-4" /> Administración
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <ArrowRightOnRectangleIcon className="w-4 h-4" /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="text-gray-300 hover:text-white text-sm font-medium py-1.5 px-3 transition-colors">Ingresar</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-3">Registrarse</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-300">
              {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-800 space-y-3 animate-fade-in">
            <form onSubmit={handleSearch} className="flex items-center relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full border border-gray-700 bg-gray-900 text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 w-4 h-4 text-gray-500" />
            </form>
            <Link to="/" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-200 font-medium">Inicio</Link>
            <Link to="/catalog" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-200 font-medium">Catálogo</Link>
            {currentUser ? (
              <>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-300">Mi Perfil</Link>
                <Link to="/orders" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-300">Mis Pedidos</Link>
                <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-300">Favoritos</Link>
                <Link to="/addresses" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-300">Mis Direcciones</Link>
                {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)} className="block py-2 text-primary-500 font-medium">Administración</Link>}
                <button onClick={handleLogout} className="block w-full text-left py-2 text-red-400">Cerrar Sesión</button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-outline flex-1 text-center text-sm">Ingresar</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 text-center text-sm">Registrarse</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
