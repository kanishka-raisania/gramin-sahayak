

# Plan: Fix Bulletin Bugs, Translate Dynamic Content, and Convert to Installable PWA

## Bugs to Fix

### 1. Same Image on All Cards
**Root cause**: The RSS edge function (`fetch-bulletin-rss/index.ts`) assigns a single fallback Unsplash image per category. All "General" items get the same photo.

**Fix**: Use multiple images per category (5-6 each) and rotate based on the item index or a hash of the title. This gives visual variety without requiring real images from RSS feeds (which rarely provide them).

### 2. Dynamic RSS Titles Always in Hindi/English
**Root cause**: PIB RSS feeds return titles in English (`Lang=1`). Dynamic items bypass the translation system (`isDynamic ? item.titleKey : t(...)`) and display the raw RSS text regardless of selected language.

**Fix**: Add on-the-fly translation for dynamic bulletin items using Lovable AI (Gemini Flash). Create a new edge function `translate-bulletin` that translates title + description into the user's selected language. Cache translations in a new `bulletin_translations` DB table so each item is translated only once per language. The frontend will check for cached translations before showing raw text.

## New Features

### 3. PWA Setup (Installable App)
- Add a `manifest.json` with Gramin Sahayak branding, green theme color, and PWA icons
- Add `display: "standalone"` for home screen install
- Add mobile-optimized meta tags to `index.html`
- Add iframe/preview guard so service workers do not interfere with the Lovable editor
- No `vite-plugin-pwa` needed — just the manifest for installability (no offline service worker complexity)

### 4. Fix `index.html` Metadata
- Update title to "Gramin Sahayak"
- Update meta description and OG tags for the app's branding

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `supabase/functions/translate-bulletin/index.ts` | Edge function: translates title+desc via Gemini Flash, caches in DB |
| `public/manifest.json` | PWA manifest with app name, icons, theme color |
| `public/icons/icon-192.png` | PWA icon (generated from existing logo) |
| `public/icons/icon-512.png` | PWA icon large |

### Database Migration
- New table `bulletin_translations` with columns: `bulletin_id`, `language`, `title`, `description`, unique on `(bulletin_id, language)`
- RLS: public read access (translations are not sensitive)

### Files to Modify
| File | Changes |
|------|---------|
| `supabase/functions/fetch-bulletin-rss/index.ts` | Rotate through multiple images per category instead of one |
| `src/services/bulletinService.ts` | Accept `language` param, fetch translations from `bulletin_translations`, merge into items |
| `src/components/BulletinBoard.tsx` | Pass current language to service, trigger translation for uncached items |
| `src/components/BulletinCard.tsx` | Use translated title/desc when available |
| `src/components/SchemeDetailModal.tsx` | Use translated content for dynamic items |
| `index.html` | Update title, meta tags, add manifest link and mobile meta tags |

### Translation Flow
```text
User opens bulletin (language=Bengali)
  -> bulletinService fetches items from DB
  -> For each dynamic item, check bulletin_translations for Bengali
  -> If missing: call translate-bulletin edge function (fire-and-forget, batch)
  -> Show original text with a small "translating..." indicator
  -> On next load, cached translation is used
```

### Image Rotation
```text
Category "General" images pool:
  - Community gathering, healthcare, education, rural development, government building, digital India
Category "Farmer" images pool:
  - Rice paddies, wheat fields, tractor, irrigation, farmer market, livestock
Category "Worker" images pool:
  - Construction, factory, artisan, skill training, workers gathering, tools

Each item gets: imagePool[hash(title) % poolSize]
```

## Implementation Order
1. Fix image variety in RSS edge function (redeploy)
2. Create `bulletin_translations` table
3. Create `translate-bulletin` edge function
4. Update frontend service + components for translated content
5. Update `index.html` metadata
6. Add PWA manifest and icons

