# MASTER BUILD PROMPT — LOGOS

You are a senior full-stack engineer, product designer, security-minded architect and QA engineer. Build a complete, polished, responsive publishing community called **LOGOS** in the current repository.

Do not return only a plan, mockup, tutorial or code snippets. Inspect the repository, implement the working application, create all required files, run available checks, fix errors and provide exact setup/deployment instructions. If credentials are unavailable, build the integration completely using environment variables and clearly identify the one-time configuration the owner must perform. Never fabricate credentials or claim an integration has been tested when it has not.

## 1. Product vision

LOGOS is a small intellectual community where students and curious writers publish thoughtful essays, read one another's work, follow writers and discuss ideas. Its editorial character should feel rigorous, curious, welcoming and independent.

It is inspired by the general idea of long-form online publishing and intellectual communities. Do not copy the visual identity, wording, layout, article text, branding or proprietary assets of Substack, Medium, Bohring or any other publication. Create an original design system and original copy.

Tagline direction: **Think clearly. Write honestly. Disagree thoughtfully.**

Initial audience: about ten classmates/colleagues. Launch in invite-only mode, with a clear configuration path to open registration later. One designated owner is the initial administrator.

## 2. Non-negotiable architecture

- Frontend: React, TypeScript, Vite and Tailwind CSS.
- Routing: use a client-side router and ensure GitHub Pages refresh/deep-link navigation works. Prefer hash routing if it materially simplifies reliable GitHub Pages routing.
- Backend: Supabase Auth, PostgreSQL and Storage.
- Automation: n8n webhooks/workflows are optional integrations for notifications and operational tasks.
- Hosting: GitHub Pages serves the compiled static frontend only.
- Use Supabase Row Level Security (RLS) for authorization. UI hiding is never security.
- Browser code may contain only the Supabase project URL and anon/publishable key. Never put service-role keys, database passwords, n8n credentials or private webhook secrets in frontend code or Git.
- Use environment variables and provide `.env.example`.
- Do not invent a custom backend hosted on GitHub Pages. Do not claim GitHub Pages can run Node/Python/PHP server code.

## 3. Visual direction

Create a premium editorial design, not a generic SaaS dashboard.

Design language:
- A refined editorial identity with generous whitespace, excellent typographic hierarchy and carefully controlled color.
- Warm paper/off-white surfaces, near-black ink, restrained muted accent (e.g. deep cobalt, forest green or rust).
- Use a distinctive display serif for editorial headlines paired with a highly legible sans-serif for interface text. Load fonts responsibly; include sensible fallbacks.
- Strong grid, elegant article cards, subtle borders, quiet hover states, thoughtful empty states and restrained motion.
- Support light and dark themes if this can be implemented without compromising quality.
- Avoid excessive gradients, glassmorphism, giant rounded cards, random icon decoration and template-like dashboard styling.
- Design desktop, tablet and mobile intentionally. Mobile navigation and reading experience are first-class.
- Meet WCAG-minded contrast, keyboard navigation, visible focus states, semantic HTML, labels and reduced-motion preferences.

Create a coherent logo/wordmark using text or original simple SVG. Do not use copied logos or stock brand marks.

## 4. Information architecture and routes

Implement these pages with real data integration:

1. `/` — Home/editorial landing:
   - LOGOS wordmark and navigation.
   - Featured essay/hero story.
   - Latest essays.
   - Topic/category discovery.
   - Recommended writers or community introduction.
   - Clear sign-in and join actions.
   - Useful loading, empty and error states.

2. `/explore` — Explore:
   - Search published articles by title, excerpt, author and tags.
   - Filter by topic/category and sort newest/popular.
   - Paginated or incremental loading.
   - Only published and publicly visible content.

3. `/article/:slug` — Article reading:
   - Excellent long-form typography and readable line length.
   - Title, subtitle/excerpt, author, date, category, tags and estimated reading time.
   - Table of contents when headings exist.
   - Reading progress indicator.
   - Like/unlike, bookmark/unbookmark, comments and share/copy-link.
   - Related articles.
   - Render rich text safely; sanitize untrusted HTML or use a structured editor format.
   - Never render arbitrary unsanitized user HTML.

4. `/write` — Writing studio (authenticated):
   - Rich-text editor supporting headings, paragraphs, bold, italic, quotes, ordered/unordered lists, links and images.
   - Title, subtitle, cover image, category and tags.
   - Save draft, preview and publish.
   - Clear unsaved-changes handling.
   - Drafts are private to their author and never appear in public feeds.
   - Image upload through Supabase Storage with type/size validation.
   - If a reliable rich-text editor dependency is not available, select a maintained library and document it.

