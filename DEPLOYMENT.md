# Smart Expense Tracker – Production Deployment & Custom Domain Guide

This guide provides step-by-step instructions to deploy **Smart Expense Tracker** to production and connect your custom domain:
* **Apex Domain:** `myexpensetracker.com`
* **WWW Domain:** `www.myexpensetracker.com`

---

## 🛠️ Step 1: Build the Application

Your project is structured so it can be deployed **as a pure static web app** (zero build required) or **built with Vite** for minified production assets.

### Option A: Static Deployment (Zero-build, recommended for quickest launch)
All source files (`index.html`, `style.css`, `app.js`, `config.js`, `favicon.svg`, `og-image.svg`, etc.) are already production-ready. You can deploy this folder directly!

### Option B: Vite Production Build
If you prefer bundling and minification:
```bash
# 1. Install dependencies
npm install

# 2. Build for production (outputs to /dist folder)
npm run build
```
The output directory will be `dist/`.

---

## 🚀 Step 2: Deploy the Application

Choose any of the following recommended static hosting platforms:

### Platform 1: Vercel (Recommended)
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **"Add New..."** → **"Project"**.
3. Import your Git repository (or run `npx vercel` in the project folder).
4. The included `vercel.json` will automatically configure:
   - Client-side SPA routing (`/dashboard`, `/transactions`, `/reports`, `/budget`)
   - Canonical 301 redirect from `www.myexpensetracker.com` to `myexpensetracker.com`
   - Security headers (HSTS, CSP, X-Frame-Options)
5. Click **"Deploy"**.

