# Lovely

A little website, a lot of love.

Lovely is an interactive Valentine's experience: a floating envelope, a scrapbook timeline, a playful quiz, little gifts, and one very important question. It also includes a creator that turns your own version into a short shareable link.

## Routes

| Route | What it does |
| --- | --- |
| `/` | The demo experience |
| `/create` | The creator / editor |
| `/[uid]` | A saved, shareable Lovely |
| `/create?edit=UID` | Edit a saved Lovely (with its edit key or as its owner) |
| `/signup` | Upgrade the current guest into a permanent account |
| `/login` | Log in to an existing Lovely account |
| `/account` | List, open, and edit pages owned by the signed-in user |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Storage

The creator works without any setup by falling back to local JSON files in `.data/lovely/`. That is useful for development, but it is **not reliable on serverless hosts** such as Vercel.

For real share links, create a free Supabase project and:

1. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor.
2. Copy `.env.example` to `.env.local` and fill in:
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY` (preferred) or the legacy `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL` (optional when `SUPABASE_URL` is set)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
   - `NEXT_PUBLIC_SHARE_ORIGIN` (optional; leave empty locally)
3. Enable **Anonymous Sign-Ins** and **Manual Linking** in Supabase under Authentication → Providers.
4. In Supabase Auth CAPTCHA settings, enable Cloudflare Turnstile and add the Turnstile **secret key** there. Put only the **site key** in `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
5. Add your local/production `/signup?complete=1` URL to the Auth redirect allow list.

The secret/service-role key is only used in server code. Do **not** use the publishable or anon key here — RLS is enabled and the app will show a setup error. Pages are stored as `UID -> compressed config`; the table has no public policies.

For localhost, leave `NEXT_PUBLIC_SHARE_ORIGIN` empty so the creator uses whatever origin the browser is currently on (including non-default ports).

## Sharing / subdomain

Point `lovely.raymondwillytan.com` at the deployment and set:

```bash
NEXT_PUBLIC_SHARE_ORIGIN=https://lovely.raymondwillytan.com
```

Share links will then look like `https://lovely.raymondwillytan.com/abc123xy`.

## Editing

The edit key is saved in the creator's browser for convenience and is also shown once on the success screen as a recovery key. Anyone with the share link can view the page; only someone with the edit key can update it.

## Guest sessions and accounts

The `/create` flow automatically establishes a Supabase anonymous session the first time it loads. The session is persisted by the Supabase browser client, so refreshing or revisiting the creator restores the same guest UID instead of creating another user.

New guest sessions are protected by Cloudflare Turnstile. Existing sessions are restored before the Turnstile widget is initialized, so returning guests are not challenged again. Turnstile tokens are single-use; failed or expired attempts reset the widget and expose a retry. If the public Supabase variables or `NEXT_PUBLIC_TURNSTILE_SITE_KEY` are missing, the creator still works and the session state reports `unavailable` or `error`.

Use `useGuestSession()` to access the current `user`, `userId`, `session`, and loading/error state.

From the success screen, guests can optionally create a permanent account. Registration links an email and password to the existing anonymous user with `updateUser()`, preserving the Supabase UID and all pages owned by it. Existing edit keys continue to work and are never replaced.

For existing deployments, run `supabase/migrations/20261106000000_account_ownership.sql` (or the latest `supabase/schema.sql`) to add `lovely_pages.owner_id` and the owner-only RLS policies. Pages created before the migration keep `owner_id = null` and remain editable with their edit key; editing one while signed in claims it for that account.

If email confirmation is enabled, the account is upgraded after the user confirms their email and returns to `/signup?complete=1` to set the password. The guest session and page ownership are preserved throughout.

## Photo uploads

Each story can use an illustrated template or an uploaded photo. Photos are cropped in the browser to the polaroid's exact `4:3` image viewport, exported as WebP (JPEG fallback), compressed toward the 1 MB target, and only then uploaded. Original files are never stored. Uploaded assets can be reused across stories and owned pages without duplicate Storage objects.

Owner sessions can reuse their personal photo library. Edit-key holders can upload and manage photos for that specific page, but cannot browse the owner's wider library. Photo writes are mediated by server routes using the service role only after validating the bearer token or the page edit key.

Existing deployments must run the image migration in the Supabase SQL editor:

1. Open `supabase/migrations/20261106010000_image_uploads.sql`.
2. In the Supabase Dashboard, open **SQL Editor**, paste the migration, and run it.
3. Verify `public.lovely_images` and `public.lovely_image_references` exist in **Table Editor**.
4. Verify the public **Storage** bucket `lovely-images` exists.
5. Verify RLS is enabled on both new tables and the bucket has only public read access, not public writes.

The migration creates the tables, indexes, owner RLS policies, the public `lovely-images` bucket, and public-read Storage policy. No storage write policy is intentionally created; writes run server-side after owner/edit-key authorization. Unreferenced library images can be deleted explicitly; images still referenced by a page are protected from deletion.

## Scripts

```bash
npm run dev     # development
npm run build   # production build
npm run start   # start the production build
npm run lint    # eslint
```
