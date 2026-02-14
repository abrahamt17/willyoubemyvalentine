# Step-by-Step Deployment Guide

## ✅ Pre-Deployment Checklist

### Step 1: Database Migration
**Action Required**: Run this SQL in your Supabase SQL Editor:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS hobbies TEXT[] DEFAULT '{}';
```

Or use the file: `add-hobbies.sql`

**How to check**: 
- Go to Supabase → SQL Editor
- Run the query above
- Verify: Check if `hobbies` column exists in `users` table

---

### Step 2: Environment Variables
**You'll need these values from Supabase:**

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Location: Supabase Dashboard → Settings → API
   - Look for: "Project URL"
   - Format: `https://xxxxx.supabase.co`

2. **SUPABASE_SERVICE_ROLE_KEY**
   - Location: Supabase Dashboard → Settings → API
   - Look for: "service_role" key (NOT the anon key!)
   - Format: Long string starting with `eyJ...`

3. **JWT_SECRET**
   - Generate a random secret key
   - We'll generate this together

---

### Step 3: Git Repository Setup
**Choose one:**
- [ ] Option A: Create new GitHub repository
- [ ] Option B: Use existing repository
- [ ] Option C: Deploy without Git (Vercel CLI)

---

### Step 4: Deploy to Vercel
**We'll do this together after steps 1-3 are complete**

---

## Current Status

Let me know:
1. Have you run the `add-hobbies.sql` migration? (Yes/No)
2. Do you have a Supabase project set up? (Yes/No)
3. Do you have a GitHub account? (Yes/No)
4. Do you have a Vercel account? (Yes/No)

Then we'll proceed step by step! 🚀

