# Mystic Star Tales Deployment

## Runtime

This project remains a static PWA. It can run fully offline without Supabase keys.

For production:

1. Copy `js/app-config.example.js` to `js/app-config.js`.
2. Fill `supabaseUrl`, `supabaseAnonKey`, and `publicSiteUrl`.
3. Create a Supabase project and run `supabase/schema.sql`.
4. Create a private Storage bucket named `generated-assets`.
5. Deploy the Edge Functions in `supabase/functions/*`.
6. Configure server-only environment variables for Edge Functions:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`

## Auth

The browser uses Supabase email OTP / magic link. Phone login is intentionally not part of v1.

## Offline data

The app uses IndexedDB database `mystic_star_tales` and mirrors legacy `mysticStar_*` localStorage values. Visitors can use the app without login; after login, local data is queued for cloud sync.

## AI images

Packaged story images and `assets/generated/asset-manifest.json` are cached for offline use. Online personalized image generation is routed through the `generate-story-image` Edge Function so the OpenAI key never appears in browser code.
