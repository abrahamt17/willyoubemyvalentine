# Deployment Guide

## Prerequisites

1. **Supabase Account**: You need a Supabase project set up
2. **Vercel Account** (recommended) or any Next.js hosting platform
3. **Environment Variables**: Your Supabase credentials

## Step 1: Database Setup

1. Go to your Supabase project → SQL Editor
2. Run the following SQL files in order:
   - `database-schema.sql` (if not already run)
   - `add-room-number.sql` (if not already run)
   - `add-hobbies.sql` (NEW - run this to add hobbies column)

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: willyoubemyvalentine
# - Directory: ./
# - Override settings? No
```

### Option B: Deploy via GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables (see below)
6. Click "Deploy"

## Step 3: Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

```
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important**: 
- `JWT_SECRET`: Generate a random string (e.g., `openssl rand -base64 32`)
- `NEXT_PUBLIC_SUPABASE_URL`: Found in Supabase → Settings → API
- `SUPABASE_SERVICE_ROLE_KEY`: Found in Supabase → Settings → API (use the `service_role` key, NOT the `anon` key)

## Step 4: Build Settings

Vercel should auto-detect Next.js, but verify:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## Step 5: Post-Deployment

1. **Test the deployment**: Visit your Vercel URL
2. **Create invite codes**: In Supabase SQL Editor:
   ```sql
   INSERT INTO invite_codes (code) VALUES ('innamorari1');
   ```
3. **Share the invite code** with your class!

## Troubleshooting

### Build Fails
- Check that all environment variables are set
- Verify database schema is up to date
- Check build logs in Vercel dashboard

### Database Connection Issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check Supabase project is active (not paused)
- Ensure database tables exist

### Runtime Errors
- Check Vercel function logs
- Verify all SQL migrations have been run
- Check browser console for client-side errors

## Alternative: Deploy to Other Platforms

### Netlify
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables in Netlify dashboard

### Railway
1. Connect GitHub repository
2. Railway auto-detects Next.js
3. Add environment variables
4. Deploy!

### Self-Hosted (VPS)
```bash
# Build the app
npm run build

# Start production server
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start npm --name "valentine-app" -- start
```

## Post-Deployment Checklist

- [ ] Database schema is up to date (hobbies column added)
- [ ] Environment variables are set correctly
- [ ] Invite codes are created in database
- [ ] Test registration flow
- [ ] Test matching flow
- [ ] Test messaging
- [ ] Test mobile responsiveness
- [ ] Share invite code with users!

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Verify all environment variables
4. Ensure database migrations are complete

