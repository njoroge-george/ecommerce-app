# Google OAuth Setup Guide

## ✅ What's Already Done

Your application is now configured with Google OAuth authentication! Here's what has been implemented:

### Backend:
- ✅ Passport.js with Google OAuth strategy installed
- ✅ Google authentication routes created (`/api/auth/google` and `/api/auth/google/callback`)
- ✅ User creation/login via Google account
- ✅ JWT token generation after successful Google auth

### Frontend:
- ✅ Google Sign In button component
- ✅ Google OAuth callback handler page
- ✅ Integration with login page
- ✅ Automatic user data storage and redirection

---

## 🔧 Setup Instructions

To complete the setup, you need to get Google OAuth credentials:

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "MyApp OAuth")
4. Click "Create"

### Step 2: Enable Google+ API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click "**Create Credentials**" → "**OAuth client ID**"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" (unless you have Google Workspace)
   - Fill in:
     - **App name**: MyApp
     - **User support email**: your email
     - **Developer contact**: your email
   - Click "Save and Continue" through all steps

4. Now create the OAuth client ID:
   - **Application type**: Web application
   - **Name**: MyApp Web Client
   - **Authorized JavaScript origins**: 
     ```
     http://localhost:5173
     http://localhost:5000
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:5000/api/auth/google/callback
     ```
   - Click "Create"

5. **Copy your credentials**:
   - You'll see a popup with:
     - **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)
     - **Client Secret** (looks like: `GOCSPX-xxxxx`)

### Step 4: Update Your .env File

Open `/home/nick/projects/myapp/backend/.env` and update these values:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=paste-your-client-id-here
GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### Step 5: Restart Your Backend Server

```bash
cd /home/nick/projects/myapp/backend
npm run dev
```

---

## 🎯 How to Use

### For Users:

1. Go to your login page: `http://localhost:5173/login`
2. Click the "**Sign in with Google**" button
3. You'll be redirected to Google's login page
4. Choose your Google account
5. Grant permissions
6. You'll be automatically logged in and redirected to the dashboard!

### What Happens Behind the Scenes:

```
User clicks "Sign in with Google"
    ↓
Redirects to: http://localhost:5000/api/auth/google
    ↓
Google shows login page
    ↓
User logs in with Google
    ↓
Google redirects back to: http://localhost:5000/api/auth/google/callback
    ↓
Backend creates/finds user, generates JWT token
    ↓
Redirects to: http://localhost:5173/auth/google/success?token=xxx&user=xxx
    ↓
Frontend stores token and user data in localStorage
    ↓
User is logged in! Redirected to /dashboard
```

---

## 🔐 Security Features

- ✅ **No password storage** for Google users (random password generated)
- ✅ **Email verification** inherited from Google
- ✅ **Profile picture** automatically imported from Google
- ✅ **JWT tokens** for session management
- ✅ **Same authentication flow** as email/password login

---

## 🧪 Testing

1. **Start both servers**:
   ```bash
   # Terminal 1 - Backend
   cd /home/nick/projects/myapp/backend
   npm run dev

   # Terminal 2 - Frontend
   cd /home/nick/projects/myapp/frontend
   npm run dev
   ```

2. **Test the flow**:
   - Open `http://localhost:5173/login`
   - Click "Sign in with Google"
   - Login with your Google account
   - Check that you're redirected to the dashboard
   - Verify user data is stored correctly

3. **Check database**:
   ```sql
   SELECT * FROM users WHERE email = 'your-google-email@gmail.com';
   ```
   You should see your Google account info!

---

## 🚀 Production Deployment

When deploying to production:

1. **Update redirect URIs** in Google Cloud Console:
   ```
   https://yourdomain.com
   https://api.yourdomain.com/api/auth/google/callback
   ```

2. **Update .env** on production server:
   ```bash
   GOOGLE_CLIENT_ID=your-production-client-id
   GOOGLE_CLIENT_SECRET=your-production-client-secret
   GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback
   ```

3. **Update frontend button** URL if needed (currently set to localhost:5000)

---

## 📝 Additional Notes

### Multiple Sign-In Methods:

Users can now sign in with:
1. **Email & Password** (existing)
2. **Google OAuth** (new!)
3. **2FA** (if enabled)

### If User Already Exists:

- If a user signs up with email `john@gmail.com`
- Then tries to sign in with Google using the same email
- They'll be logged into the same account!

### User Data from Google:

The following is imported from Google:
- ✅ Full Name (split into firstName/lastName)
- ✅ Email Address
- ✅ Profile Picture
- ✅ Email Verification Status

---

## 🆘 Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in Google Console exactly matches:
  `http://localhost:5000/api/auth/google/callback`

### Error: "Access blocked: This app's request is invalid"
- Configure the OAuth consent screen in Google Cloud Console

### Button doesn't redirect:
- Check that backend is running on port 5000
- Check console for errors
- Verify GOOGLE_CLIENT_ID is set in .env

### User not created in database:
- Check backend console for errors
- Verify MySQL is running
- Check database connection in .env

---

## 🎉 You're All Set!

Once you add your Google credentials to `.env`, your app will support Google Sign-In! Users can now choose between traditional email/password or quick Google authentication.
