# 🍑 Melocoton Boutique

Ecommerce production-ready para Melocoton Boutique — una boutique de moda latinoamericana.

## ✨ Características

### 🛍️ Tienda
- Catálogo de productos con filtros y búsqueda
- Carrito de compras persistente (localStorage)
- Checkout multi-paso + pago con tarjeta (validación Luhn)
- Historial de pedidos por usuario
- Productos destacados y featured
- Banners promocionales con slider automático
- Sistema de cupones y descuentos

### 👑 Panel de Administración
- **Dashboard** completo con:
  - Total ventas, pedidos, clientes
  - Estadísticas de ingresos (mensual/semanal)
  - Alertas de stock bajo
  - Pedidos recientes
- **Productos**: múltiples imágenes, variantes (talla/color), SKU, destacados
- **Inventario**: historial de movimientos, logs de stock, ajustes automáticos
- **Pedidos**: tracking de envío, notas, datos del cliente, exportación CSV
- **Marketing**: banners promocionales, cupones de descuento

### 💗 Funciones del Cliente
- Lista de favoritos (wishlist)
- Múltiples direcciones de envío
- Perfil de usuario

### 🎨 UI/UX
- Loading skeletons para mejor percepción de rendimiento
- Toast notifications para feedback inmediato
- Diseño moderno peach/coral con Tailwind CSS
- Optimización móvil completa
- Animaciones suaves

### 🔧 Tecnologías
- React 19 + TypeScript
- Firebase Auth, Firestore, Storage
- Tailwind CSS
- Vite
- React Router v7

## 🚀 Setup

```bash
# 1. Clonar e instalar
npm install

# 2. Crear .env a partir del ejemplo
cp .env.example .env
# Llenar con tus credenciales de Firebase

# 3. Desarrollo
npm run dev

# 4. Build
npm run build
```

## 🔥 Firebase Setup
1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilita Authentication (Email/Password)
3. Crea una base de datos Firestore
4. Habilita Firebase Storage
5. Copia las credenciales al `.env`

### Colecciones de Firestore
- `products` - Catálogo de productos
- `orders` - Pedidos realizados
- `coupons` - Cupones de descuento
- `banners` - Banners promocionales
- `wishlist` - Favoritos de usuarios
- `addresses` - Direcciones guardadas
- `inventoryMovements` - Historial de inventario

## 👑 Admin
Configura `VITE_ADMIN_EMAIL` en `.env` con el correo del administrador. El primer registro con ese correo obtendrá rol `admin`.

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── admin/          # Componentes del panel admin
│   ├── common/         # Componentes compartidos (Toast, Skeleton, etc.)
│   └── customer/       # Componentes de la tienda
├── context/            # React Context (Auth, Cart)
├── firebase/           # Servicios de Firebase
│   ├── addresses.ts    # Direcciones de envío
│   ├── banners.ts      # Banners promocionales
│   ├── coupons.ts      # Cupones de descuento
│   ├── inventory.ts    # Historial de inventario
│   ├── orders.ts       # Gestión de pedidos
│   ├── products.ts     # Gestión de productos
│   ├── storage.ts      # Firebase Storage
│   └── wishlist.ts     # Lista de favoritos
├── pages/              # Páginas de la aplicación
│   ├── admin/          # Páginas del panel admin
│   └── ...             # Páginas del cliente
├── types/              # TypeScript types
└── utils/              # Utilidades (formatters, validators)
```

## 📱 Contacto
- Instagram: [@melocoton_boutique22](https://www.instagram.com/melocoton_boutique22/)
- WhatsApp: 0984341786

## 🌐 Deploy en Vercel
```bash
npm i -g vercel
vercel --prod
```
Agrega las variables de entorno en el dashboard de Vercel.