### Platform 2: Netlify
1. Go to [netlify.com](https://netlify.com) and log in.
2. Drag and drop the project folder into the Netlify dashboard (or connect via GitHub).
3. The included `_redirects` and `_headers` files will automatically handle:
   - SPA route rewrites (status 200 to `/index.html`)
   - Canonical www-to-apex redirect
   - Full HTTPS HSTS headers
4. Click **"Deploy Site"**.

### Platform 3: Cloudflare Pages
1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**.
2. Click **"Create application"** → **"Pages"**.
3. Connect your repository. Build command can be left empty (or `npm run build`), and root directory is `./` (or `dist` if built).
4. Click **"Save and Deploy"**.

### Platform 4: GitHub Pages
1. Push this repository to GitHub.
2. The included `CNAME` file points to `myexpensetracker.com`.
3. The included `404.html` ensures refreshing routes (`/transactions`, `/reports`, etc.) does not cause 404 errors.
4. Go to **Settings** → **Pages** → Source: **Deploy from a branch** (`main` / root).

---

## 🌐 Step 3: Add the Custom Domain in Your Hosting Platform

### On Vercel:
1. Go to your project dashboard → **Settings** → **Domains**.
2. Add both domains:
   - `myexpensetracker.com` (Set as Primary / Recommended)
   - `www.myexpensetracker.com` (Select **"Redirect to myexpensetracker.com"**)

### On Netlify:
1. Go to **Site Configuration** → **Domain Management** → **Custom domains**.
2. Click **"Add a domain"** and enter `myexpensetracker.com`.
3. Netlify will automatically detect and suggest adding `www.myexpensetracker.com` as an alias.
4. Set `myexpensetracker.com` as the **Primary Domain**.

### On Cloudflare Pages:
1. Go to your Pages project → **Custom domains** → **Set up a custom domain**.
2. Add `myexpensetracker.com` and then add `www.myexpensetracker.com`.

---

## 📡 Step 4: Configure DNS Records at Your Domain Registrar

Log into where you purchased your domain (GoDaddy, Namecheap, Google Domains / Squarespace, Cloudflare, etc.) and open the **DNS Management / DNS Records** page.

Add the following records:

### For Vercel:
| Type  | Name / Host | Target / Value | TTL | Note |
|---|---|---|---|---|
| **A** | `@` (or leave blank) | `76.76.21.21` | Automatic / 300 | Points apex domain to Vercel |
| **CNAME** | `www` | `cname.vercel-dns.com.` | Automatic / 300 | Points www subdomain to Vercel |

### For Netlify:
| Type  | Name / Host | Target / Value | TTL | Note |
|---|---|---|---|---|
| **A** | `@` (or leave blank) | `75.2.60.5` | Automatic / 300 | Points apex domain to Netlify load balancer |
| **CNAME** | `www` | `<your-site-name>.netlify.app.` | Automatic / 300 | Points www to your Netlify site URL |

### For Cloudflare Pages:
| Type  | Name / Host | Target / Value | TTL | Note |
|---|---|---|---|---|
| **CNAME** | `@` | `<your-project>.pages.dev.` | Proxied (Orange cloud) | Cloudflare CNAME flattening |
| **CNAME** | `www` | `<your-project>.pages.dev.` | Proxied (Orange cloud) | www subdomain |

> [!NOTE]
> DNS propagation typically takes **5 to 30 minutes**, but can take up to 24–48 hours depending on your registrar.

---

## 🔒 Step 5: Enable HTTPS / SSL

Modern hosting platforms provision free automated SSL certificates via Let's Encrypt or Cloudflare.

1. **Vercel / Netlify / Cloudflare**: Once your DNS records resolve, the platform will automatically generate and renew a free Let's Encrypt SSL certificate for both `myexpensetracker.com` and `www.myexpensetracker.com`.
2. Ensure **"Always use HTTPS"** or **"Force HTTPS"** is toggled **ON** in your hosting dashboard.
3. The project includes `Strict-Transport-Security` headers in `vercel.json`, `_headers`, and `.htaccess` to guarantee secure connections and prevent SSL stripping.

---

## ✅ Step 6: Verify the Custom Domain

1. Open your terminal or a command prompt and check DNS propagation:
   ```bash
   # Check A record for apex
   nslookup myexpensetracker.com

   # Check CNAME record for www
   nslookup www.myexpensetracker.com
   ```
2. In your hosting dashboard (e.g. Vercel or Netlify), verify that the domain status says:
   `Valid Configuration` / `DNS verified` / `SSL Certificate Issued`.

---

## 🧪 Step 7: Test All Expense Tracker Pages

Run through this test suite on your production domain:

| Test Item | URL / Action | Expected Result |
|---|---|---|
| **Apex Domain** | `https://myexpensetracker.com` | Opens homepage directly with valid SSL certificate |
| **WWW Redirect** | `https://www.myexpensetracker.com` | Seamlessly redirects to `https://myexpensetracker.com` |
| **HTTP to HTTPS** | `http://myexpensetracker.com` | Automatically upgrades to `https://` |
| **Dashboard** | `https://myexpensetracker.com/dashboard` | Displays Balance, Income, Expense, Recent Transactions |
| **Transactions Page** | `https://myexpensetracker.com/transactions` | Loads full transaction table / mobile cards |
| **Add Transaction Route**| `https://myexpensetracker.com/add-transaction` | Directly opens Add Transaction modal |
| **Reports Page** | `https://myexpensetracker.com/reports` | Renders Doughnut chart & monthly comparison bar chart |
| **Budget Page** | `https://myexpensetracker.com/budget` | Allows setting monthly budget and displays health indicator |
| **Route Refresh (SPA)** | Refresh browser on `/reports` or `/budget` | **No 404 error**; page re-renders route cleanly |
| **Add Transaction** | Create a test entry (e.g., Food, ₹250) | Added to list and stats update immediately |
| **Edit Transaction** | Click edit icon on an existing entry | Modal opens with pre-filled values; updates on save |
| **Delete Transaction** | Click delete icon | Confirmation modal appears; removes item safely |
| **Search & Filters** | Type in search bar; filter by category | Real-time filtering with updated count |
| **Data Persistence** | Refresh the page / reopen browser | Transactions and budget remain intact via LocalStorage |
| **Mobile Responsiveness**| Open DevTools mobile device mode | Navbar collapses into mobile toggle; table converts to cards |
