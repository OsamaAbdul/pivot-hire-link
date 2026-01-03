/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_REDIRECT_URL: string; 
  readonly VITE_ADMIN_ALLOWLIST?: string;
  readonly VITE_ADMIN_DOMAIN?: string;
  readonly VITE_ADMIN_DEBUG_ANY?: string; // "true" to allow any authenticated user
  readonly VITE_ADMIN_DEBUG_EMAIL?: string; // specific email to allow
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