5. `/profile/:username` — Writer profile:
   - Avatar, display name, username, bio and join date.
   - Follow/unfollow control for authenticated users, excluding self-follow.
   - Follower and following counts and lists.
   - Published articles by this author.
   - Never expose private email addresses.

6. `/community` — Community feed:
   - Recent published work from followed authors, with a useful fallback for new users.
   - Clear distinction between global discovery and followed feed.

7. `/bookmarks` — Current user's saved articles.

8. `/settings` — Profile editing, avatar, bio, username and account preferences.

9. `/auth` — Sign up, sign in, sign out, password reset and auth callback handling.

10. `/admin` — Admin-only moderation and invite management. Enforce authorization in database policies and/or secure backend functions, not only route guards.

11. Useful `/about`, `/guidelines` and not-found pages.

## 5. Core product behavior

### Accounts
- Supabase email/password authentication.
- Email confirmation and password reset.
- Unique usernames, case-insensitive uniqueness.
- Profile creation after successful signup.
- Invite-only launch. Implement an actual server-enforced invitation mechanism, not merely a disabled signup button. A secure invite token must be validated through a trusted server-side mechanism (e.g. Supabase Edge Function) before account creation or profile activation. Never expose admin secrets in the browser.
- Include a documented setting/feature flag for future open registration.
- Provide safe error messages; do not leak whether arbitrary email addresses are registered.

### Articles
- Draft, published and archived states.
- Only author can edit/delete their own articles; admin may moderate.
- Public queries return only published articles.
- Stable slug generation with collision handling.
- Store structured content or sanitized HTML; document the chosen representation.
- Track created/updated/published timestamps.
- Cover image upload with safe file validation.
- Search, category, tags and pagination.
- A draft must never leak through public APIs or client-side caches.

### Social layer
- Follow/unfollow users.
- Prevent self-follow and duplicate follows.
- Likes with one like per user/article.
- Bookmarks private to each user.
- Comments on published articles; users can edit/delete their own comments; admin can moderate.
- Prevent duplicate likes/bookmarks/follows through database constraints.
- Show useful counts without trusting client-supplied counts.

### Moderation and abuse prevention
- Report article/comment/profile.
- Admin can review reports and hide/remove content.
- Validate input lengths and content types.
- Add basic rate limiting where supported by trusted backend infrastructure.
- Do not let unauthenticated users write arbitrary rows.
- Include community guidelines and a clear report action.
- Do not implement direct messaging in MVP; avoid introducing privacy and moderation complexity.

## 6. Database and security

Use `supabase/schema.sql` in this kit as a starting point. Review and improve it before implementation. Provide migrations if schema changes.

Tables should cover:
- `profiles`
- `articles`
- `follows`
- `article_likes`
- `bookmarks`
- `comments`
- `reports`
- `invites` (or an equivalent secure invite mechanism)

Requirements:
- UUID primary keys and foreign keys.
- Unique constraints for username, slug, follow pair, like pair and bookmark pair.
- Index all foreign keys and common filters (published date, author, status, tags where appropriate).
- Use `created_at`/`updated_at` timestamps.
- RLS enabled on every exposed table.
- Explicit least-privilege policies for SELECT/INSERT/UPDATE/DELETE.
- Anonymous users can read only published articles and safe public profiles, and public comments on published articles.
- Authenticated users can manage only their own profile (with protected role fields), drafts, likes, bookmarks and comments.
- Users cannot grant themselves admin role or alter protected moderation fields.
- Admin privileges must be assigned only through trusted SQL/dashboard/operator process or secure server-side code, never through an untrusted client update.
- Follow/favorite/bookmark counts must be computed from trusted database rows or safe views.
- Do not create overly broad `USING (true)` write policies.
- Test policies with anonymous, normal user and admin roles.
- Document any policy that depends on a Supabase helper or JWT claim.

If using Supabase Storage, create a bucket and policies for public article images and user avatars. Validate MIME type and file size; do not trust file extension alone.

## 7. n8n automation integration

n8n is not the database and must not be required for core publishing, login, following or reading. The site must remain usable if n8n is offline.

Design optional workflows:
- New user welcome notification.
- New article published notification.
- New comment notification to article author.
- New report/moderation alert to admin.
- Weekly community digest.
- Optional scheduled stale-draft reminder.

Trigger workflows from trusted Supabase Database Webhooks, Supabase Edge Functions or another authenticated server-side event mechanism. Do not allow the browser to call a privileged n8n webhook with a hardcoded secret. Validate webhook authenticity, minimize personal data, avoid sending passwords/tokens, and make workflows idempotent to avoid duplicate notifications.

