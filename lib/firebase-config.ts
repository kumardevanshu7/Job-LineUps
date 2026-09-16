// ===============================================================
// TalentFlow Firebase Configuration Template
// When you provide your Firebase project details, paste them in .env
// or replace the fallback values below.
// ===============================================================

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== ""
  );
};
