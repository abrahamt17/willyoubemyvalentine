# ✅ Environment Variables Checklist

## Variables You Should Have Added:

### 1. JWT_SECRET
- **Key**: `JWT_SECRET`
- **Value**: `gTVaOW8TffldubhZnIGXntcWnC1yl5eAAxkbQM7lMVw=`
- ✅ Correct!

### 2. NEXT_PUBLIC_SUPABASE_URL
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: Should look like `https://xxxxx.supabase.co`
- ⚠️ Make sure you used your ACTUAL Supabase URL, not the placeholder text!

### 3. SUPABASE_SERVICE_ROLE_KEY
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: Should be a long string starting with `eyJ...`
- ⚠️ Make sure you used the SERVICE_ROLE key (not the anon key!)

## Important Checks:

1. **Environment Selection**: For each variable, make sure you checked:
   - ☑ Production
   - ☑ Preview
   - ☑ Development

2. **No Spaces**: Make sure there are no spaces in the key names:
   - ✅ `JWT_SECRET`
   - ❌ `JWT_SECRET ` (with trailing space)
   - ❌ `JWT SECRET` (with space)

3. **Exact Values**: 
   - JWT_SECRET should be exactly: `gTVaOW8TffldubhZnIGXntcWnC1yl5eAAxkbQM7lMVw=`
   - NEXT_PUBLIC_SUPABASE_URL should be your actual Supabase URL
   - SUPABASE_SERVICE_ROLE_KEY should be your actual service role key

## Next Step: Redeploy!

After adding variables, you MUST redeploy for them to take effect.

