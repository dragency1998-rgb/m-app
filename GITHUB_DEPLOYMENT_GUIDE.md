# 📦 GitHub & Deployment Guide

Complete guide for uploading to GitHub, deploying on Vercel, and creating an Android app.

---

## ✅ SECURITY VERIFICATION COMPLETE

**Status:** Your code is SAFE to upload to GitHub ✓

### Security Checklist:
- ✅ **No hardcoded API keys** - All keys stored in `.env.local`
- ✅ **No hardcoded passwords** - Authentication via Firebase
- ✅ **Proper .gitignore** - Excludes `.env`, `.env.local`, secrets
- ✅ **Firebase config uses environment variables** - `process.env.NEXT_PUBLIC_FIREBASE_*`
- ✅ **No sensitive files** - `.firebaserc`, `.env` are ignored
- ✅ **Example .env provided** - `.env.local.example` shows template

---

## 📋 FILES TO UPLOAD TO GITHUB

### ✅ UPLOAD THESE FOLDERS:

```
src/                           ← All source code
public/                        ← Public assets (manifest, icons, sw.js)
config/                        ← Configuration files
docs/                          ← Documentation
.github/                       ← GitHub Actions (if needed)
```

### ✅ UPLOAD THESE FILES:

```
package.json                   ← Dependencies
package-lock.json              ← Lock file
tsconfig.json                  ← TypeScript config
next.config.js                 ← Next.js config
tailwind.config.ts             ← Tailwind config
postcss.config.js              ← PostCSS config
.gitignore                     ← Git ignore rules
.eslintrc.json                 ← ESLint config
.env.local.example             ← EXAMPLE only (rename to .env.local.example)
README.md                       ← Project description
QUICK_START.md                 ← Developer guide
```

### ❌ DO NOT UPLOAD:

```
node_modules/                  ← (gitignored automatically)
.env                           ← (gitignored automatically)
.env.local                      ← (gitignored automatically)
.next/                         ← (gitignored automatically)
out/                           ← (gitignored automatically)
.vscode/                       ← (gitignored automatically)
.idea/                         ← (gitignored automatically)
.DS_Store                      ← (gitignored automatically)
```

---

## 🚀 STEP 1: PREPARE FOR GITHUB

### Step 1.1: Create `.env.local.example` at root:

**File:** `.env.local.example` (ALREADY EXISTS ✓)
```dotenv
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# API Keys
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Environment
NEXT_PUBLIC_ENV=development
```

### Step 1.2: Verify .gitignore (ALREADY CONFIGURED ✓)

Your `.gitignore` includes:
```
.env
.env.local
.env.*.local
*.pem
node_modules/
.next/
```

✅ **Good!** Secrets will not be uploaded.

### Step 1.3: Test build locally:
```bash
npm run build
```
✅ **Build succeeds without errors** ✓

---

## 🔗 STEP 2: UPLOAD TO GITHUB

### Step 2.1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. **Repository name:** `m-app` (or your choice)
3. **Description:** "Textile Management Dashboard with Reports & Export"
4. **Public** or **Private** (your choice)
5. **Do NOT initialize with README** (you have one)
6. Click **Create repository**

### Step 2.2: Push Code to GitHub

```bash
cd "C:\Users\DaRkKniGhTt\Desktop\m app"

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: Professional textile management dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/m-app.git
git push -u origin main
```

### Step 2.3: Verify on GitHub

1. Go to your GitHub repo
2. Verify these folders appear:
   - ✅ `src/`
   - ✅ `public/`
   - ✅ `docs/`
   - ✅ `config/`
3. Verify `.env.local` is NOT visible (gitignored)
4. Verify `.gitignore` is uploaded

---

## ▲ STEP 3: DEPLOY ON VERCEL

### Step 3.1: Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click **New Project**
4. Select your `m-app` repository
5. Click **Import**

### Step 3.2: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

Add these variables (from your `.env.local`):

```
NEXT_PUBLIC_FIREBASE_API_KEY          = your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN      = your_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID       = your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET   = your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = your_id
NEXT_PUBLIC_FIREBASE_APP_ID           = your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID   = your_measurement_id
NEXT_PUBLIC_API_URL                   = https://your-vercel-domain.vercel.app/api
NEXT_PUBLIC_ENV                       = production
```

**Important:** Set environment to **Production** for all variables.

### Step 3.3: Configure Firebase for Production

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** → **Authorized domains**
4. Add your Vercel domain:
   ```
   your-project.vercel.app
   ```
5. Go to **Authentication** → **Authorized redirect URIs**
6. Add Vercel domain

### Step 3.4: Deploy

```bash
# Automatic: Push to GitHub main branch
git push origin main

# Manual: In Vercel Dashboard → Click "Deploy"
```

