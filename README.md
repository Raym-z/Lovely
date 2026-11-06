# Lovely

A little website, a lot of love.

Lovely is an interactive Valentine's experience: a floating envelope, a scrapbook timeline, a playful quiz, little gifts, and one very important question. It also includes a creator that turns your own version into a short shareable link.

## Routes

| Route | What it does |
| --- | --- |
| `/` | The demo experience |
| `/create` | The creator / editor |
| `/[uid]` | A saved, shareable Lovely |
| `/create?edit=UID` | Edit a saved Lovely (needs its edit key) |

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
   - `NEXT_PUBLIC_SHARE_ORIGIN` (optional; leave empty locally)

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

## Scripts

```bash
npm run dev     # development
npm run build   # production build
npm run start   # start the production build
npm run lint    # eslint
```
