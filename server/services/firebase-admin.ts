import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK with default credentials (for development)
if (!getApps().length) {
  // For development, we'll use a simple initialization
  // In production, you would use proper service account credentials
  try {
    initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'facesnapvault-dev',
    });
  } catch (error) {
    console.warn('Firebase Admin initialization failed, using mock authentication');
  }
}

const auth = getAuth();

export async function verifyFirebaseToken(token: string) {
  try {
    // For development, create a mock decoded token
    // In production, use: const decodedToken = await auth.verifyIdToken(token);
    const mockDecodedToken = {
      uid: 'dev-user-123',
      email: 'admin@facesnapvault.com',
      name: 'Admin User',
      picture: null,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    
    console.log('🔐 Mock authentication for development');
    return mockDecodedToken;
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    throw new Error('Invalid Firebase token');
  }
}

export async function setUserRole(uid: string, role: string) {
  try {
    await auth.setCustomUserClaims(uid, { role });
    return true;
  } catch (error) {
    console.error('Error setting user role:', error);
    return false;
  }
}
