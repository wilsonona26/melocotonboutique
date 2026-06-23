# Melocoton Boutique 🍑

Production-ready ecommerce platform built with React, TypeScript, Firebase, and Tailwind CSS.

## Features

### 🛍️ Customer Features
- Product catalog with categories, search, and filters
- Shopping cart with real-time updates
- Wishlist / Favorites
- Multiple shipping addresses
- Order tracking and history
- User notifications
- Secure checkout with coupon support

### 👔 Admin Features
- **Dashboard**: Total sales, orders, customers, revenue statistics, best-selling products, recent orders, low stock alerts
- **Product Management**: Create, edit, delete products with multiple images
- **Product Import**: CSV import, bulk stock update, bulk price update, template download, duplicate detection, validation preview
- **AI Product Generator**: Upload image → generate title, description, Instagram text, WhatsApp message, SEO content, category/tag suggestions
- **Inventory Management**: Stock tracking, movement logs, low stock alerts, automatic stock reduction on purchase, restoration on cancellation
- **Order Management**: View, update status, tracking numbers, CSV export
- **Marketing**: Promotional banners, coupon system (percentage/fixed discounts, expiration, usage limits)
- **User Management**: View all users, assign roles, activate/deactivate accounts
- **Audit Logs**: Full history of admin actions

### 🔐 Role-Based Access Control (RBAC)

| Role | Access Level |
|------|-------------|
| **CUSTOMER** | Register, login, view products, cart, checkout, own orders/profile |
| **STAFF** | Admin dashboard, view products, update stock, view/update orders |
| **ADMIN** | Full product CRUD, images, inventory, orders, banners, coupons, reports, import |
| **SUPER_ADMIN** | Everything + manage users, assign roles, audit logs, all settings |

### 🔒 Security
- Firebase Authentication
- Route protection by role
- Permission-based UI (menu items hidden based on role)
- Input validation
- Firestore security rules
- Audit logging for sensitive operations

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build**: Vite
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Routing**: React Router v7
- **Icons**: Heroicons
- **CSV Parsing**: PapaParse
- **AI**: OpenAI Vision API (optional)

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm 9+
- Firebase project

### 1. Clone & Install

```bash
git clone https://github.com/wilsonona26/melocotonboutique.git
cd melocotonboutique
npm install
```

### 2. Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password provider)
3. Enable **Cloud Firestore**
4. Enable **Firebase Storage**
5. Copy your Firebase config values

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |
| `VITE_ADMIN_EMAIL` | Email that gets SUPER_ADMIN role on registration |
| `VITE_OPENAI_API_KEY` | (Optional) OpenAI API key for AI product generator |

### 4. Firestore Security Rules

Deploy these rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (
        request.auth.uid == userId ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['ADMIN', 'SUPER_ADMIN']
      );
    }
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['ADMIN', 'SUPER_ADMIN'];
    }
    match /orders/{orderId} {
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['STAFF', 'ADMIN', 'SUPER_ADMIN']
      );
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['STAFF', 'ADMIN', 'SUPER_ADMIN'];
    }
    match /inventoryMovements/{docId} {
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['STAFF', 'ADMIN', 'SUPER_ADMIN'];
    }
    match /banners/{bannerId} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['ADMIN', 'SUPER_ADMIN'];
    }
    match /coupons/{couponId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['ADMIN', 'SUPER_ADMIN'];
    }
    match /wishlist/{docId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    match /addresses/{docId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    match /notifications/{docId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if request.auth != null;
    }
    match /auditLogs/{docId} {
      allow read: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'SUPER_ADMIN';
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['ADMIN', 'SUPER_ADMIN'];
    }
  }
}
```

### 5. Run Development Server

```bash
npm run dev
```

### 6. Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── admin/          # Admin UI components
│   ├── common/         # Shared components (AdminRoute, ProtectedRoute, etc.)
│   └── customer/       # Customer-facing components
├── context/
│   ├── AuthContext.tsx  # Authentication & RBAC context
│   └── CartContext.tsx  # Shopping cart state
├── firebase/
│   ├── config.ts       # Firebase initialization
│   ├── auth.ts         # Authentication functions
│   ├── products.ts     # Product CRUD
│   ├── productImport.ts # CSV import, bulk operations
│   ├── aiGenerator.ts  # AI product content generator
│   ├── orders.ts       # Order management
│   ├── inventory.ts    # Inventory movements
│   ├── storage.ts      # Image upload/delete
│   ├── banners.ts      # Promotional banners
│   ├── coupons.ts      # Coupon system
│   ├── wishlist.ts     # Customer wishlist
│   ├── addresses.ts    # Saved addresses
│   ├── users.ts        # User management
│   ├── audit.ts        # Audit logging
│   └── notifications.ts # Notification system
├── pages/
│   ├── admin/          # Admin pages
│   └── *.tsx           # Customer pages
├── types/
│   └── index.ts        # TypeScript interfaces & RBAC definitions
└── utils/
    ├── formatters.ts   # Price/date formatting
    └── validators.ts   # Input validation
```

## CSV Import Template

Download from admin panel or use this format:

```csv
sku,code,name,description,category,brand,publicPrice,wholesalePrice,stock,featured,active,color,size
SKU001,CODE001,Product Name,Description,Ropa,BrandX,29.99,19.99,100,false,true,Rojo,M
```

## License

Private - All rights reserved.
