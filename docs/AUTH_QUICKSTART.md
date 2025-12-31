# Quick Authentication Testing Guide

## 5-Minute Setup

### 1. Run the Development Server
```bash
npm run dev
```

### 2. Visit the Application
- Home: `http://localhost:3000`
- Login: `http://localhost:3000/login`
- Signup: `http://localhost:3000/signup`
- Dashboard: `http://localhost:3000/dashboard` (requires login)

### 3. Test Account
- **Email**: test@example.com
- **Password**: password

## Testing Flows

### Test 1: Sign Up New Account
1. Go to `/signup`
2. Enter email: `newuser@example.com`
3. Enter password: `password123`
4. Confirm password: `password123`
5. Click "Create Account"
6. ✅ Should redirect to dashboard with user info

### Test 2: Login with Demo Account
1. Go to `/login`
2. Email: `test@example.com`
3. Password: `password`
4. Click "Login"
5. ✅ Should redirect to dashboard

### Test 3: Protected Route
1. Logout from dashboard
2. Try to access `http://localhost:3000/dashboard`
3. ✅ Should redirect to login page

### Test 4: Form Validation
1. Go to `/signup`
2. Leave fields empty and click submit
3. ✅ Should show validation errors

### Test 5: Invalid Credentials
1. Go to `/login`
2. Enter valid email but wrong password
3. ✅ Should show "Incorrect password" error

## Features to Test

- [ ] Sign up with new email
- [ ] Login with existing email
- [ ] Password visibility toggle
- [ ] Form validation errors
- [ ] Protected route redirection
- [ ] User information display
- [ ] Logout functionality
- [ ] Responsive design on mobile
- [ ] Error message display
- [ ] Loading states

## File Structure

```
src/
├── app/
│   ├── login/page.tsx         # Login page
│   ├── signup/page.tsx        # Signup page
│   ├── dashboard/page.tsx     # Protected dashboard
│   └── page.tsx               # Home page
├── components/
│   ├── Navbar.tsx             # Auth-aware navigation
│   └── ProtectedRoute.tsx     # Route protection wrapper
└── lib/
    └── hooks/
        └── useAuth.ts         # Authentication hook
```

## Next Steps

1. **Customize Dashboard**: Edit `src/app/dashboard/page.tsx`
2. **Add Features**: Create new protected pages
3. **Firebase Setup**: Enable more auth providers
4. **Security Rules**: Configure Firestore security

## Useful URLs

- Home: http://localhost:3000/
- Signup: http://localhost:3000/signup
- Login: http://localhost:3000/login
- Dashboard: http://localhost:3000/dashboard
- Dev Server: http://localhost:3000

## Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type check
npm run type-check
```

## Troubleshooting

**Cannot login even with correct credentials?**
- Check if `.env.local` has valid Firebase credentials
- Ensure Firebase project allows email/password auth
- Check browser console for errors

**Logout not working?**
- Make sure you're using the logout button in the navbar
- Check browser console for errors

**Pages not loading?**
- Check if dev server is running (`npm run dev`)
- Try clearing browser cache
- Check browser console for errors

**Form validation not working?**
- Ensure JavaScript is enabled
- Check if validators in `src/utils/validators.ts` are imported

## Firebase Console

Visit: https://console.firebase.google.com/

1. Select your project
2. Go to Authentication section
3. View created users
4. Test security rules

## Support

For detailed authentication documentation, see: `AUTHENTICATION.md`
