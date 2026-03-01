

# Gramin Sahayak Enhancement Plan

This plan covers four major upgrades: Bulletin Board with dynamic data and pagination, About page visual redesign, chatbot avatar humanization, and chat history persistence. All changes preserve existing UI layouts and logic.

---

## 1. Bulletin Board: Dynamic Data, RSS Integration, and Pagination

### Database Changes
- Create a new `bulletin_items` table to store both seeded and RSS-fetched content:
  - `id` (uuid, primary key)
  - `title` (text)
  - `description` (text)
  - `category` (text: Farmer/Worker/General)
  - `source` (text -- ministry name)
  - `image_url` (text, nullable)
  - `publish_date` (timestamptz)
  - `source_url` (text, nullable)
  - `is_expiring` (boolean, default false)
  - `rss_guid` (text, nullable, unique -- for dedup)
  - `created_at` (timestamptz, default now())
  - `last_fetched_at` (timestamptz, nullable)
- RLS: Public SELECT for all, INSERT/UPDATE restricted to service role
- Seed ~100 verified government scheme entries via an edge function

### Edge Function: `fetch-bulletins`
- Fetches RSS feeds from PIB, Ministry of Agriculture, Ministry of Labour, Rural Development
- Parses XML, strips HTML tags from descriptions
- Categorizes items (Farmer/Worker/General) based on keywords
- Deduplicates by `rss_guid` or `title + publish_date`
- Inserts new items into `bulletin_items`
- Updates `last_fetched_at` timestamp
- Falls back gracefully if RSS fails (database data still serves)
- Auto-seeding: If total entries < 50, triggers a seeding function that uses AI to generate verified scheme summaries

### Edge Function: `get-bulletins`
- Server-side paginated endpoint
- Accepts: `page`, `per_page` (default 9), `category` (optional filter), `language` (for future translation)
- Returns: `{ items: [...], total: number, page: number, totalPages: number }`
- Sorts by `publish_date` DESC
- Translates title/description on-the-fly using Gemini if language is not English (cached)

### Scheduled Refresh
- Set up a `pg_cron` job to call `fetch-bulletins` every 6 hours

### Frontend Changes
- **BulletinBoard.tsx**: Replace local `getNews()` with a call to `get-bulletins` edge function. Add pagination state (currentPage). Render pagination controls below the card grid using the existing `Pagination` component. Maintain filter and language state across pages.
- **BulletinCard.tsx**: Keep existing design. Adapt to new data shape (direct title/description strings instead of translation keys for RSS items, keep translation keys for seeded items).
- **SchemeDetailModal.tsx**: Adapt to handle both old translation-key-based items and new direct-text RSS items.
- Skeleton loading and fade-in animations are already in place and will continue working.

---

## 2. About Page Visual Redesign

### Changes to `About.tsx`
- **Hero Banner**: Replace the current green gradient with a full-width hero section featuring a rural India background image (from Unsplash -- farmers in field). Add a semi-transparent green gradient overlay. Keep the "Gramin Sahayak / Empowering Rural India Digitally" text.
- **Mission Section**: Convert to a two-column grid layout -- mission text on the left, a rural lifestyle image on the right (farmer using mobile phone).
- **What We Do**: Keep existing feature cards but add hover scale/shadow animations. Add "Legal Awareness" and "Multilingual Access" if not already present.
- **Trust Indicators**: Add a new section "Why Trust Gramin Sahayak?" with 4 cards using Lucide icons:
  - Shield icon -- Secure and Private
  - Building icon -- Government Sources Only
  - ShieldCheck icon -- AI-Assisted Verification
  - Accessibility icon -- Built for Accessibility
- **Coming Soon**: Keep existing items (Voice, Location, Women, Dashboard, Doc Upload, WhatsApp).
- All emojis replaced with Lucide icons (already done, will verify).
- Add translation keys for new sections across all 5 languages.

---

## 3. Chatbot Avatar Humanization

### Changes
- Create an array of 5 pre-selected rural Indian farmer/worker profile image URLs (from Unsplash -- friendly, trustworthy, Indian rural backgrounds).
- On session start, randomly select one avatar and store the index in `localStorage` (`gs-chat-avatar`).
- **ChatMessageBubble.tsx**: Replace the `Bot` icon avatar with the selected farmer image using the `Avatar` + `AvatarImage` components. User messages keep the `User` icon.
- **Chat.tsx header**: Replace the `Bot` icon in the header with the same selected avatar image.
- Ensure the avatar remains consistent throughout the session.

### Message Formatting
- Verify that `ChatMessageBubble.tsx` properly renders `**bold**` as `<strong>` (already implemented).
- Ensure no raw markdown stars are visible in the output.

---

## 4. Chat History and Basic Personalization

### Database Changes
- Create `chat_sessions` table:
  - `id` (uuid, primary key)
  - `session_id` (text, not null) -- matches localStorage session
  - `user_role` (text, default 'general') -- farmer/worker/general
  - `language` (text, default 'hi')
  - `created_at` (timestamptz, default now())
- Create `chat_messages` table:
  - `id` (uuid, primary key)
  - `session_id` (text, not null)
  - `sender` (text, not null) -- 'user' or 'bot'
  - `message` (text, not null)
  - `created_at` (timestamptz, default now())
- RLS: Public INSERT and SELECT (session-based, same pattern as existing tables)
- Keep existing `chat_logs` table as-is for analytics

### Frontend Changes
- **Chat.tsx**: On mount, fetch previous messages from `chat_messages` table for the current `session_id` and pre-populate the message list. Save each user message and bot response to `chat_messages` after sending/receiving.
- Add a role selector (Farmer/Worker/General) that persists in localStorage and is sent to the chat edge function.
- Load latest session on open; display previous messages.

### Backend Changes
- **chat edge function**: Accept an optional `user_role` parameter. Modify the system prompt dynamically:
  - If farmer: "Prioritize agriculture schemes, crop advice, PM-KISAN, soil health"
  - If worker: "Prioritize labor rights, MGNREGA, e-Shram, minimum wages"
  - If general: Keep the default broad prompt
- The role is passed from the frontend alongside the language.

---

## Technical Summary

### New Database Tables
1. `bulletin_items` -- RSS and seeded bulletin content
2. `chat_sessions` -- chat session metadata
3. `chat_messages` -- persistent chat message history

### New Edge Functions
1. `fetch-bulletins` -- RSS fetcher + seeder
2. `get-bulletins` -- paginated bulletin API

### Modified Edge Functions
1. `chat` -- add `user_role` support in system prompt

### Modified Frontend Files
1. `BulletinBoard.tsx` -- server-side data fetching + pagination
2. `BulletinCard.tsx` -- adapt to new data shape
3. `SchemeDetailModal.tsx` -- handle direct-text items
4. `About.tsx` -- visual redesign with images, trust section
5. `Chat.tsx` -- avatar, history loading, role selector
6. `ChatMessageBubble.tsx` -- human avatar for bot
7. `translations.ts` -- new keys for trust section, role selector

### New Frontend Files
1. None required -- all changes fit within existing component structure

### Scheduled Job
1. `pg_cron` job to call `fetch-bulletins` every 6 hours

