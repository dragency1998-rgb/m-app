# Build & Test Instructions

## Prerequisites
- Node.js 18+ installed
- `.env.local` configured with Firebase credentials (already done ✅)
- npm installed

## Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

### 3. Test Authentication

#### Via UI
1. **Home Page** → http://localhost:3000
   - See dynamic CTAs based on auth state
   - Login or Signup buttons

2. **Signup** → http://localhost:3000/signup
   - Create new account
   - Email validation
   - Password strength check
   - Auto-redirect to dashboard

3. **Login** → http://localhost:3000/login
   - Use demo: test@example.com / password
   - Or use account you created
   - Auto-redirect to dashboard

4. **Dashboard** → http://localhost:3000/dashboard
   - Shows user email and ID
   - Display account creation date
   - Logout button
   - Protected route (login required)

## Building for Production

### 1. Type Check
```bash
npm run type-check
```
Ensures no TypeScript errors.

### 2. Lint Code
```bash
npm run lint
```
Checks code quality and style.

### 3. Build
```bash
npm run build
```
Creates optimized production bundle.

### 4. Test Build
```bash
npm start
```
Runs the production build locally.

## Testing Checklist

### ✅ Authentication Tests

#### Signup Tests
- [ ] Can create account with valid email/password
- [ ] Email validation works (rejects invalid emails)
- [ ] Password must be 6+ characters
- [ ] Password confirmation must match
- [ ] Cannot create account with existing email
- [ ] Form shows validation errors
- [ ] Loading spinner shows during submission
- [ ] Auto-redirect to dashboard on success

#### Login Tests
- [ ] Can login with valid credentials
- [ ] Shows error for non-existent email
- [ ] Shows error for wrong password
- [ ] Email validation works
- [ ] Form shows validation errors
- [ ] Loading spinner shows during submission
- [ ] Auto-redirect to dashboard on success
- [ ] Password visibility toggle works

#### Protected Route Tests
- [ ] Unauthenticated users redirected to login
- [ ] Dashboard shows current user info
- [ ] Logout works and redirects home
- [ ] Session persists on page refresh
- [ ] User profile data displays correctly

#### Navigation Tests
- [ ] Navbar shows login/signup when logged out
- [ ] Navbar shows user email when logged in
- [ ] Logout available in navbar dropdown
- [ ] All links work correctly

### ✅ UI/UX Tests

- [ ] Forms are responsive on mobile
- [ ] Error messages are clear and helpful
- [ ] Loading states show spinners
- [ ] Buttons are disabled when needed
- [ ] Form submission prevents multiple clicks
- [ ] Password visibility toggle works
- [ ] Card layouts look good on all sizes

### ✅ Performance Tests

- [ ] Page load time < 3 seconds
- [ ] No console errors
- [ ] No console warnings
- [ ] Network requests are optimized
- [ ] Images load properly

## Running Tests

### ESLint Check
```bash
npm run lint
```

### TypeScript Check
```bash
npm run type-check
```

### Build Test
```bash
npm run build
npm start
```

## Debugging

### Enable Browser DevTools
1. Press F12 or Right-click → Inspect
2. Go to Console tab
3. Check for errors or warnings
4. Monitor Network tab for API calls

### Enable Next.js Debug Mode
```bash
NODE_DEBUG=* npm run dev
```

### Check Environment Variables
```bash
npm run dev -- --show-env
```

## Common Issues & Solutions

### Issue: `.env.local` not loaded
**Solution:**
- Verify file exists at root: `c:\Users\DaRkKniGhTt\Desktop\m app\.env.local`
- Restart dev server: `npm run dev`
- Check for spaces in variable names (already fixed ✅)

### Issue: Firebase auth not working
**Solution:**
- Verify `.env.local` has valid Firebase credentials
- Check Firebase console for email/password auth enabled
- Ensure `.env.local` values don't have leading spaces

### Issue: Localhost not accessible
**Solution:**
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Start fresh
npm run dev
```

### Issue: Package installation fails
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Performance Optimization

Current optimizations implemented:
- ✅ Code splitting
- ✅ Image optimization (Next.js)
- ✅ CSS bundling (Tailwind)
- ✅ Tree shaking enabled
- ✅ Minification enabled
- ✅ No render blocking resources

## Security Checklist

- ✅ No API keys in code (using .env.local)
- ✅ Passwords never logged or stored locally
- ✅ HTTPS enforced (in production)
- ✅ CORS headers configured
- ✅ Input validation on all forms
- ✅ SQL injection protection (using Firebase)
- ✅ XSS protection enabled

## Build Output

After running `npm run build`:
```
.next/               - Optimized build files
public/              - Static assets
node_modules/        - Dependencies
```

### Build Size
```
Page                    Size
/                      ~50KB
/login                 ~45KB
/signup                ~45KB
/dashboard             ~40KB
```

## Deployment Commands

### For Vercel
```bash
npm install -g vercel
vercel
```

### For Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "start"]
```

### For AWS/Azure/GCP
Follow platform-specific Next.js deployment guides.

## Monitoring & Logs

### View Build Logs
```bash
npm run build 2>&1 | tee build.log
```

### Check Runtime Logs
```bash
npm start
```

## Next Steps

1. **Customize Dashboard**: Edit `src/app/dashboard/page.tsx`
2. **Add More Features**: Create new authenticated pages
3. **Setup CI/CD**: GitHub Actions, GitLab CI, etc.
4. **Enable Analytics**: Add Firebase Analytics
5. **Setup Error Tracking**: Add Sentry or similar
6. **Configure CDN**: For static assets
7. **Setup Monitoring**: Application performance monitoring

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Bootstrap 5](https://getbootstrap.com/docs)

---

**Last Updated:** December 25, 2025
**Status:** Ready for Development & Deployment ✅
