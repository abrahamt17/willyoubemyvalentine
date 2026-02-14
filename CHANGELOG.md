# Changelog

## Latest Updates

### ✅ Hobbies Feature
- Added hobbies selection with 20 popular dating app hobbies
- Users must select at least 3 hobbies during onboarding
- Hobbies are displayed on user cards in dashboard
- Hobbies are shown in match profiles
- Hobbies stored as array in database

### ✅ Mobile Responsiveness
- Improved mobile layout for matches page (stacked on mobile, side-by-side on desktop)
- Enhanced dashboard grid (1 column on mobile, 2 on tablet+)
- Better touch interactions for hobbies selection
- Responsive navigation bar
- Mobile-optimized forms and inputs

### ✅ Database Updates
- Added `hobbies` column to `users` table (TEXT[] array)
- Run `add-hobbies.sql` in Supabase SQL Editor to add the column

### ✅ Deployment Ready
- Created `DEPLOYMENT.md` with step-by-step deployment guide
- Added `vercel.json` configuration
- All builds passing successfully

## Previous Features

- Room number selection (Building + Room)
- Gender requirement (Male/Female only)
- WhatsApp number (required, no verification)
- Reveal options (WhatsApp, Room Number, or Both)
- Language support (English/Italian)
- Campus-themed captions
- Onboarding flow improvements

