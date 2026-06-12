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
- Sistema de cupones y descuentos (porcentaje o monto fijo)

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

# 5. Preview local del build
npm run preview
```

## 🔥 Firebase Setup
1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilita Authentication (Email/Password)
3. Crea una base de datos Firestore
4. Habilita Firebase Storage
5. Copia las credenciales al `.env`

### Variables de Entorno (.env)
```
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_ADMIN_EMAIL=admin@tutienda.com
```

### Colecciones de Firestore
- `products` - Catálogo de productos
- `orders` - Pedidos realizados
- `coupons` - Cupones de descuento
- `banners` - Banners promocionales
- `wishlist` - Favoritos de usuarios
- `addresses` - Direcciones guardadas
- `inventoryMovements` - Historial de inventario

### Reglas de Seguridad de Firestore (Recomendadas)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products: anyone can read, only admin can write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'ADMIN_EMAIL';
    }
    // Orders: users can read their own, admin can read all
    match /orders/{orderId} {
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || request.auth.token.email == 'ADMIN_EMAIL');
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.token.email == 'ADMIN_EMAIL';
    }
    // Wishlist: users can read/write their own
    match /wishlist/{docId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    // Addresses: users can read/write their own
    match /addresses/{docId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    // Coupons/Banners: anyone can read, only admin can write
    match /coupons/{docId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'ADMIN_EMAIL';
    }
    match /banners/{docId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'ADMIN_EMAIL';
    }
    match /inventoryMovements/{docId} {
      allow read: if request.auth != null && request.auth.token.email == 'ADMIN_EMAIL';
      allow write: if request.auth != null && request.auth.token.email == 'ADMIN_EMAIL';
    }
  }
}
```

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

## 🌐 Deployment

### Opción 1: Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy a producción
vercel --prod
```
1. Agrega **todas** las variables de entorno del `.env` en el dashboard de Vercel (Settings → Environment Variables)
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`

### Opción 2: Firebase Hosting
```bash
# Instalar Firebase CLI
npm i -g firebase-tools

# Login y inicializar
firebase login
firebase init hosting
# Seleccionar directorio: dist
# SPA: Yes
# No sobrescribir index.html

# Build y deploy
npm run build
firebase deploy --only hosting
```

### Opción 3: Netlify
1. Conectar repositorio en [Netlify](https://app.netlify.com)
2. Build Command: `npm run build`
3. Publish Directory: `dist`
4. Agregar variables de entorno en Site Settings → Environment Variables
5. Agregar archivo `public/_redirects` con: `/* /index.html 200`

### Post-Deployment Checklist
- [ ] Configurar variables de entorno en plataforma de hosting
- [ ] Verificar que Firebase Auth domain incluye el dominio de producción
- [ ] Agregar dominio de producción en Firebase Console → Authentication → Settings → Authorized Domains
- [ ] Configurar reglas de seguridad de Firestore (ver sección arriba)
- [ ] Configurar reglas de Firebase Storage para permitir lectura pública de imágenes
- [ ] Registrar cuenta admin con el email configurado en `VITE_ADMIN_EMAIL`
- [ ] Verificar login, registro, y checkout completo en producción
- [ ] Configurar dominio personalizado (opcional)

## 📱 Contacto
- Instagram: [@melocoton_boutique22](https://www.instagram.com/melocoton_boutique22/)
- WhatsApp: 0984341786
