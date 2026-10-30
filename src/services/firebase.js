import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// ──────────────────────────────────────────────────────────────
// Firebase Configuration
// ──────────────────────────────────────────────────────────────
// All values are loaded from environment variables (.env file).
// Copy .env.example to .env and paste your real Firebase config.
// ──────────────────────────────────────────────────────────────

const requiredKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
];

const missingKeys = requiredKeys.filter((key) => !import.meta.env[key]);
if (missingKeys.length > 0) {
  console.warn(
    `[Firebase Config Warning]: Missing environment variables: ${missingKeys.join(', ')}. ` +
    `Ensure these are defined in your local .env configuration file.`
  );
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
