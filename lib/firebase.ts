import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { CandidateItem, RecruiterProfile } from "./types";

export const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyClH6SvXk57aopwOyKdqohKjWnQXHD8xhg",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "pro8-job-portal.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "pro8-job-portal",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "pro8-job-portal.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "349344405596",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:349344405596:web:d45921514a00b34e6b6e99",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-5F0JXRBJPD",
};

// Initialize Firebase singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Auth & Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Firestore Database
export const db = getFirestore(app);

// Google Sign-In Only Function
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    // Fallback to redirect if popup is blocked on mobile browsers
    if (
      err.code === "auth/popup-blocked" ||
      err.code === "auth/cancelled-popup-request"
    ) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw error;
  }
}

// Sign Out
export async function logOutRecruiter(): Promise<void> {
  await signOut(auth);
}

// Auth State Listener
export function onRecruiterAuthStateChanged(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(auth, callback);
}

// Firestore Sync: Save candidate to Cloud Firestore
export async function syncCandidateToFirestore(candidate: CandidateItem) {
  try {
    const docRef = doc(db, "candidates", candidate.id);
    await setDoc(docRef, {
      ...candidate,
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Firestore candidate sync error:", err);
  }
}

// Firestore Sync: Update candidate in Cloud Firestore
export async function updateCandidateInFirestore(
  candidateId: string,
  updates: Partial<CandidateItem>
) {
  try {
    const docRef = doc(db, "candidates", candidateId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Firestore update error:", err);
  }
}

// Firestore Sync: Save recruiter onboarding profile
export async function saveRecruiterProfileToFirestore(profile: RecruiterProfile) {
  try {
    const docRef = doc(db, "recruiters", profile.uid);
    await setDoc(docRef, {
      ...profile,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Firestore save recruiter profile error:", err);
  }
}

// Firestore Sync: Get recruiter onboarding profile
export async function getRecruiterProfileFromFirestore(
  uid: string
): Promise<RecruiterProfile | null> {
  try {
    const docRef = doc(db, "recruiters", uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as RecruiterProfile;
    }
    return null;
  } catch (err) {
    console.warn("Firestore get recruiter profile error:", err);
    return null;
  }
}
