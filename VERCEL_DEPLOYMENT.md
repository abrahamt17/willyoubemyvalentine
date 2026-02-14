# 🚀 Complete Vercel Deployment Guide

## ✅ Step 1: Push to GitHub (Do This First!)

You need to authenticate to push. Choose one method:

### Method A: Personal Access Token (Easiest)

1. **Create Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Name: "Vercel Deployment"
   - Expiration: 90 days (or No expiration)
   - Check: `repo` scope
   - Click "Generate token"
   - **COPY THE TOKEN** (you won't see it again!)

2. **Push Code:**
   ```bash
   cd "/home/avram/Documents/projects/2026/NEW/AGENTS TRY/willyoubemyvalentine"
   git push -u origin main
   ```
   - Username: `abrahamt17`
   - Password: `paste-your-token-here`

### Method B: Use GitHub CLI
```bash
gh auth login
git push -u origin main
```

---

## ✅ Step 2: Database Migration

**IMPORTANT**: Run this in Supabase SQL Editor before deploying:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS hobbies TEXT[] DEFAULT '{}';
```

Go to: Supabase Dashboard → SQL Editor → Paste and Run

---

## 🎯 Step 3: Deploy to Vercel

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Authorize Vercel to access your GitHub

### 3.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Find `abrahamt17/willyoubemyvalentine`
3. Click **"Import"**

### 3.3 Configure Project
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

**Click "Deploy"** (we'll add environment variables after)

---

## 🔐 Step 4: Add Environment Variables

### 4.1 Get Your Supabase Credentials

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Go to: Supabase Dashboard → Settings → API
   - Copy: "Project URL"
   - Format: `https://xxxxx.supabase.co`

2. **SUPABASE_SERVICE_ROLE_KEY**
   - Same page: Settings → API
   - Copy: "service_role" key (NOT anon key!)
   - Long string starting with `eyJ...`

3. **JWT_SECRET**
   - Use this generated secret:
   ```
   gTVaOW8TffldubhZnIGXntcWnC1yl5eAAxkbQM7lMVw=
   ```

### 4.2 Add to Vercel

1. Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these three variables:

   **Variable 1:**
   - Name: `JWT_SECRET`
   - Value: `gTVaOW8TffldubhZnIGXntcWnC1yl5eAAxkbQM7lMVw=`
   - Environment: Production, Preview, Development (check all)

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://your-project.supabase.co` (your actual URL)
   - Environment: Production, Preview, Development (check all)

   **Variable 3:**
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `eyJ...` (your actual service role key)
   - Environment: Production, Preview, Development (check all)

3. Click **"Save"**

### 4.3 Redeploy

After adding environment variables:
1. Go to: Deployments tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

---

## ✅ Step 5: Test Your Deployment

1. Visit your Vercel URL (e.g., `https://willyoubemyvalentine.vercel.app`)
2. Test the registration flow
3. Test hobbies selection
4. Test matching

---

## 📋 Step 6: Create Invite Codes

In Supabase SQL Editor, run:

```sql
INSERT INTO invite_codes (code) VALUES ('innamorati1');
```

The invite code is **innamorati1** - use this exact code!

---

## 🎉 You're Done!

Your app is now live! Share your Vercel URL and invite code with your class.

---

## Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Verify database migration was run
- Check Vercel build logs

### Database Connection Issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify `SUPABASE_SERVICE_ROLE_KEY` is the service_role key (not anon)
- Check Supabase project is active

### Runtime Errors
- Check Vercel function logs
- Verify all SQL migrations completed
- Check browser console for errors

---

## Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Database migration run (`add-hobbies.sql`)
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] Invite codes created
- [ ] App tested and working

