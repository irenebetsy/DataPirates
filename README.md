# Data Pirates CMS — Setup

Runs on **Node.js + Express + PostgreSQL**. Chosen specifically so it can be
hosted for free, forever, with no credit card required (Render for the app,
Neon or Render's own database for PostgreSQL).

## Requirements
- Node.js installed
- PostgreSQL installed and running locally for development (or a free
  PostgreSQL database from Render/Neon/Supabase for deployment)

## Setup steps
1. Install dependencies:
   ```
   npm install
   ```
2. Create the database (locally, if you have PostgreSQL installed):
   ```
   createdb DataPirates
   ```
3. Create the tables:
   ```
   psql -U postgres -d DataPirates -f database/schema.sql
   ```
4. Edit `.env` with your own PostgreSQL credentials (copy `.env.example` if
   you need a fresh template). For a local install, `DB_SSL=false` is usually
   right; for Render/Neon/Supabase, leave `DB_SSL=true`.
5. Start the server:
   ```
   npm start
   ```
   or, for auto-reload during development:
   ```
   npm run dev
   ```
6. Visit `http://localhost:3000`

## Default login
The schema seeds one sample admin user so you can log into the dashboard:
- Email: `admin@datapirates.com`
- Password: `Admin@123`

Passwords are hashed with bcrypt from the start — see "Password security"
below for how the "Forgot Password" flow works.

## Deploying it as a real, always-online website (free, no card)

### 1. Database — Render PostgreSQL (or Neon)
- In the Render dashboard: **New +** → **PostgreSQL**
- Pick the **Free** plan
- Once created, copy the connection details shown (host, user, password,
  database name, port)
- Connect to it (via `psql` or a GUI tool like TablePlus/DBeaver) and run:
  ```
  psql "your-connection-string" -f database/schema.sql
  ```

### 2. App — Render Web Service
- **New +** → **Web Service** → connect your GitHub repo (push this project
  to GitHub first if you haven't)
- Runtime: **Node**
- Build command: `npm install`
- Start command: `npm start`
- Plan: **Free**
- Under **Environment**, add these (this replaces your local `.env` — don't
  upload `.env` itself):
  ```
  DB_USER=<from Render Postgres>
  DB_PASSWORD=<from Render Postgres>
  DB_SERVER=<from Render Postgres, the "host">
  DB_PORT=5432
  DB_NAME=<from Render Postgres>
  DB_SSL=true
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=your_gmail
  SMTP_PASS=your_gmail_app_password
  SMTP_FROM=your_gmail
  FRONTEND_URL=https://your-app-name.onrender.com
  ```
- Deploy — Render gives you a live URL like `https://your-app-name.onrender.com`

**Known limits of Render's free tier**: the app "sleeps" after 15 minutes of
no traffic, and takes 30-60 seconds to wake up on the next visit. Fine for a
portfolio site; not built for high, constant traffic.

### 3. A real domain later (optional)
Once you can afford one, add it under your Render service's **Settings →
Custom Domains** — no code changes needed, just update `FRONTEND_URL`.

### Before you go public, worth doing
- **File uploads**: see "Images (assets folder)" below — as long as images
  are added to the project before deploying (not uploaded live through a
  form), this isn't a concern on Render either.

## Password security (bcrypt + Forgot Password)
Both admin and site-user passwords are hashed with bcrypt, never stored as
plain text. There's also a full "Forgot Password" flow for site users: they
request a reset link by email, click it, and set a new password.

**To actually send reset emails**, fill in the SMTP settings in `.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your app password
SMTP_FROM=you@gmail.com
FRONTEND_URL=http://localhost:3000
```
For Gmail, you need an **App Password** (not your normal Gmail password) —
Google Account → Security → 2-Step Verification → App Passwords. Any other
SMTP provider (Outlook, SendGrid, Mailgun, etc.) works the same way, just
swap the host/port/credentials.

If you leave SMTP blank, reset links are printed to the server console
instead of emailed — handy for testing locally without setting up email at
all. Once deployed, update `FRONTEND_URL` to your real domain so the emailed
links point to the right place.

### Bulk-hashing any old plaintext passwords in SiteUsers
If you ever end up with `SiteUsers` accounts with plain-text or garbled
passwords (e.g. inserted directly via SQL rather than through the app), run:
```
cd DataPirates/backend
node scripts/hashExistingPasswords.js
```
It's safe to run more than once — it skips any row that's already a proper
bcrypt hash. Garbled/corrupted values still get hashed so login stops
erroring out, but that account's *original* password can't be recovered —
that person just needs "Forgot Password" once to set a working one.

## Public user accounts, comments, likes & share
A full visitor account system, separate from the admin dashboard login:
- **Sign up / Sign in**: `account-register.html` / `account-login.html`
  (linked from "Sign In" / "Sign Up" in the homepage navbar)
- **Comments**: logged-in visitors can comment on blog posts and project
  pages; they can delete their own comments. Moderate/delete any comment
  from the dashboard's "Comments" page.
- **Likes**: logged-in visitors can like/unlike a post; the count is visible
  to everyone.
- **Share**: uses the native device share sheet where available, otherwise
  copies the link to the clipboard.

Tables: `SiteUsers`, `Comments`, `Likes`, `ProjectComments`, `ProjectLikes`,
`PasswordResets` — all created by `schema.sql`. See
`database/add_users_comments_likes.sql` and
`database/add_project_comments_likes.sql` if you need to add just these to
an existing database (safe to run either way, tables are only created if
missing).

## Images (assets folder)
Instead of a full upload feature, images are managed as static files you
place directly in the project, organized by section:
```
public/assets/projects/
public/assets/blogs/
public/assets/code/
public/assets/books/
```

**To add an image:**
1. Drop the image file into the matching folder — e.g.
   `public/assets/projects/fleetguard-ai.png`
2. In the dashboard form's "Image URL" field, use a **relative path**:
   `assets/projects/fleetguard-ai.png`

That's it — the server already serves everything under `public/` as static
files.

**Why this works fine for deployment (no cloud storage needed):** these
images become part of your actual codebase, not files generated at runtime.
As long as you commit `public/assets` to your Git repo, they deploy along
with everything else, every time — including on Render.

## What's included
- **Projects, Blogs, Code Library, Bookshelf** — full CRUD from the admin
  dashboard, live display on the homepage pulled from the database
- **User accounts, comments, likes, share** — see above
- **Password security** — bcrypt hashing + Forgot Password — see above
- **Homepage limiting** — homepage shows the 3 latest items per section, with
  "View All" links (`all-projects.html`, `all-blogs.html`, `all-code.html`,
  `all-books.html`) showing everything

## What was fixed along the way
- `public/js/project.js` had `const params` / `const id` declared twice — a
  JavaScript syntax error that crashed the project details page. Fixed.
- Originally built on SQL Server with `.env` hardcoded to one specific
  computer's name — migrated the entire backend to PostgreSQL so it can be
  hosted for free (Render/Neon) without needing a credit card anywhere.
  Every controller, the schema, and the connection layer were rewritten for
  Postgres; all features were tested end-to-end against a real PostgreSQL
  database and confirmed working identically to before.
- `config/db.js` checks that all required `.env` variables are present at
  startup and fails with a clear message, instead of every API route quietly
  returning a confusing 500 error.

## A note on SQL Server vs PostgreSQL
This project intentionally moved from SQL Server to PostgreSQL purely to
solve a hosting/cost problem (SQL Server has no genuinely free, no-card
hosting option; PostgreSQL does). The two are very similar relational
databases — same core SQL, same concepts (joins, transactions, foreign
keys). The main differences you'd notice if comparing the code: PostgreSQL
uses `SERIAL` instead of `IDENTITY` for auto-incrementing IDs, `RETURNING`
instead of `OUTPUT INSERTED`, and `NOW()` instead of `GETDATE()`. If your
day job uses SQL Server specifically, that experience still applies almost
entirely here — just watch for those few syntax differences.
