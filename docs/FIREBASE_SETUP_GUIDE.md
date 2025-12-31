# Setting Up Live Firebase Data for TextileHub Dashboard

## 🔄 The Dashboard Now Connects to Firebase!

Your textile dashboard has been updated to fetch **real-time data from Firebase Firestore** instead of mock data.

## 📊 Required Firestore Collections

Create these collections in Firebase Console and add sample data:

### 1. **invoices** Collection
```json
{
  "invoice": "INV001",
  "date": "2025-01-20",
  "buyer": "Buyer Corp A",
  "mfg": "Mfg Co X",
  "amount": 50000,
  "due": "2025-02-20",
  "status": "UNPAID",
  "ageing": 5
}
```

### 2. **buyerAgeing** Collection
```json
{
  "firm": "Buyer Corp A",
  "total": 500000,
  "notDue": 100000,
  "days0_7": 150000,
  "days8_30": 150000,
  "days60plus": 100000
}
```

### 3. **mfgAgeing** Collection
```json
{
  "firm": "Mfg Co X",
  "total": 400000,
  "notDue": 80000,
  "days0_7": 120000,
  "days8_30": 120000,
  "days60plus": 80000
}
```

### 4. **pendingSauda** Collection
```json
{
  "date": "2025-01-20",
  "quality": "Cotton - Premium",
  "buyer": "Buyer Corp A",
  "mfg": "Mfg Co X",
  "pending": 500,
  "unit": "kg"
}
```

### 5. **completedSauda** Collection
```json
{
  "date": "2025-01-10",
  "quality": "Polyester - Standard",
  "buyer": "Buyer Corp B",
  "mfg": "Mfg Co X",
  "pending": 1000,
  "unit": "kg"
}
```

## 🚀 Steps to Add Data to Firebase

### Option 1: Firebase Console (Easiest)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database**
4. Click **Create Collection**
5. Name it `invoices` and click **Create**
6. Click **Add Document** and paste the sample JSON above
7. Repeat for other collections

### Option 2: Firebase CLI/Script
Create a file `seed-firestore.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const seedData = {
  invoices: [
    {
      invoice: 'INV001',
      date: '2025-01-20',
      buyer: 'Buyer Corp A',
      mfg: 'Mfg Co X',
      amount: 50000,
      due: '2025-02-20',
      status: 'UNPAID',
      ageing: 5,
    },
  ],
  buyerAgeing: [
    {
      firm: 'Buyer Corp A',
      total: 500000,
      notDue: 100000,
      days0_7: 150000,
      days8_30: 150000,
      days60plus: 100000,
    },
  ],
  // ... add other collections
};

Object.entries(seedData).forEach(async ([collection, docs]) => {
  docs.forEach(async (doc) => {
    await db.collection(collection).add(doc);
  });
});
```

## 🔍 How the Dashboard Works Now

### Before (Mock Data)
```
Dashboard → [Hardcoded Sample Data] → Display
```

### Now (Firebase Real-Time)
```
Dashboard → Firebase Firestore → Real-time Listener → Live Updates
```

The dashboard uses `onSnapshot()` which means:
- ✅ **Real-time updates** - Data changes instantly on screen
- ✅ **Live sync** - When you add/edit data in Firestore, dashboard updates
- ✅ **Offline handling** - Shows cached data if offline
- ✅ **Error handling** - Shows permission errors if rules are too restrictive

## ⚡ Testing the Real-Time Sync

1. **Open the dashboard**: `http://localhost:3001/textile-dashboard`
2. **Open Firebase Console** in another browser tab
3. **Edit data** in Firebase Console
4. **Watch the dashboard update** instantly! ✨

## 🔐 Firebase Firestore Security Rules

Your dashboard needs read access. Update your Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read textile data
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == request.resource.data.createdBy;
    }
  }
}
```

## 🐛 Troubleshooting

### Dashboard shows "Loading..." indefinitely
- Check Firebase Firestore rules
- Ensure user is authenticated
- Check browser console for errors (F12)

### No data appears
- Verify collections exist in Firestore
- Check if documents have correct field names
- Try adding data manually in Firebase Console

### "Permission Denied" error
- Update Firestore security rules (see above)
- Or temporarily set rules to: `allow read, write: if true;` (development only)

## 📝 Data Format Reference

| Field | Type | Required | Example |
|-------|------|----------|---------|
| invoice | string | ✅ | "INV001" |
| date | string | ✅ | "2025-01-20" |
| buyer | string | ✅ | "Buyer Corp A" |
| amount | number | ✅ | 50000 |
| due | string | ✅ | "2025-02-20" |
| status | string | ✅ | "PAID" or "UNPAID" |
| ageing | number | ✅ | 5 (days) |

## ✨ Next Steps

1. ✅ Create collections in Firebase
2. ✅ Add sample documents
3. ✅ Refresh dashboard - see live data!
4. ✅ Edit data in Firestore - watch dashboard update
5. ✅ Build forms to add new data (optional)

---

**The dashboard is now fully connected to Firebase!**
Any data you add to Firestore will appear in the dashboard instantly. 🎉
