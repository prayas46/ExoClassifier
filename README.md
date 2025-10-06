# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/21f39cfd-d993-4c8c-b2e4-175bbc121fb8

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/21f39cfd-d993-4c8c-b2e4-175bbc121fb8) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Backend warm-up, health, and keep-alive

To avoid cold start delays and CORS issues, the app proactively warms the backend and uses a proxy in production:

- Warm-up flow
  - On mount, the Classifier triggers a warm-up after a short delay, then starts a periodic keep-alive.
  - Before first prediction, if not yet marked ready, it warms up again.
  - After any successful prediction, the UI is forced to "ML model ready".
- Endpoints
  - Development: direct calls to `/api` via Vite proxy to `https://exoplanet-classifier-backend-api.onrender.com`.
  - Production: calls to `/api/proxy` (Vercel serverless proxy). Warm-up uses `{ path: '/' }`.
- Keep-alive: pings the backend every 10 minutes via a simple health check.
- Implementation highlights
  - `src/lib/api.ts`: `warmUpBackend()` with `fetchWithTimeout` (AbortController), `getHealth()`, `startKeepAlive()`/`stopKeepAlive()`.
  - `src/components/Classifier.tsx`: integrates warm-up lifecycle and UI readiness indicator.
  - `vite.config.ts`: dev proxy for `/api`.
  - `api/proxy.js` + `vercel.json`: production proxy and CORS headers.

Recent measurements (example):
- `GET /` ~0.95s (includes `model_loaded: true`)
- `GET /model/info` ~0.42s
- `POST /predict/single` ~0.74s

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/21f39cfd-d993-4c8c-b2e4-175bbc121fb8) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
