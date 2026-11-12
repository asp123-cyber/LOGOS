# LOGOS — Intellectual Publishing Community

> **Think clearly. Write honestly. Disagree thoughtfully.**

LOGOS is an intellectual publishing community designed for students, researchers, and curious writers to publish long-form essays, study arguments, follow thinkers, and engage in constructive dialogue.

---

## Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │             GitHub Pages               │
                      │  (Static React + TS + Tailwind Client) │
                      └───────────────────┬────────────────────┘
                                          │
                   ┌──────────────────────┴──────────────────────┐
                   │                                             │
                   ▼                                             ▼
     ┌───────────────────────────┐                 ┌───────────────────────────┐
     │      Supabase Cloud       │                 │       n8n Workflows       │
     │  - Auth (Email/Pass/Tokens│                 │  (Optional Automation &   │
     │  - PostgreSQL + RLS       │                 │   Notifications Layer)    │
     │  - Storage (Avatars/Media)│                 └───────────────────────────┘
     └───────────────────────────┘
```

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, TipTap Editor, Hash Routing.
- **Backend:** Supabase Auth, PostgreSQL with Row Level Security (RLS), Supabase Storage.
- **Hosting:** GitHub Pages (static distribution only).
- **Automation (Optional):** n8n webhook blueprints for notifications and digest workflows.

---

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+ (Node 20 recommended)
- A Supabase account (free tier works)

### 2. Configure Environment Variables
Copy the template to your local environment file:
```bash
cp .env.example .env.local
```

Populate `.env.local` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-publishable-key
VITE_APP_URL=http://localhost:5173/
```

### 3. Install Dependencies & Launch
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Supabase Database Setup

1. Open your project at [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor**.
3. Copy and run the entire content of [`supabase/schema.sql`](file:///c:/Users/ashis/Desktop/Philosphy to Physics/LOGOS-starter-kit/supabase/schema.sql).
   - This sets up tables (`profiles`, `articles`, `follows`, `article_likes`, `bookmarks`, `comments`, `reports`, `invites`).
   - Enables Row Level Security (RLS) across all tables with least-privilege policies.
4. Navigate to **Storage** in the Supabase Dashboard:
   - Create a public bucket named `avatars`.
   - Create a public bucket named `article-images`.
5. Run the seed script:
   - Run [`supabase/seed.sql`](file:///c:/Users/ashis/Desktop/Philosphy to Physics/LOGOS-starter-kit/supabase/seed.sql) in the SQL Editor after your first account is created to publish the flagship essay: *"How to Argue with Logic: A Practical Guide to Thinking Clearly"*.

### Designating the First Administrator
After registering your first user account through `/auth`, execute the following in the Supabase SQL Editor:
```sql
update public.profiles
set role = 'admin'
where username = 'YOUR_USERNAME';
```

---

## Deploying to GitHub Pages

1. Push this repository to GitHub.
2. In your GitHub repository:
   - Go to **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. Configure repository secrets & variables:
   - Go to **Settings** → **Secrets and variables** → **Actions**.
   - Add Repository Variable: `VITE_SUPABASE_URL`
   - Add Repository Secret: `VITE_SUPABASE_ANON_KEY`
   - Add Repository Variable: `VITE_APP_URL` (e.g., `https://username.github.io/repository-name/`)
4. Trigger the deployment:
   - Pushing to the `main` branch automatically deploys via [`.github/workflows/deploy.yml`](file:///c:/Users/ashis/Desktop/Philosphy to Physics/LOGOS-starter-kit/.github/workflows/deploy.yml).
   - Alternatively, trigger manually from the **Actions** tab.

---

## Features Implemented

1. **Editorial Landing Page (`/`):** Featured inquiry hero, latest dispatches, topics carousel, community manifesto.
2. **Explore & Search (`/explore`):** Full-text search, field-of-inquiry category filtering, popularity and chronological sorting.
3. **Article Reading Experience (`/article/:slug`):** TipTap structured rendering, sanitized prose, reading progress tracker, like/bookmark/share actions, interactive discussion with inline replies, and report modal.
4. **Writing Studio (`/write`):** TipTap rich-text editor with headings, bold, italic, quotes, lists, links, image attachments, draft saving, live preview mode, and direct publishing.
5. **Author Profiles (`/profile/:username`):** Biography, follower counts, follow/unfollow toggle, and authored essay portfolio.
6. **Community Feed (`/community`):** Personalized stream of articles from followed thinkers, with global fallback.
7. **Personal Archives (`/bookmarks`):** Private repository of saved essays for deep study.
8. **Account Settings (`/settings`):** Manage bio, display name, handle validation, and avatar uploads.
9. **Authentication (`/auth`):** Sign in, invite-only signup with token validation, and password recovery.
10. **Admin Console (`/admin`):** Token minting for invite-only onboarding, report moderation, and member roster.
11. **Discourse Guidelines & Manifesto (`/guidelines`, `/about`):** Epistemic standards, steelmanning principles, and reporting criteria.

---

## Optional: n8n Automation

Automated email alerts, admin reports, and community digests can be enabled with n8n.
See [`n8n/WORKFLOW_BLUEPRINT.md`](file:///c:/Users/ashis/Desktop/Philosphy to Physics/LOGOS-starter-kit/n8n/WORKFLOW_BLUEPRINT.md) for full webhook architecture, security guidelines, and node configurations.