Create `n8n/WORKFLOW_BLUEPRINT.md` with exact node sequence, expected input/output, security notes and setup steps. If generating importable n8n JSON, ensure it is valid and uses placeholders only; do not fabricate credential IDs. Mark credential configuration as manual.

## 8. Initial editorial content

Create an original first feature essay with the working title:

**How to Argue with Logic: A Practical Guide to Thinking Clearly**

It should be a substantial, engaging, original educational essay, not a copied or lightly paraphrased version of the supplied inspiration article. Use your own explanations, examples and structure.

Cover:
- What an argument is: premises, inference and conclusion.
- Claims vs evidence vs assumptions.
- Deductive reasoning, validity and soundness.
- Inductive reasoning, sample quality, uncertainty and probability.
- Abductive reasoning and inference to the best explanation.
- Necessary and sufficient conditions.
- Causal reasoning vs correlation.
- Steelmanning and charitable interpretation.
- Burden of proof and falsifiability where relevant.
- Common fallacies: straw man, ad hominem, false dilemma, slippery slope, hasty generalization, post hoc, circular reasoning, equivocation, appeal to authority and false analogy.
- How to build a strong counterargument.
- How to disagree constructively.
- Worked examples drawn from everyday student life, science, technology and public discussion.
- Short exercises with answer explanations.
- A practical checklist readers can use during a debate.

Be accurate: do not call every disagreement a fallacy; distinguish formal invalidity from informal fallacies; explain that an argument can be valid but unsound; do not imply induction provides deductive certainty. Use nuanced examples and acknowledge limitations.

Seed this essay as published content through a documented seed script or manual SQL process. Do not put privileged database credentials in the seed script committed to Git. Make it clear how the site owner can publish/edit it after setup.

## 9. Engineering quality

- Strict TypeScript; avoid `any` unless justified.
- Reusable components and clean folder structure.
- Centralized Supabase client.
- Typed data access layer.
- Robust loading, empty, success and error states.
- Form validation with clear messages.
- Responsive images and lazy loading.
- SEO metadata, Open Graph tags and descriptive titles.
- Accessible semantic components.
- No fake buttons or dead links.
- No lorem ipsum in finished user-facing pages.
- No hardcoded demo credentials.
- No secret keys in source.
- Add a useful README and `.env.example`.
- Include error boundaries and logging that does not leak sensitive data.
- Add unit/component tests for key logic and document manual integration tests.
- Ensure build works for GitHub Pages repository subpaths.

## 10. GitHub Pages deployment

Create `.github/workflows/deploy.yml`:
- Trigger on push to the chosen default branch and allow manual dispatch.
- Install dependencies deterministically from lockfile.
- Build with environment variables supplied through GitHub Actions repository secrets/variables.
- Upload and deploy the `dist` artifact using supported GitHub Pages Actions.
- Configure Vite base path correctly for a repository project site.
- Never put secrets in committed files or print them in logs.
- Explain repository Settings → Pages setup and required Actions permissions.

Provide a `.nojekyll` file if required by the selected output structure.

## 11. Deliverables

Create:
- Complete runnable frontend.
- Supabase schema/migrations and RLS policies.
- Optional storage policies.
- `.env.example`.
- GitHub Actions deployment workflow.
- n8n workflow blueprint and, if feasible, valid importable workflow JSON templates.
- Original seed article and seed instructions.
- README with exact local setup, Supabase setup, auth redirect setup, deployment and troubleshooting.
- Manual QA checklist.
- Clear list of anything that still requires the owner to configure.

## 12. Definition of done

Do not call the project finished until:
- The frontend installs and builds successfully.
- All routes render and are responsive.
- Auth flow is wired to Supabase (or clearly blocked only by missing credentials).
- Article read/create/edit/draft/publish flows are implemented.
- Follow/unfollow, likes, bookmarks and comments work with database constraints.
- RLS prevents cross-user draft/profile/comment modification.
- Admin-only actions are actually protected.
- GitHub Pages base path and deployment workflow are configured.
- No secrets are committed.
- n8n is optional and safely configured.
- README tells a beginner exactly what to do next.

At the end, report:
1. What you implemented.
2. Files created/changed.
3. Commands to run locally.
4. Supabase SQL/configuration steps.
5. GitHub Pages deployment steps.
6. n8n setup steps.
7. Tests/build results honestly.
8. Remaining manual tasks or limitations.

Work incrementally, but do not stop after scaffolding. Prioritize a working, secure MVP over decorative features that do not function.
