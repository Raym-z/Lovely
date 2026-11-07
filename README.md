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

Email confirmation is required for permanent accounts. Enable **Confirm email** in Supabase Auth settings, and keep Resend configured as the project's SMTP provider. After registration, the user is sent to `/verify-email`, where they can resend the message with a fresh Cloudflare Turnstile token and a 60-second client cooldown. Confirmation links return through `/auth/confirm`, which exchanges the Supabase code, token hash, or session tokens, verifies the resulting user with Supabase Auth, and then continues to the account. The password is intentionally set only after confirmation through `/signup?complete=1`, because an anonymous user still has no attached email or phone until Supabase confirms the email change.

Unverified permanent accounts are redirected to `/verify-email` from `/account` and `/create`. Guest sessions are never required to verify an email, and public Lovely pages and edit-key access remain unchanged.

Configure the Supabase **Site URL** as the production Lovely origin and add these redirect URLs:

```text
http://localhost:3000/auth/confirm
https://your-production-domain/auth/confirm
```

Set `NEXT_PUBLIC_SITE_URL` in production when the confirmation origin differs from the browser origin. Use the existing `supabase/email-templates/confirm-signup.html` template for both **Confirm signup** and **Change Email Address** so the guest-to-permanent upgrade keeps Lovely's branding. The template must keep using `{{ .ConfirmationURL }}`; Resend SMTP is configured in Supabase Auth, not in the app.

If a guest instead logs into a different existing account, `/login` captures the guest access token in memory before switching sessions. After login, the server verifies both Supabase identities and calls the transactional `transfer_guest_ownership` database function to move the guest's pages and images to the destination account. Page IDs, edit keys, image references, and public Storage paths are preserved. The transfer is idempotent and records completed source guest UIDs so a guest cannot be moved to two accounts. If the transfer fails, the account session remains active and the user can retry while the guest proof is still in memory, or use the original edit key.

Run `supabase/migrations/20261106020000_guest_ownership_transfer.sql` after the account and image migrations to enable this transfer flow.

## Anonymous guest cleanup

Unused anonymous guests are reviewed once per day (03:17 UTC) by a protected Vercel Cron route. A guest is deleted only when **all** of these are true:

- It is an anonymous Supabase Auth user.
- Its last verified activity was at least 30 days ago.
- It owns no rows in `public.lovely_pages`.
- It owns no rows in `public.lovely_images` (as `owner_id` or `uploaded_by_user_id`).
- It has no incomplete row in `public.lovely_account_transfers`.

Registered accounts, guests who own pages or images, recently active guests, and guests whose activity or ownership cannot be verified are always kept.

Meaningful activity is recorded server-side in `public.lovely_user_activity` when a guest creates or edits a page, uploads a photo, or deletes a photo. Page views and background requests are intentionally excluded. Accounts without an activity row fall back to Supabase Auth's `last_sign_in_at`; if that is also unknown, the account is skipped rather than assumed abandoned.

### Setup

1. Run [`supabase/migrations/20261108000000_anonymous_user_cleanup.sql`](supabase/migrations/20261108000000_anonymous_user_cleanup.sql) in the Supabase SQL editor. New deployments can run the updated [`supabase/schema.sql`](supabase/schema.sql) instead.
2. Add `CRON_SECRET` to the production environment. Vercel Cron sends it automatically as `Authorization: Bearer <CRON_SECRET>`.
3. Deploy. The schedule lives in [`vercel.json`](vercel.json).
4. Run the first cleanup as a dry run and review the response and the `public.lovely_cleanup_runs` table.
5. Only after the dry run looks right, set `ANONYMOUS_CLEANUP_DELETE_ENABLED=true` and redeploy to enable real deletion.

### Manual dry run

```bash
curl -s \
  -H "Authorization: Bearer $CRON_SECRET" \
  "https://your-deployment.example/api/cron/cleanup-anonymous-users?dryRun=1"
```

Use `?limit=25` to examine a smaller batch. The endpoint refuses unauthorised requests, never accepts user IDs from the client, and only uses the server-side Supabase secret key. Until `ANONYMOUS_CLEANUP_DELETE_ENABLED` is `true`, every scheduled run is a dry run.

Cleanup is idempotent: it lists and checks first, deletes only eligible users, re-verifies ownership immediately before deleting, and records every run in `public.lovely_cleanup_runs` with counts and per-user outcomes. Individual deletion failures are recorded without stopping the rest of the batch.

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
