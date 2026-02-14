# Setup Supabase Storage for Image Uploads

## Step 1: Run Database Migration

Run this SQL in Supabase SQL Editor:

```sql
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS image_url TEXT;
```

Or use the file: `add-image-to-messages.sql`

## Step 2: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Click on **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure:
   - **Bucket name**: `message-images`
   - **Public bucket**: ✅ **YES** (check this box - images need to be publicly accessible)
   - **File size limit**: `5242880` (5MB in bytes)
   - **Allowed MIME types**: `image/*` (or leave empty for all)
5. Click **"Create bucket"**

## Step 3: Set Up Storage Policies

Go to **Storage** → **Policies** → Select `message-images` bucket

### Policy 1: Allow authenticated users to upload
Click **"New Policy"** → **"For full customization"**

- **Policy name**: `Allow authenticated uploads`
- **Allowed operation**: `INSERT`
- **Policy definition**:
```sql
(
  bucket_id = 'message-images'::text
  AND auth.role() = 'authenticated'::text
)
```

### Policy 2: Allow public read access
Click **"New Policy"** → **"For full customization"**

- **Policy name**: `Allow public read`
- **Allowed operation**: `SELECT`
- **Policy definition**:
```sql
(
  bucket_id = 'message-images'::text
)
```

### Policy 3: Allow users to delete their own files
Click **"New Policy"** → **"For full customization"**

- **Policy name**: `Allow users to delete own files`
- **Allowed operation**: `DELETE`
- **Policy definition**:
```sql
(
  bucket_id = 'message-images'::text
  AND auth.role() = 'authenticated'::text
)
```

## Step 4: Verify Setup

1. The bucket should be **public**
2. All three policies should be active
3. Users can now upload images in chat!

## Notes

- Images are stored in: `message-images/{match_id}/{user_id}/{timestamp}.{ext}`
- Maximum file size: 5MB
- Supported formats: All image types (jpg, png, gif, webp, etc.)
- Images are publicly accessible via URL

