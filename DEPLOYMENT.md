# LEXED – Deployment notes

This archive is prepared for a split deployment:
- Frontend: Vercel (Vite + React)
- Backend: Render (Express)
- Database: an externally hosted MySQL instance containing your existing LEXED data

## 1. Important: preserve the existing MySQL data

The application database contains user accounts, questions and flashcard data. Do **not** create an empty database and expect those records to appear. First create a backup/export of the current MySQL database (structure + data), provision a hosted MySQL database, import the backup there, and verify the tables and row counts before switching the application over.

Do not run `schema.sql` over an already imported database. It is a schema bootstrap file, not a data migration. Only run a migration when you have checked that the target database is at the expected prior schema version.

## 2. Push this folder to GitHub

The project root is the folder containing `backend/`, `frontend/`, and this file. The archive intentionally excludes `.git/`, local `.env` files, and `node_modules/`.

```bash
git init
git add .
git status
git commit -m "Prepare LEXED for deployment"
git branch -M main
git remote add origin <your-github-repository-url>
git push -u origin main
```

Before committing, confirm that no `.env` file or database dump is staged.

## 3. Deploy the backend on Render

Create a **Web Service** from the GitHub repository:

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |

Set these Environment Variables in Render (do not commit real values):

- `ACCESS_TOKEN_SECRET`: long random secret
- `REFRESH_TOKEN_SECRET`: a different long random secret
- `RESEND_API_KEY`: your Resend API key
- `DB_HOST`: hosted MySQL hostname
- `DB_PORT`: hosted MySQL port
- `DB_USER`: hosted MySQL username
- `DB_PASSWORD`: hosted MySQL password
- `DB_NAME`: hosted database name
- `DB_SSL_CA`: hosted database CA certificate PEM, if the provider requires TLS
- `FRONTEND_URL`: your exact Vercel origin, e.g. `https://lexed-demo.vercel.app`

Render provides `PORT` automatically. The server listens on `process.env.PORT` and `0.0.0.0`.

After deploy, test `https://<your-render-service>.onrender.com/health`; it should return `{"status":"ok"}`.

## 4. Deploy the frontend on Vercel

Import the same GitHub repository as a Vercel project:

| Setting | Value |
|---|---|
| Root Directory | `frontend` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Add this Environment Variable in Vercel:

- `VITE_API_URL`: `https://<your-render-service>.onrender.com` (no trailing slash)

Redeploy after adding/changing environment variables. The included `vercel.json` provides the SPA fallback for React Router.

After Vercel gives you the final domain, update `FRONTEND_URL` in Render to that exact origin and redeploy the backend.

## 5. Move the existing MySQL database safely

1. Back up the current local database using MySQL Workbench (Data Export → Dump Structure and Data).
2. Provision a hosted MySQL database that supports external connections and TLS as required.
3. Import the dump into the hosted database.
4. Verify table names and row counts, especially users, questions/exams, flashcard sets/cards, refresh tokens, classes and progress tables.
5. Add the hosted connection details to Render Environment Variables.
6. Test login, question retrieval, flashcard retrieval and create/update operations before demoing.

Keep the local database unchanged as a backup. Do not put the SQL dump, `.env`, passwords, or certificates in GitHub.

## 6. Email verification note

The current sender in `backend/utils/sendEmail.js` uses Resend's `onboarding@resend.dev` test sender. Resend restricts test sending; for public registration/demo to arbitrary email addresses, verify a sending domain in Resend and update the `from` address to an address on that verified domain. Keep `RESEND_API_KEY` only in Render Environment Variables.

## 7. Local development

Backend: copy `backend/.env.example` to `backend/.env`, fill in local MySQL credentials, then run `npm install` and `npm run dev` inside `backend/`.

Frontend: copy `frontend/.env.example` to `frontend/.env`, then run `npm install` and `npm run dev` inside `frontend/`.

The frontend defaults to `http://localhost:8080` if `VITE_API_URL` is not set.
