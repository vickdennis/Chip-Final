# CHIP NG Lead Generation System

Implemented a WhatsApp Lead Capture pipeline directly integrated into the blog architecture to boost conversion rates for NFC cards.

## 🚀 Features Implemented

1. **Lead Capture Component (`LeadCapture.tsx`)**
   - **Inline Mode**: Automatically injected after the 2nd paragraph of every blog post.
   - **Sticky Mode (Mobile)**: Triggers only after a user scrolls past 60% of the page length.
   - **Form Logic**: 
     - Collects Name, WhatsApp Number, and City (dropdown for Inline).
     - Auto-formats NG WhatsApp numbers (handles leading `0`).
     - Redirects directly to a pre-filled WhatsApp message including UTM tracking (`utm_source` & `utm_medium` = slug).
     - Anti-spam: `localStorage` 24-hour rate limit mechanism prevents multiple submissions.
     - Event Tracking: Pushes `generate_lead` events to `dataLayer` for GA4 & Meta Pixel.

2. **SQLite Storage Backend (`server.ts`)**
   - Created a local, lightweight SQLite database (`leads.sqlite`) using `better-sqlite3`.
   - Bypassed Supabase for lead storage to avoid strict RLS policy complexities and provide a faster, self-contained lead pipeline.
   - Built Express API routes:
     - `POST /api/lead`: Handles incoming leads.
     - `GET /api/leads`: Serves leads to the admin dashboard.

3. **Admin Leads Dashboard (`AdminLeadsManager.tsx`)**
   - Integrated as a new tab inside `/admin`.
   - **Real-Time Table**: Displays captured leads, timestamps, source type (inline/sticky), and the blog post that triggered the lead.
   - **Quick Action**: "Chat" button opens the specific WhatsApp thread instantly.
   - **CSV Export**: Native browser-side download of all leads.

4. **Bug Fixes**
   - Removed `faq_json` and `product_json` from the Supabase payload to resolve the `schema cache` error when publishing/saving drafts.

## 🛠 Setup & Development

```bash
# Install the new sqlite dependency
npm install better-sqlite3

# Restart the local server to initialize leads.sqlite
npm run dev
```
