# Smart Bookmark App

A real-time bookmark manager built with Next.js 14 (App Router), Supabase, and Tailwind CSS. Users sign in with Google, save bookmarks, and see updates across tabs instantly via Supabase Realtime.

**Live URL:** _[Add your Vercel URL here after deployment]_

---

## Tech Stack

- **Next.js 14** — App Router (no Pages Router)
- **TypeScript** — strict mode
- **Supabase** — Auth (Google OAuth), PostgreSQL database, Realtime subscriptions
- **Tailwind CSS** — styling with dark mode support
- **Lucide React** — icons
- **Vercel** — deployment

---

## Features

1. **Google OAuth login** — no email/password, just "Sign in with Google"
2. **Add bookmarks** — title + URL with proper validation
3. **Delete bookmarks** — removes from DB and UI instantly
4. **Private to each user** — Row Level Security (RLS) on the database level, so User A cannot see User B's data
5. **Real-time sync** — open two tabs, add a bookmark in one, it appears in the other without refreshing
6. **Dark mode** — toggleable, persists in localStorage
7. **Auto favicon** — fetches the website icon for each bookmark using Google's favicon API
8. **Toast notifications** — feedback on add/delete actions

---

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout, ToastProvider wrapper
│   ├── page.tsx                # Main dashboard (redirects to /login if not auth'd)
│   ├── globals.css             # Tailwind + custom design tokens
│   ├── login/page.tsx          # Google OAuth login page
│   └── auth/callback/route.ts  # Handles OAuth code exchange
├── components/
│   ├── Navbar.tsx              # Top nav with user info, logout, theme toggle
│   ├── BookmarkForm.tsx        # Form to add new bookmarks
│   ├── BookmarkList.tsx        # Displays bookmarks + realtime subscription
│   ├── BookmarkItem.tsx        # Individual bookmark card with favicon
│   ├── ThemeToggle.tsx         # Dark/light mode switch
│   └── Toast.tsx               # Toast notification system
├── lib/
│   └── supabaseClient.ts      # Supabase client + Bookmark type
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Database Schema

One table: `bookmarks`

| Column       | Type          | Notes                          |
|-------------|---------------|--------------------------------|
| `id`        | UUID          | Primary key, auto-generated    |
| `user_id`   | UUID          | Foreign key → `auth.users(id)` |
| `title`     | TEXT          | Required                       |
| `url`       | TEXT          | Required                       |
| `created_at`| TIMESTAMPTZ   | Defaults to `now()`            |

### SQL to create it

```sql
CREATE TABLE public.bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX idx_bookmarks_created_at ON public.bookmarks(created_at DESC);
```

---

## Row Level Security (RLS)

RLS is enabled so each user can only read, insert, and delete their own bookmarks. Even if someone tampers with the client-side code, the database enforces it.

```sql
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Realtime

The `BookmarkList` component subscribes to Supabase's Postgres Changes channel. When any `INSERT` or `DELETE` happens on the `bookmarks` table, the callback fires and React state updates immediately — no polling.

To enable this, the table must be added to Supabase's realtime publication:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookmarks;
```

The subscription has retry logic (up to 3 attempts) in case the WebSocket connection drops.

---

## Local Setup

### Prerequisites
- Node.js 18+
- A Supabase project with Google OAuth configured

### Steps

1. Clone the repo:
   ```bash
   git clone https://github.com/YOUR_USERNAME/smart-bookmark-app.git
   cd smart-bookmark-app
   ```

2. Copy the env template and fill in your Supabase keys:
   ```bash
   cp .env.example .env.local
   ```
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Install and run:
   ```bash
   npm install
   npm run dev
   ```

4. Open `http://localhost:3000`

### Supabase setup
- Run the SQL above (table, RLS policies, realtime publication) in the Supabase SQL editor
- Enable Google provider under Authentication → Providers
- Set Site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback` to redirect URLs
- In Google Cloud Console, create OAuth credentials with redirect URI: `https://<your-ref>.supabase.co/auth/v1/callback`

---

## Vercel Deployment

1. Push code to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy
5. After deployment, update Supabase:
   - Add `https://your-app.vercel.app` as Site URL
   - Add `https://your-app.vercel.app/auth/callback` to redirect URLs

---

## Challenges I Faced & How I Solved Them

### 1. RLS was blocking queries silently

When I first set up the bookmarks table, queries returned empty results even though data existed. Turns out I'd enabled RLS but hadn't created the actual policies yet. Supabase doesn't throw an error — it just returns an empty array, which made it hard to debug. I solved this by checking the Supabase dashboard's SQL editor with "Run as user" to test policies in isolation, and then added explicit SELECT/INSERT/DELETE policies.

### 2. OAuth redirect loop

After Google sign-in, the app would sometimes redirect back to `/login` instead of home. The issue was that the `redirectTo` parameter in `signInWithOAuth` was pointing to the wrong URL. It needs to go to `/auth/callback` (my app's route), not to Supabase's callback URL. I also had to add my app URL to Supabase's "Redirect URLs" allowlist in the auth settings, otherwise Supabase would ignore the redirect parameter.

### 3. Realtime subscription timing

The realtime channel would sometimes emit a `CHANNEL_ERROR` on first connect, especially in development with React Strict Mode (which double-mounts components). I fixed this by:
- Adding retry logic with exponential backoff (up to 3 retries)
- Using a unique channel name for each retry (`bookmarks_realtime_${retryCount}`)
- Properly cleaning up the old channel before creating a new one
- Removing the server-side `user_id` filter from the realtime subscription (it was causing issues with some Supabase RLS configs) and filtering on the client side instead

---

## Build Verification

```bash
npm install    # ✅ no errors
npm run build  # ✅ compiles, no TS or ESLint errors
npm run start  # ✅ production server works
```
