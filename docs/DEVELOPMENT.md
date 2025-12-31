# Development Guide

## Getting Started

### Initial Setup

1. **Install Node.js** (18+)
2. **Clone/Extract Project**
3. **Install Dependencies**: `npm install`
4. **Configure Firebase**: Set up `.env.local` with your Firebase credentials
5. **Start Development**: `npm run dev`

## Project Architecture

### App Router Structure (Next.js 14)

```
src/app/
├── layout.tsx          # Root layout with PWA setup
├── page.tsx            # Home page
├── login/              # Login page
├── signup/             # Registration page
└── dashboard/          # Protected dashboard
```

### Component Organization

- **Page Components** - Full page routes in `app/`
- **UI Components** - Reusable in `src/components/`
- **Hooks** - Custom hooks in `src/lib/hooks/`
- **Services** - Business logic in `src/lib/`
- **Utilities** - Helper functions in `src/utils/`

## Key Features & Usage

### 1. Authentication

```typescript
import { useAuth } from '@/lib/hooks/useAuth'

export default function MyPage() {
  const { user, loading, login, logout, isAuthenticated } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/login" />

  return <div>Welcome {user?.email}</div>
}
```

### 2. Firestore Database

```typescript
import { useFirestore } from '@/lib/hooks/useFirestore'
import { where } from '@/lib/db'

export default function UsersList() {
  const { data, loading, create, read, update, remove } = useFirestore('users')

  useEffect(() => {
    read([where('active', '==', true)])
  }, [])

  return (
    <div>
      {data.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}
```

### 3. API Calls

```typescript
import { get, post, put, del } from '@/utils/api'

// Get request
const data = await get('/api/users')

// Post request
const newUser = await post('/api/users', { name: 'John' })

// Put request
await put('/api/users/123', { name: 'Jane' })

// Delete request
await del('/api/users/123')
```

### 4. Form Validation

```typescript
import { isEmail, isStrongPassword } from '@/utils/validators'

if (!isEmail(email)) {
  setError('Invalid email')
}

if (!isStrongPassword(password)) {
  setError('Password too weak')
}
```

### 5. Data Formatting

```typescript
import { formatDate, formatCurrency, truncate } from '@/utils/formatters'

const date = formatDate(new Date()) // Dec 20, 2024
const price = formatCurrency(99.99) // $99.99
const text = truncate('Long text...', 10) // Long te...
```

### 6. Styling

Mix Tailwind and Bootstrap:

```typescript
import { cn } from '@/utils/cn'

export default function Button() {
  return (
    <button className={cn(
      'btn btn-primary',           // Bootstrap
      'hover:shadow-lg transition' // Tailwind
    )}>
      Click me
    </button>
  )
}
```

## Environment Variables

### Development (.env.local)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_ENV=development
```

## Common Tasks

### Add a New Page

1. Create `src/app/page-name/page.tsx`
2. Export default component
3. Add route to navbar if needed

### Add a New Component

1. Create `src/components/ComponentName.tsx`
2. Export component
3. Import where needed

### Add Database Collection

1. Create Firestore collection in Firebase Console
2. Use `useFirestore('collection-name')` hook
3. Implement CRUD operations

### Add API Route

1. Create `src/app/api/route-name/route.ts`
2. Export handler (GET, POST, etc.)
3. Call from client using `/api/route-name`

## Testing

### Run Linting

```bash
npm run lint
```

### Type Checking

```bash
npm run type-check
```

### Build Check

```bash
npm run build
```

## Performance Optimization

1. **Image Optimization** - Use Next.js Image component
2. **Code Splitting** - Components auto-split by route
3. **Tree Shaking** - Unused code removed in build
4. **Minification** - Automatic in production
5. **Caching** - Configure in next.config.js

## Security Best Practices

1. **Environment Variables** - Store secrets in `.env.local`
2. **Firebase Rules** - Secure Firestore with rules
3. **Input Validation** - Always validate user input
4. **CORS** - Configure appropriately
5. **HTTPS** - Use in production
6. **Rate Limiting** - Implement on API routes

## Debugging

### Browser DevTools

1. Open F12
2. Network tab - Check API calls
3. Console - View logs and errors
4. Application - Check PWA/Service Worker

### Firebase Console

1. Go to console.firebase.google.com
2. Monitor Firestore usage
3. Check Authentication logs
4. View Storage files

### Next.js Debug Mode

```bash
DEBUG=* npm run dev
```

## Troubleshooting

### Firebase Not Initializing

- Check `.env.local` variables
- Verify Firebase project exists
- Check console for initialization errors

### Styles Not Applying

- Ensure global.css is imported in layout.tsx
- Check class name syntax (Bootstrap vs Tailwind)
- Clear .next folder and rebuild

### Authentication Not Working

- Verify Firebase auth enabled
- Check email/password auth method in Firebase
- Clear browser cache/cookies

### PWA Not Installing

- Use HTTPS (even localhost works)
- Check manifest.json validity
- Service Worker must register successfully

## Resources

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Bootstrap 5](https://getbootstrap.com/docs/5.0)
- [MDN Web Docs](https://developer.mozilla.org)

---

Happy coding! 🚀
