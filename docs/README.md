# Professional Next.js Application

A production-ready Next.js application with TypeScript, Tailwind CSS, Bootstrap 5, Firebase integration, and Progressive Web App (PWA) capabilities.

## 🚀 Features

- **Next.js 14** - Latest React framework with App Router
- **TypeScript** - Full type safety for better development
- **Tailwind CSS** - Utility-first CSS framework
- **Bootstrap 5** - Comprehensive UI components
- **Firebase** - Real-time database, authentication, and storage
- **PWA** - Progressive Web App capabilities for offline support
- **Responsive Design** - Mobile-first approach
- **Authentication** - Firebase authentication with custom hooks
- **Database Operations** - Generic Firestore CRUD utilities
- **ESLint** - Code quality and consistency

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Firebase project (create at [firebase.google.com](https://firebase.google.com))
- Modern web browser with PWA support

## 🛠️ Installation

### 1. Clone or Extract the Project

```bash
cd "m app"
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Get your Firebase config from Project Settings
3. Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

4. Update `.env.local` with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 🚀 Getting Started

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # Root layout with PWA setup
│   ├── page.tsx           # Home page
│   ├── login/             # Authentication pages
│   ├── signup/
│   └── dashboard/         # Protected dashboard
├── components/            # Reusable React components
│   └── Navbar.tsx        # Navigation component
├── lib/                   # Utilities and services
│   ├── firebase.ts       # Firebase initialization
│   ├── db.ts             # Firestore CRUD operations
│   └── hooks/
│       └── useAuth.ts    # Authentication hook
├── pages/                # API routes (if needed)
├── styles/              # Global styles
│   └── globals.css      # Tailwind + Bootstrap setup
└── utils/               # Helper functions
    └── cn.ts           # Class name utility

public/
├── manifest.json        # PWA manifest
└── icons/              # App icons for PWA
```

## 🔐 Authentication

The app includes a custom `useAuth` hook for Firebase authentication:

```typescript
import { useAuth } from '@/lib/hooks/useAuth'

export default function MyComponent() {
  const { user, loading, login, signup, logout, isAuthenticated } = useAuth()

  // Use authentication state and methods
}
```

## 💾 Database Operations

Use generic Firestore utilities for CRUD operations:

```typescript
import { createDocument, getDocuments, getDocument, updateDocument, deleteDocument } from '@/lib/db'

// Create
const docId = await createDocument('users', { name: 'John' })

// Read
const users = await getDocuments('users')
const user = await getDocument('users', docId)

// Update
await updateDocument('users', docId, { name: 'Jane' })

// Delete
await deleteDocument('users', docId)
```

## 🎨 Styling

The project uses both Tailwind CSS and Bootstrap 5:

- **Tailwind CSS** - Utility classes for custom styling
- **Bootstrap 5** - Pre-built components (navbar, cards, forms, etc.)

To merge Tailwind and Bootstrap classes use the `cn` utility:

```typescript
import { cn } from '@/utils/cn'

export default function Button() {
  return (
    <button className={cn('btn btn-primary', 'hover:shadow-lg')}>
      Click me
    </button>
  )
}
```

## 📱 PWA Features

The app is configured as a PWA with:

- Service Worker support
- App manifest (`manifest.json`)
- Offline capability
- Installable on mobile and desktop
- Push notifications ready

To test PWA features:
1. Build the app: `npm run build`
2. Start production server: `npm run start`
3. Open DevTools → Application → Manifest to see PWA settings

## 🚀 Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

EXPOSE 3000
CMD ["yarn", "start"]
```

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Bootstrap 5](https://getbootstrap.com/docs/5.0/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the MIT License.

## 💡 Tips for Production

1. **Environment Variables** - Keep sensitive data in `.env.local` (never commit)
2. **Firebase Security Rules** - Configure proper Firestore rules
3. **API Rate Limiting** - Implement rate limiting for API routes
4. **CORS** - Configure CORS headers appropriately
5. **Monitoring** - Set up error tracking (Sentry, LogRocket, etc.)
6. **Performance** - Use Next.js Image optimization
7. **Analytics** - Add Firebase Analytics or Google Analytics
8. **SEO** - Implement proper meta tags and structured data

---

**Happy coding! 🎉**
