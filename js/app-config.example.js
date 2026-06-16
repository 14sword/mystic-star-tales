/**
 * Copy this file to js/app-config.js for production.
 * Only use the Supabase anon key in browser code. Never place service role keys here.
 */

window.MYSTIC_APP_CONFIG = {
    supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
    supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',
    publicSiteUrl: 'https://your-domain.example',
    cleanUi: true,
    aiGenerationEnabled: true,
    syncEnabled: true,
    authRedirectPath: './'
};
