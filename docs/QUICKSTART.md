# Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Copy your credentials to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=myapp.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=myapp-123456
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=myapp.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc123
```

### 3. Enable Authentication

In Firebase Console:
- Build → Authentication
- Click "Get started"
- Enable "Email/Password"

### 4. Enable Firestore

In Firebase Console:
- Build → Firestore Database
- Click "Create database"
- Select "us-central1"
- Start in test mode (for development)

### 5. Start Development

```bash
npm run dev
```

Visit `http://localhost:3000` 🎉

## Common First Steps

### Create a New Page

```typescript
// src/app/my-page/page.tsx
export default function MyPage() {
  return (
    <div className="container py-5">
      <h1>My Page</h1>
    </div>
  )
}
```

### Add a Database Collection

```typescript
// Use this in a component
import { useFirestore } from '@/lib/hooks/useFirestore'

export default function Users() {
  const { data, create, read } = useFirestore('users')

  return (
    <div>
      {data.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}
```

### Create a Protected Page

```typescript
// src/app/protected/page.tsx
'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading])

  if (!user) return null

  return <div>Welcome {user.email}</div>
}
```

### Create a Form Component

```typescript
// src/components/ContactForm.tsx
'use client'

import { useState } from 'react'
import { isEmail } from '@/utils/validators'

export default function ContactForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isEmail(email)) {
      alert('Invalid email')
      return
    }

    // Submit form...
    console.log({ email, message })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message"
      />
      <button type="submit" className="btn btn-primary">
        Send
      </button>
    </form>
  )
}
```

## Useful Commands

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm run start

# Lint
npm run lint

# Type check
npm run type-check
```

## Project Structure

```
m app/
├── src/
│   ├── app/              # Pages (Next.js App Router)
│   ├── components/       # Reusable components
│   ├── lib/              # Firebase, hooks, services
│   ├── styles/           # Global CSS
│   └── utils/            # Helper functions
├── public/               # Static files & PWA icons
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Next Steps

1. Read [DEVELOPMENT.md](DEVELOPMENT.md) for detailed usage
2. Check [README.md](README.md) for full documentation
3. See [DEPLOYMENT.md](DEPLOYMENT.md) when ready to deploy
4. Visit [Firebase Console](https://console.firebase.google.com)
5. Check [Next.js Docs](https://nextjs.org/docs)

## Need Help?

- Check existing code in `src/` for examples
- Read error messages carefully
- Check Firebase Console for auth/database issues
- Review `.env.local.example` for required variables

## Tips

✅ **Do:**
- Use TypeScript for type safety
- Create components for reusable UI
- Keep business logic in hooks
- Use Tailwind for styling
- Test authentication flow

❌ **Don't:**
- Commit `.env.local` to Git
- Use Bootstrap and Tailwind on same element
- Mix client and server components incorrectly
- Store sensitive data in browser

---

**You're all set! Happy coding! 🚀**
