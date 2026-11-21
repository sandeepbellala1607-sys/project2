# Smart Expense Tracker 💰

A clean, responsive, and production-ready personal finance and expense tracker built with pure **HTML5**, **CSS3**, and **vanilla JavaScript**. 

Designed for deployment on custom domains such as `myexpensetracker.com` and `www.myexpensetracker.com` with zero backend dependencies, full SPA routing, SEO optimization, and browser LocalStorage persistence.

---

## 🌟 Key Features

1. **Dashboard**
   - **Total Balance**: Shows net available balance in Indian Rupees (₹).
   - **Total Income & Expenses**: Color-coded summary metric cards (Green for Income, Red for Expenses, Blue for Balance).
   - **Live Count**: Real-time counter of total recorded entries.
   - **Recent Transactions**: Quick snapshot of latest financial activity.
   - **Monthly Budget Snapshot**: Real-time progress bar of current monthly spending.

2. **Add & Edit Transactions**
   - Clean modal form with **Income / Expense** toggle.
   - Dynamic category dropdown based on type:
     - **Expense Categories:** Food, Shopping, Travel, Bills, Health, Education, Entertainment, Other.
     - **Income Categories:** Salary, Freelance, Business, Investment, Other.
   - Inline form validation (positive amount, non-empty description, required category, valid date).

3. **Transaction Management & List**
   - Displays all entries with date, description, category badge, transaction type, and amount.
   - **Edit:** Update any existing transaction with prefilled values.
   - **Delete:** Safe deletion with confirmation modal dialog.
   - **Mobile Cards:** Automatically converts from a desktop table to touch-friendly cards on smaller screens ($\le 768\text{px}$).

4. **Search & Multi-Filter**
   - Real-time search by transaction description.
   - Filter by transaction type (All, Income only, Expense only).
   - Filter by category.
   - Filter by date range (From Date to To Date).
   - One-click **Reset Filters** button.

5. **Reports & Expense Analytics**
   - Interactive Doughnut Chart showing expenses breakdown by category (Chart.js + Canvas fallback).
   - Monthly comparison bar chart (Income vs Expenses over past months).
   - Itemized spending table with percentage shares.
   - Month selector to inspect historical income, expenses, and top spending category.

6. **Monthly Budget Planner**
   - Set spending limits for any month.
   - Real-time tracker showing **Monthly Budget**, **Amount Spent**, and **Remaining Budget**.
   - Dynamic visual progress bar: **Green** (on track), **Amber** (near limit $\ge 80\%$), and **Red** (budget exceeded).
   - Alert notifications when expenses exceed the allocated budget.

7. **Data Storage & Demo Data Management**
   - Persists all entries automatically in browser `localStorage`.
   - Built-in **Data Settings** dialog allowing users to reload Demo Data (Total Balance: ₹25,000 | Income: ₹40,000 | Expense: ₹15,000) or wipe data to track their real expenses from scratch.

---

## 🚀 Production & Custom Domain Setup

The project is fully pre-configured for custom domains:
* **Apex Domain:** `myexpensetracker.com`
* **WWW Domain:** `www.myexpensetracker.com` (redirects automatically to apex)

### Supported Routes (No 404 on refresh)
* `/` or `/dashboard` – Financial Dashboard
* `/transactions` – Full Transaction List & Filters
* `/add-transaction` – Direct Action to Add Transaction
* `/reports` – Charts & Expense Summaries
* `/budget` – Monthly Budget Planner

### Pre-configured Deployment Files
* **`vercel.json`**: Vercel SPA rewrites, www-to-apex 301 redirect, and security headers.
* **`_redirects`**: Netlify and Cloudflare Pages SPA rewrite rules.
* **`_headers`**: Netlify HSTS, CSP, and security headers.
* **`404.html`**: GitHub Pages SPA fallback redirection.
* **`.htaccess`**: Apache & cPanel HTTPS force, www redirect, and SPA rewriting.
* **`CNAME`**: GitHub Pages domain mapping (`myexpensetracker.com`).
* **`robots.txt` & `sitemap.xml`**: Search engine crawling and indexing.
* **`favicon.svg` & `og-image.svg`**: Production favicons and social share cards.

For complete step-by-step DNS and hosting instructions, see [**`DEPLOYMENT.md`**](./DEPLOYMENT.md).

---

## 📁 Project Structure

```
├── index.html        # Semantic HTML5 markup with SEO, Open Graph & accessibility
├── style.css         # Modern, responsive CSS with design tokens & mobile cards
├── app.js            # Modular JavaScript with History API routing & LocalStorage
├── config.js         # Runtime environment & canonical domain handling
├── favicon.svg       # High-DPI modern SVG favicon
├── og-image.svg      # Open Graph / Twitter social preview asset
├── robots.txt        # Search engine crawler instructions
├── sitemap.xml       # XML sitemap for custom domain routes
├── .env              # Production environment variables
├── .env.example      # Environment variables template
├── vercel.json       # Vercel deployment & security headers config
├── _redirects        # Netlify / Cloudflare Pages rewrite rules
├── _headers          # Netlify security headers config
├── 404.html          # GitHub Pages SPA redirect fallback
├── .htaccess         # Apache / cPanel production config
├── CNAME             # GitHub Pages custom domain file
├── package.json      # Optional Vite build commands
├── vite.config.js    # Vite bundler configuration
├── DEPLOYMENT.md     # Step-by-step custom domain & DNS guide
└── README.md         # Project documentation
```

---

## 🔒 Security Highlights

* **No Hardcoded Secrets**: Frontend does not contain sensitive keys or tokens.
* **Input Sanitization**: User-entered descriptions and categories are escaped (`escapeHtml`) to prevent Cross-Site Scripting (XSS).
* **HTTPS Enforcement**: Preconfigured HSTS (`Strict-Transport-Security`) headers prevent man-in-the-middle attacks.
* **Content Security Policy (CSP)**: Restricts script and font loading to trusted origins.
