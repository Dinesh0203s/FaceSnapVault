import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAiARPbRUfUjY8dagq-yDtN0HC12o8X89U",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "faceai-799e4.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "faceai-799e4",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "faceai-799e4.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "977507945744",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:977507945744:web:095846cf5688a1b8c8a995",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-BCT1RHZ4ZT"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Google Auth Provider
const provider = new GoogleAuthProvider();
provider.addScope('email');
provider.addScope('profile');

// Sign in with Google popup (better for development)
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

// Fallback redirect method
export function signInWithGoogleRedirect() {
  return signInWithRedirect(auth, provider);
}

// Handle redirect result
export function handleRedirectResult() {
  return getRedirectResult(auth);
}

export { GoogleAuthProvider };
