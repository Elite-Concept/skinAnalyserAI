/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_FIREBASE_CONFIG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}