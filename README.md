# CHIP NG Blog Management System

Advanced, lightweight blog CMS built for the Nigerian market, prioritizing speed and SEO. 
Integrated directly into the existing React + Vite + Node.js (Express) + Supabase application.

## 🚀 Features Implemented

1. **Admin Dashboard (`/admin`)**
   - Full integration with existing Supabase Auth.
   - Analytics at a glance (Total Posts, Views, Drafts, Published).
   - Post management table with Draft/Published badges and action buttons.

2. **Post Editor**
   - **WYSIWYG Editor**: Replaced standard Markdown with `TipTap` for a WordPress/Notion-like rich text editing experience (bold, headings, lists, images, links).
   - Auto-generating slugs based on the title.
   - **SEO Automation Panel**: Meta title & description, Focus keyword, FAQ JSON-LD Schema builder, and Product JSON-LD toggles.
   - **Auto-Save**: Drafts are automatically backed up to `localStorage` every 30 seconds.

3. **Public Blog Pages**
   - `/blog`: 9-post paginated grid layout, lazy-loaded cover images, and high-performance design.
   - `/blog/:slug`: Renders rich HTML content.
   - **Schema Injection**: Automatically injects OpenGraph tags, Breadcrumb JSON-LD, FAQ JSON-LD, and Product JSON-LD directly into the `<head>` using `react-helmet-async`.
   - **Share Buttons**: Added native WhatsApp share with prefilled text alongside Twitter/LinkedIn/Facebook.
   - **Related Posts**: Dynamically queries posts with overlapping keywords.

4. **SEO Automation (Server-Side)**
   - Created a custom Node.js Express server (`server.ts`) to programmatically handle SEO routes:
     - `/sitemap.xml`: Dynamically queries the Supabase database to generate accurate sitemaps for Google.
     - `/robots.txt`: Directs crawlers to the sitemap.

## 🛠 Setup & Development

To run this project locally:

```bash
# Install all dependencies (including TipTap editor)
npm install

# Start the dev server (Vite + Express middleware)
npm run dev
```

For production builds:
```bash
npm run build
npm run start
```
