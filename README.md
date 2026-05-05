# Clearwork

Vision clarity + 90-day planning for people building something real.

**Live site:** https://getclearwork.app

---

## Project structure

```
clearwork/
├── public/               ← Static files served at root
│   ├── index.html        ← Landing page
│   ├── app/
│   │   └── index.html    ← Main app
│   ├── adhd-productivity/index.html
│   ├── 90-day-plan/index.html
│   ├── vision-clarity/index.html
│   ├── solopreneur-tools/index.html
│   ├── too-many-ideas/index.html
│   └── clearwork-config.js
├── api/                  ← Vercel serverless functions
│   ├── vision.js
│   ├── runway.js
│   ├── newthought.js
│   ├── phasereview.js
│   ├── retro.js
│   ├── capture-email.js
│   ├── lemonwebhook.js
│   ├── save-project.js
│   └── restore-session.js
├── package.json
├── vercel.json
├── .env.example
└── .gitignore
```

---

## Environment variables

Copy `.env.example` to `.env.local` for local dev. Never commit `.env.local`.

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `RESEND_API_KEY` | Resend email API key |
| `LEMONSQUEEZY_SIGNING_SECRET` | LemonSqueezy webhook signing secret |
| `LEMONSQUEEZY_MONTHLY_VARIANT_ID` | Monthly plan variant ID |
| `LEMONSQUEEZY_ANNUAL_VARIANT_ID` | Annual plan variant ID |
| `LEMONSQUEEZY_STORE_SLUG` | Your LS store slug |
| `NEXT_PUBLIC_CLEARWORK_MONTHLY_CHECKOUT_URL` | Monthly checkout URL (public) |
| `NEXT_PUBLIC_CLEARWORK_YEARLY_CHECKOUT_URL` | Yearly checkout URL (public) |

---

## Deploy to GitHub + Vercel

### Step 1 — Push to GitHub

```bash
# In your project folder:
git init
git add .
git commit -m "Initial commit"

# Create a new repo at github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/clearwork.git
git branch -M main
git push -u origin main
```

### Step 2 — Connect to Vercel

1. Go to [vercel.com](https://vercel.com) → Log in → **Add New Project**
2. Click **Import Git Repository** → select your `clearwork` repo
3. Vercel will auto-detect the config from `vercel.json`
4. **Do not change** the Framework Preset — leave it as detected (Other / Static)
5. Before clicking Deploy, click **Environment Variables** and add all variables from `.env.example` with their real values

### Step 3 — Deploy

1. Click **Deploy**
2. Vercel builds and deploys in ~30 seconds
3. You get a URL like `clearwork-xyz.vercel.app` — test it there first

### Step 4 — Custom domain (optional)

1. In Vercel → your project → **Settings → Domains**
2. Add `getclearwork.app`
3. Update your DNS at Porkbun:
   - Add a CNAME record: `www` → `cname.vercel-dns.com`
   - Add an A record: `@` → `76.76.21.21`
4. Vercel auto-provisions SSL

### Step 5 — Update LemonSqueezy webhook URL

In LemonSqueezy → Settings → Webhooks, update the endpoint URL from:
```
https://getclearwork.app/.netlify/functions/lemonwebhook
```
to:
```
https://getclearwork.app/api/lemonwebhook
```

---

## Local development

```bash
npm install
npm run dev
# App runs at http://localhost:3000
```

Requires [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`

---

## One thing to update in app.html

Find any references to `/.netlify/functions/` in `public/app/index.html` and replace them with `/api/`. The `clearwork-config.js` file handles this going forward — add `<script src="/clearwork-config.js"></script>` to the `<head>` of `app/index.html` if not already present.
