# Authentication Setup & Usage Guide

## Overview
This application uses Firebase Authentication with email/password support. The authentication system is fully integrated and mandatory for accessing protected routes.

## Features
- ✅ Email/Password Authentication
- ✅ Secure Password Validation
- ✅ Protected Dashboard Routes
- ✅ Real-time User State Management
- ✅ Automatic Session Handling
- ✅ Error Messages & User Feedback

## Authentication Endpoints

### 1. Login Page (`/login`)
- Email validation
- Password validation (minimum 6 characters)
- Error handling for failed login attempts
- Toggle password visibility
- Link to signup page

### 2. Signup Page (`/signup`)
- Email validation
- Password strength checking (minimum 6 characters)
- Password confirmation
- Error messages for weak passwords
- Link to login page

### 3. Dashboard (`/dashboard`)
- Protected route - requires authentication
- Displays user email and profile info
- Shows account creation date
- Logout functionality
- Responsive design

## How Authentication Works

### useAuth Hook
Located in `src/lib/hooks/useAuth.ts`, provides:
```typescript
const { user, loading, error, login, signup, logout, isAuthenticated } = useAuth()
```

**Properties:**
- `user`: Current Firebase user object
- `loading`: Loading state during auth check
- `error`: Error message if authentication fails
- `isAuthenticated`: Boolean indicating if user is logged in

**Methods:**
- `login(email, password)`: Sign in with email/password
- `signup(email, password)`: Create new account
- `logout()`: Sign out user

### Protected Routes
Routes like `/dashboard` automatically redirect unauthenticated users to `/login`.

## Demo Account
For testing purposes:
- **Email:** test@example.com
- **Password:** password

## Creating User Accounts

### Programmatically
```typescript
import { useAuth } from '@/lib/hooks/useAuth'

export function MyComponent() {
  const { signup } = useAuth()

  const handleSignup = async () => {
    try {
      await signup('user@example.com', 'password123')
      // User is now registered and logged in
    } catch (error) {
      console.error('Signup failed:', error)
    }
  }

  return <button onClick={handleSignup}>Sign Up</button>
}
```

### Via UI
1. Go to `/signup`
2. Enter email and password
3. Submit form
4. User is automatically redirected to `/dashboard`

## Login Flow

```typescript
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password)
      router.push('/dashboard') // Redirect after login
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      handleLogin(email, password)
    }}>
      {/* Form fields */}
    </form>
  )
}
```

## Protecting Routes

To protect a route and ensure only authenticated users can access it:

```typescript
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
  }, [user, loading, router])

  if (loading) return <LoadingSpinner />
  if (!user) return null

  return <div>Welcome {user.email}!</div>
}
```

## Logout
```typescript
import { useAuth } from '@/lib/hooks/useAuth'

export function LogoutButton() {
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      // User is logged out, redirect as needed
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return <button onClick={handleLogout}>Logout</button>
}
```

## Error Handling

The authentication system handles these errors:
- **auth/user-not-found**: Email doesn't exist
- **auth/wrong-password**: Incorrect password
- **auth/email-already-in-use**: Email already registered
- **auth/weak-password**: Password too weak
- **auth/too-many-requests**: Too many login attempts

## Best Practices

1. **Always validate input**: Use the validators in `src/utils/validators.ts`
2. **Show loading states**: Display spinners during auth operations
3. **Handle errors gracefully**: Show user-friendly error messages
4. **Protect sensitive routes**: Use the `useAuth` hook to check authentication
5. **Secure storage**: Never store passwords in localStorage
6. **Session management**: Firebase handles sessions automatically

## Firebase Configuration

Required environment variables in `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Security Notes

- All passwords are hashed by Firebase
- Session tokens are handled automatically
- HTTPS is recommended in production
- Never expose API keys in code (use environment variables)
- Enable Firebase security rules in production

## Testing Authentication

### Manual Testing Checklist
- [ ] Can create new account
- [ ] Can login with valid credentials
- [ ] Cannot login with invalid password
- [ ] Cannot login with non-existent email
- [ ] Dashboard requires authentication
- [ ] Can logout successfully
- [ ] Protected pages redirect to login when not authenticated
- [ ] Form validation works on signup
- [ ] Error messages display correctly
- [ ] Responsive design on mobile devices

## Troubleshooting

**Issue**: Firebase auth not initializing
- **Solution**: Check `.env.local` variables are correct

**Issue**: Login fails even with correct credentials
- **Solution**: Verify Firebase project settings and enabled auth methods

**Issue**: Users stay logged in after page refresh
- **Solution**: This is expected behavior (Firebase handles sessions)

**Issue**: Logout doesn't redirect
- **Solution**: Ensure `router.push()` is called after logout

## Next Steps

1. Customize the dashboard with your features
2. Add more authentication providers (Google, GitHub, etc.)
3. Implement password reset functionality
4. Add email verification
5. Set up Firebase security rules
6. Configure custom claim authorization
