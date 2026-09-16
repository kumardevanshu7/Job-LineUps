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
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { CandidateItem, RecruiterProfile, ActivityLogItem, AppSettings } from "./types";

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

// Firestore Sync: Get single candidate by ID
export async function getCandidateFromFirestore(
  candidateId: string
): Promise<CandidateItem | null> {
  try {
    const docRef = doc(db, "candidates", candidateId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as CandidateItem;
    }
    return null;
  } catch (err) {
    console.warn("Firestore get candidate error:", err);
    return null;
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

// Firestore Sync: Delete candidate
export async function deleteCandidateFromFirestore(candidateId: string) {
  try {
    const docRef = doc(db, "candidates", candidateId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn("Firestore delete candidate error:", err);
  }
}

// Firestore Sync: Save activity log entry
export async function saveActivityLogToFirestore(logItem: ActivityLogItem) {
  try {
    const docRef = doc(db, "activity_logs", logItem.id);
    await setDoc(docRef, logItem);
  } catch (err) {
    console.warn("Firestore activity log save error:", err);
  }
}

// Firestore Sync: Get recent activity logs
export async function getActivityLogsFromFirestore(): Promise<ActivityLogItem[]> {
  try {
    const logsRef = collection(db, "activity_logs");
    const q = query(logsRef, orderBy("timestamp", "desc"), limit(50));
    const snap = await getDocs(q);
    const logs: ActivityLogItem[] = [];
    snap.forEach((d) => {
      logs.push(d.data() as ActivityLogItem);
    });
    return logs;
  } catch (err) {
    console.warn("Firestore get activity logs error:", err);
    return [];
  }
}

// Firestore Sync: Save app settings (e.g. security PIN)
export async function saveSettingsToFirestore(settings: AppSettings) {
  try {
    const docRef = doc(db, "settings", "global_config");
    await setDoc(docRef, {
      ...settings,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Firestore save settings error:", err);
  }
}

// Firestore Sync: Get app settings
export async function getSettingsFromFirestore(): Promise<AppSettings | null> {
  try {
    const docRef = doc(db, "settings", "global_config");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as AppSettings;
    }
    return null;
  } catch (err) {
    console.warn("Firestore get settings error:", err);
    return null;
  }
}
