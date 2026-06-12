# 🍑 Melocoton Boutique

Ecommerce production-ready para Melocoton Boutique — una boutique de moda latinoamericana.

## ✨ Características
- Catálogo de productos con filtros y búsqueda
- Carrito de compras persistente (localStorage)
- Checkout multi-paso + pago con tarjeta (validación Luhn)
- Historial de pedidos por usuario
- Panel de administración completo (productos, inventario, pedidos)
- Firebase Auth, Firestore, Storage
- UI peach/coral con Tailwind CSS

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

## 👑 Admin
Configura `VITE_ADMIN_EMAIL` en `.env` con el correo del administrador. El primer registro con ese correo obtendrá rol `admin`.

## 📱 Contacto
- Instagram: [@melocoton_boutique22](https://www.instagram.com/melocoton_boutique22/)
- WhatsApp: 0984341786

## 🌐 Deploy en Vercel
```bash
npm i -g vercel
vercel --prod
```
Agrega las variables de entorno en el dashboard de Vercel.
