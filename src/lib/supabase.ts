import { firebaseClient } from './firebaseBackend';

console.info(
  '%c[LOGOS] Google Cloud Firebase Connected%c Database (Cloud Firestore) & Genuine Auth (Gmail/Google)',
  'background: #ea4335; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
  'color: inherit;'
);

// Main export used throughout the application
export const supabase: any = firebaseClient;
