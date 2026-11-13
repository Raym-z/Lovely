# Lovely 💗

### A little website, a lot of love.

Lovely is an interactive Valentine's Day experience that lets you create personalized digital love pages for someone special. Turn memories, photos, little surprises, and heartfelt messages into a playful experience that can be shared through a single link.

**[Visit Lovely](https://lovely.raymondwillytan.com)**

<!-- Add a project preview image or GIF here -->

---

## ✨ Features

### Interactive Valentine's Experience

- **Floating Envelope** — An animated envelope that introduces the experience.
- **Scrapbook Timeline** — A collection of personal stories and memories presented in a scrapbook-inspired layout.
- **Photo Memories** — Add personal photos to your stories with interactive cropping and zoom controls.
- **Interactive Quiz** — A playful quiz that makes each experience more personal.
- **Little Gifts** — Surprise your recipient with thoughtful digital gifts.
- **The Big Question** — End the experience with a special question.

### Lovely Creator

- **Personalized Pages** — Create your own Valentine's experience without writing any code.
- **Live Editing** — Customize stories, photos, templates, and content.
- **Shareable Links** — Publish your creation with a unique URL.
- **Edit Access** — Revisit and update your pages using an edit key or account.

### Accounts & Image Management

- **Guest Sessions** — Start creating without registering.
- **Account Registration** — Upgrade a guest session into a permanent account without losing existing content.
- **Cross-Device Verification** — Complete email verification on another device while keeping the original session in sync.
- **Personal Dashboard** — Manage pages associated with your account.
- **Photo Library** — Reuse uploaded photos across stories and pages.

---

## 🛠️ Tech Stack

| Technology           | Purpose                                          |
| -------------------- | ------------------------------------------------ |
| Next.js              | Full-stack React framework                       |
| React                | Component-based UI                               |
| TypeScript           | Type-safe development                            |
| Tailwind CSS         | Styling and responsive layouts                   |
| Framer Motion        | Animations and interactions                      |
| Supabase             | PostgreSQL database, authentication, and storage |
| Cloudflare Turnstile | CAPTCHA and abuse prevention                     |
| Resend               | Transactional email delivery                     |
| Vercel               | Deployment and scheduled tasks                   |

---

## 🏗️ Technical Highlights

Lovely was built with a focus on more than just the user interface. Several parts of the application involve custom backend logic and data ownership management.

### Guest-to-Account Ownership

Users can begin creating pages without registering. When they decide to create an account, their existing anonymous Supabase user is upgraded with an email and password.

This preserves the original user ID and maintains ownership of existing pages, uploaded images, and edit permissions.

Users can also log into an existing account, with a secure ownership transfer process that moves guest content without changing page IDs or edit keys.

### Secure Image Upload Pipeline

Uploaded photos are processed in the browser before reaching storage:

1. Interactive cropping with drag, zoom, and pinch controls.
2. Cropping to the scrapbook's 4:3 image viewport.
3. Export to WebP, with JPEG fallback.
4. Compression toward a 1 MB target.
5. Upload only the processed image, rather than the original file.

The application also supports a reusable photo library, reference tracking, and server-authorized image management.

### Authentication & Email Verification

- Supabase anonymous authentication for guest sessions.
- Email and password registration for permanent accounts.
- Email confirmation through Resend SMTP.
- Cloudflare Turnstile protection for authentication requests.
- Server-verified cross-device email confirmation.
- Secure guest ownership transfer when logging into an existing account.

### Automated Guest Account Cleanup

A protected Vercel Cron job periodically reviews inactive anonymous accounts.

Accounts are only eligible for deletion when they have been inactive for at least 30 days, own no pages or images, and have no incomplete ownership transfers. Unverifiable accounts are preserved.

---

## 🚀 Getting Started

### Prerequisites

- Node.js
- npm
- A Supabase project for persistent storage and authentication

### Installation

Clone the repository:

```
git clone https://github.com/Raym-z/Lovely.git
cd Lovely
```

Install dependencies:

```
npm install
```

Start the development server:

```
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create a `.env.local` file based on `.env.example`.

Configure the required Supabase credentials and application settings. For persistent storage and authentication, the project requires:

- Supabase project URL
- Supabase server secret key
- Supabase public/anon key
- Cloudflare Turnstile site key and corresponding Supabase CAPTCHA configuration

For production deployments, configure the additional email, site URL, share origin, and cron environment variables described in `.env.example`.

### Database Setup

Run `supabase/schema.sql` in the Supabase SQL Editor to initialize the database schema, tables, policies, and storage configuration.

For an existing deployment, apply the relevant migrations in `supabase/migrations/` in chronological order.

Additional Supabase configuration is required for anonymous authentication, email confirmation, Cloudflare Turnstile, and Resend SMTP.

---

## 📜 Available Scripts

| Command                | Description                         |
| ---------------------- | ----------------------------------- |
| `npm run dev`          | Start the development server        |
| `npm run build`        | Build the production application    |
| `npm run start`        | Start the production server         |
| `npm run lint`         | Run ESLint                          |
| `npm run test:cleanup` | Run anonymous account cleanup tests |

---

## 🌐 Deployment

Lovely is deployed on Vercel and uses Supabase for persistent data, authentication, and image storage.

Production share links use the configured `NEXT_PUBLIC_SHARE_ORIGIN` environment variable.

---

## 💗 About

Lovely started as a small creative project: a way to turn a simple Valentine's Day message into something more personal and interactive.

What began as a playful web experience grew into a full-stack application involving authentication, content ownership, image processing, secure storage, and automated maintenance.

**A little website, a lot of love.**
