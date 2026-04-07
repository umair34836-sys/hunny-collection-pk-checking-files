# Admin Setup Guide - Hunny Collection PK

## 🔐 How Admin Authentication Works

The admin panel uses a **two-step** authentication process:

1. **Firebase Authentication** - User logs in with email/password
2. **Firestore Authorization** - Checks if user's UID exists in `admins` collection

## 📋 First-Time Setup (Do This Once!)

### Step 1: Find Your User UID

1. Login to your admin account at `admin.html`
2. Open browser console (F12)
3. Your UID will be shown in the console log:
   ```
   Checking admin status for: your@email.com UID: XXXXXXXXXXXXXXXXXXXXXX
   ```
4. **Copy this UID** - you'll need it next

### Step 2: Add Admin to Firestore

**Option A: Using Firebase Console (Recommended)**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `hunny-collection-pk`
3. Go to **Firestore Database**
4. Find or create the `admins` collection
5. Click **Add Document**
6. **IMPORTANT**: Click **"Auto-ID"** and **replace** it with your UID (paste the UID from Step 1)
7. Add fields:
   ```
   Field: email    Type: string    Value: your@email.com
   Field: uid      Type: string    Value: your-uid-here
   Field: role     Type: string    Value: super-admin
   ```
8. Click **Save**

**Option B: Using Firebase Console (Alternative)**

If your admin already exists with auto-generated ID:

1. Go to Firestore Database → `admins` collection
2. Click on your existing admin document
3. Note down the `email` field
4. Create a **new** document with:
   - Document ID: Your UID (from Step 1)
   - Fields: same as above
5. Delete the old document (with auto-generated ID)

### Step 3: Verify Setup

1. Refresh `admin.html` page
2. Login again
3. You should see:
   ```
   ✅ Admin found by UID: your-uid-here
   ```
4. Dashboard should load successfully! 🎉

## 🔍 Troubleshooting

### "Access denied. Admin privileges required."

**Cause:** Your UID is not in the `admins` collection

**Solution:**
1. Check console (F12) for the exact error
2. Verify your UID matches the document ID in `admins` collection
3. Make sure you're using the correct Firebase project

### "Missing or insufficient permissions."

**Cause:** Firestore rules not deployed OR admin document not set up

**Solution:**
1. Deploy the latest `firestore.rules` file
2. Verify admin document exists with your UID as document ID
3. Try logging out and back in

### Rules deployment:

```bash
firebase deploy --only firestore:rules
```

Or manually:
1. Firebase Console → Firestore Database → Rules
2. Copy content from `firestore.rules`
3. Click **Publish**

## 📊 How It Works

```
User Login (Firebase Auth)
    ↓
Check if UID exists in admins collection
    ↓
If YES → Load admin dashboard
If NO → Show "Access denied" error
```

### Automatic Migration

The first time an old-style admin (email-based) logs in:
1. System finds admin by email
2. Creates new document with UID
3. Deletes old document
4. Future logins use UID (faster!)

## 🔑 Multiple Admins

To add more admins:

1. Get their Firebase Auth UID
   - They login first
   - Check console for their UID
2. Add document to `admins` collection:
   - Document ID: Their UID
   - Fields: email, uid, role

## ✅ Verification Checklist

- [ ] Firebase Authentication working
- [ ] Admin document exists in Firestore `admins` collection
- [ ] Document ID = User UID
- [ ] Email field matches login email
- [ ] Firestore rules deployed
- [ ] Dashboard loads successfully

## 🆘 Need Help?

If still facing issues:
1. Open browser console (F12)
2. Copy all error messages
3. Check Firestore → admins collection (verify UID matches)
4. Verify rules are deployed
5. Try incognito mode (clear cache)

---

**Last Updated:** 2026-04-05
**Version:** 2.0 (UID-based authentication)
