# Will You Be My Valentine? 💕

A private, invite-only anonymous matching app for Valentine's Day events. Built with Next.js, TypeScript, and Supabase.

<!-- Deployment trigger -->

## Features

- ✅ **Invite-only access** - One shared code for your class
- ✅ **Anonymous profiles** - Browse classmates anonymously
- ✅ **Request system** - Send requests to people you're curious about
- ✅ **Mutual matching** - When both people request each other, it's a match!
- ✅ **Real-time messaging** - Chat with your matches
- ✅ **Identity reveal** - Choose when to reveal your real name
- ✅ **Profile management** - Update your anonymous profile anytime

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings → API** and copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **service_role** key (the secret one, not the anon key)

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
JWT_SECRET=your-super-secret-jwt-key-change-this
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. Set Up Database

1. In Supabase, go to **SQL Editor**
2. Copy and paste the contents of `database-schema.sql`
3. Click **Run** to create all tables

### 5. Create Invite Codes

In Supabase SQL Editor, run:

```sql
insert into invite_codes (code, used)
values ('innamorari1', false);
```

The invite code is **innamorari1** - share this with your class!

### 6. Run the App

```bash
npm run dev
```

Visit `http://localhost:3000` and start using the app!

## How It Works

1. **Join**: Users enter the shared invite code to create an account
2. **Onboard**: Set up anonymous profile (name, bio, gender)
3. **Browse**: See all classmates who have joined
4. **Request**: Send requests to people you're interested in
5. **Match**: When both people request each other → automatic match!
6. **Chat**: Message your matches in real-time
7. **Reveal**: Optionally reveal your real identity to matches

## Project Structure

```
app/
  api/
    auth/          # Authentication endpoints
    users/         # User browsing
    requests/      # Request management
    matches/       # Match management
    messages/      # Messaging
    profile/       # Profile CRUD
  components/      # Reusable components
  dashboard/       # Browse users page
  requests/        # Requests page
  matches/         # Matches & chat page
  profile/         # Profile editing page
  onboarding/      # First-time setup
lib/
  auth.ts          # Session management
  supabase.ts      # Database client
  types.ts         # TypeScript types
  validation.ts    # Input sanitization
```

## Database Schema

- `users` - User profiles
- `invite_codes` - Shared invite codes
- `requests` - Sent/received requests
- `matches` - Mutual matches
- `messages` - Chat messages

See `database-schema.sql` for full schema.

## Deployment

1. Deploy to Vercel/Netlify
2. Add environment variables in your hosting platform
3. Update Supabase URL settings if needed
4. Share your invite code!

## Notes

- Invite codes can be reused by multiple people (one code for the whole class)
- All profiles are anonymous by default
- Identity is only revealed when both users choose to reveal
- Messages are only between matched users

## License

Built for educational purposes. Use responsibly! 💕

