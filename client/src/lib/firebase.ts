import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAiARPbRUfUjY8dagq-yDtN0HC12o8X89U",
  authDomain: "faceai-799e4.firebaseapp.com",
  projectId: "faceai-799e4",
  storageBucket: "faceai-799e4.firebasestorage.app",
  messagingSenderId: "977507945744",
  appId: "1:977507945744:web:095846cf5688a1b8c8a995",
  measurementId: "G-BCT1RHZ4ZT"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Google Auth Provider
const provider = new GoogleAuthProvider();

// Sign in with Google redirect
export function signInWithGoogle() {
  return signInWithRedirect(auth, provider);
}

// Handle redirect result
export function handleRedirectResult() {
  return getRedirectResult(auth);
}

export { GoogleAuthProvider };