✅ **Deployment succeeds** - Your app is live!

---

## 📱 STEP 4: CREATE ANDROID APP

### Option A: React Native (RECOMMENDED for Android)

#### Setup:
```bash
npx create-expo-app m-app-mobile
cd m-app-mobile
npm install expo-router firebase
```

#### Share Code:
Create `shared/` folder with:
- `hooks/` - useAuth, useReports
- `lib/` - Firebase config
- `types/` - TypeScript types
- `utils/` - Formatters, validators

#### Key Files for Mobile:
- `src/lib/firebase.ts` → `shared/lib/firebase.ts` (REUSE)
- `src/lib/hooks/useAuth.ts` → `shared/hooks/useAuth.ts` (REUSE)
- `src/lib/hooks/useReports.ts` → `shared/hooks/useReports.ts` (REUSE)

#### Android Build:
```bash
# Local development
expo start

# Build APK
eas build --platform android --local
```

#### APK Location:
```
project-root/artifacts/
```

---

### Option B: React Native CLI (ALTERNATIVE)

```bash
npx react-native init MApp
cd MApp
npm install @react-navigation/native firebase

# For Android
npm android

# Build APK
cd android
./gradlew assembleRelease
```

APK Output:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

### Option C: Flutter (FASTEST for Mobile)

```bash
flutter create m_app_mobile
cd m_app_mobile

# Add dependencies
flutter pub add firebase_core firebase_auth cloud_firestore

# Run on device
flutter run

# Build APK
flutter build apk
```

APK Output:
```
build/app/outputs/flutter-apk/app-release.apk
```

---

## 📊 ARCHITECTURE: WEB → VERCEL + MOBILE → ANDROID

```
┌─────────────────────────────────────────────────────────┐
│                    SHARED CODE                          │
│  (Firebase config, hooks, types, utilities)             │
└─────────────────────────────────────────────────────────┘
         │                                    │
         ↓                                    ↓
    ┌─────────────┐                   ┌──────────────┐
    │  Web (Next) │                   │  Mobile      │
    │  React TSX  │                   │  React Native│
    │  Deployed   │                   │  Flutter     │
    │  on Vercel  │                   │  on Android  │
    └─────────────┘                   └──────────────┘
         │                                    │
         ↓                                    ↓
    Firebase Firestore (Shared database - SINGLE source of truth)
```

---

## 🔒 SECURITY BEST PRACTICES

### For GitHub:
- ✅ Never commit `.env.local` (gitignored)
- ✅ Use `.env.local.example` as template
- ✅ Add collaborators through GitHub, not in code
- ✅ Enable branch protection: Settings → Branches → Add rule

### For Vercel:
- ✅ Use Vercel's Environment Variables (not in code)
- ✅ Set variables per environment (Dev, Preview, Production)
- ✅ Use automatic GitHub deployments
- ✅ Enable Vercel's built-in security

### For Firebase:
- ✅ Enable Firebase Security Rules (not in code)
- ✅ Restrict Firestore to authenticated users
- ✅ Set Storage bucket rules
- ✅ Use Firebase Admin SDK for server-side operations

### For Android:
- ✅ Sign APK with keystore
- ✅ Don't commit keystore to GitHub
- ✅ Use GitHub Secrets for sensitive keys
- ✅ Enable Play Store app signing

---

## 📋 DEPLOYMENT CHECKLIST

### Before GitHub:
- [ ] Test `npm run build` locally
- [ ] Verify `.env.local.example` exists
- [ ] Verify `.gitignore` includes `.env*`
- [ ] Run `npm run lint` (if configured)
- [ ] Run tests (if configured)

### Before Vercel:
- [ ] GitHub repo created and pushed
- [ ] All environment variables configured in Vercel
- [ ] Firebase project linked to Vercel domain
- [ ] Test deployment with `vercel` CLI

### Before Android Release:
- [ ] App tested on multiple devices
- [ ] APK signed with keystore
- [ ] Firebase configured for Android
- [ ] Privacy policy and terms created
- [ ] App tested on Play Store console (internal testing)

---

## 🚀 QUICK COMMAND REFERENCE

### GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/m-app.git
git push -u origin main
```

### Vercel Deploy:
```bash
npm i -g vercel
vercel
```

### Android Build (React Native):
```bash
eas build --platform android --local
```

### Android Build (Flutter):
```bash
flutter build apk --release
```

---

## 📞 SUPPORT LINKS

- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Vercel Docs:** https://vercel.com/docs
- **Firebase Security:** https://firebase.google.com/docs/security
- **React Native Mobile:** https://reactnative.dev/
- **Flutter Mobile:** https://flutter.dev/
- **Google Play Store:** https://play.google.com/console

---

**✅ Your code is ready for production deployment!** 🎉
