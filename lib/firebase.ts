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
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import {
  CandidateItem,
  RecruiterProfile,
  ActivityLogItem,
  AppSettings,
  CollaboratorParty,
  Team,
  TeamJoinRequest,
} from "./types";

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

// Firestore Sync: Get all candidates from Cloud Firestore
export async function getCandidatesFromFirestore(): Promise<CandidateItem[]> {
  try {
    const coll = collection(db, "candidates");
    const q = query(coll, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const list: CandidateItem[] = [];
    snap.forEach((d) => {
      list.push(d.data() as CandidateItem);
    });
    return list;
  } catch (err) {
    console.warn("Firestore get candidates error:", err);
    return [];
  }
}

// Firestore Sync: Real-time listener for candidates collection
export function subscribeToCandidatesFromFirestore(
  callback: (candidates: CandidateItem[]) => void
) {
  try {
    const coll = collection(db, "candidates");
    const q = query(coll, orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: CandidateItem[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as CandidateItem);
        });
        callback(list);
      },
      (error) => {
        console.warn("Firestore candidates subscription error:", error);
      }
    );
  } catch (err) {
    console.warn("Firestore candidates subscription init error:", err);
    return () => {};
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

// Firestore Sync: Real-time listener for activity logs
export function subscribeToActivityLogsFromFirestore(
  callback: (logs: ActivityLogItem[]) => void
) {
  try {
    const logsRef = collection(db, "activity_logs");
    const q = query(logsRef, orderBy("timestamp", "desc"), limit(100));
    return onSnapshot(
      q,
      (snapshot) => {
        const logs: ActivityLogItem[] = [];
        snapshot.forEach((d) => {
          logs.push(d.data() as ActivityLogItem);
        });
        callback(logs);
      },
      (err) => {
        console.warn("Firestore activity logs subscription error:", err);
      }
    );
  } catch (err) {
    console.warn("Firestore activity logs subscription init error:", err);
    return () => {};
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

// ==========================================
// COLLABORATOR PARTIES FIRESTORE OPERATIONS
// ==========================================

// Firestore Sync: Save / update party member
export async function savePartyToFirestore(party: CollaboratorParty) {
  try {
    const docRef = doc(db, "parties", party.id);
    await setDoc(docRef, {
      ...party,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Firestore save party error:", err);
  }
}

// Firestore Sync: Delete party member
export async function deletePartyFromFirestore(partyId: string) {
  try {
    const docRef = doc(db, "parties", partyId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn("Firestore delete party error:", err);
  }
}

// Firestore Sync: Get all parties
export async function getPartiesFromFirestore(): Promise<CollaboratorParty[]> {
  try {
    const partiesRef = collection(db, "parties");
    const q = query(partiesRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const parties: CollaboratorParty[] = [];
    snap.forEach((d) => {
      parties.push(d.data() as CollaboratorParty);
    });
    return parties;
  } catch (err) {
    console.warn("Firestore get parties error:", err);
    return [];
  }
}

// Firestore Sync: Real-time listener for collaborator parties
export function subscribeToPartiesFromFirestore(
  callback: (parties: CollaboratorParty[]) => void
) {
  try {
    const partiesRef = collection(db, "parties");
    const q = query(partiesRef, orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const parties: CollaboratorParty[] = [];
        snapshot.forEach((d) => {
          parties.push(d.data() as CollaboratorParty);
        });
        callback(parties);
      },
      (err) => {
        console.warn("Firestore parties subscription error:", err);
      }
    );
  } catch (err) {
    console.warn("Firestore parties subscription init error:", err);
    return () => {};
  }
}

// ==========================================
// TEAMS & COLLABORATION FIREBASE SYNC
// ==========================================

// Save or update team document
export async function saveTeamToFirestore(team: Team) {
  try {
    const docRef = doc(db, "teams", team.id);
    await setDoc(docRef, {
      ...team,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Firestore save team error:", err);
  }
}

// Get user's own team
export async function getMyTeamFromFirestore(ownerUid: string): Promise<Team | null> {
  try {
    const teamsRef = collection(db, "teams");
    const q = query(teamsRef, where("ownerUid", "==", ownerUid), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as Team;
    }
    return null;
  } catch (err) {
    console.warn("Firestore get my team error:", err);
    return null;
  }
}

// Real-time subscription to user's own team
export function subscribeToMyTeamFromFirestore(
  ownerUid: string,
  callback: (team: Team | null) => void
) {
  try {
    const teamsRef = collection(db, "teams");
    const q = query(teamsRef, where("ownerUid", "==", ownerUid), limit(1));
    return onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          callback(snap.docs[0].data() as Team);
        } else {
          callback(null);
        }
      },
      (err) => {
        console.warn("Firestore my team subscription error:", err);
      }
    );
  } catch (err) {
    console.warn("Firestore my team subscription init error:", err);
    return () => {};
  }
}

// Search public teams by query (matches team name or owner username)
export async function searchTeamsFromFirestore(queryText: string): Promise<Team[]> {
  try {
    const cleanQ = queryText.trim().toLowerCase().replace(/^@/, "");
    const teamsRef = collection(db, "teams");
    const snap = await getDocs(teamsRef);
    const results: Team[] = [];
    snap.forEach((d) => {
      const data = d.data() as Team;
      const teamName = (data.name || "").toLowerCase();
      const ownerUser = (data.ownerUsername || "").toLowerCase().replace(/^@/, "");
      const ownerName = (data.ownerName || "").toLowerCase();

      // Show if matches and either isPublic is true OR search matches exact username
      if (
        data.isPublic ||
        ownerUser === cleanQ ||
        teamName.includes(cleanQ)
      ) {
        if (
          !cleanQ ||
          teamName.includes(cleanQ) ||
          ownerUser.includes(cleanQ) ||
          ownerName.includes(cleanQ)
        ) {
          results.push(data);
        }
      }
    });
    return results;
  } catch (err) {
    console.warn("Firestore search teams error:", err);
    return [];
  }
}

// Send a join request to a team
export async function sendTeamJoinRequestToFirestore(req: TeamJoinRequest) {
  try {
    const docRef = doc(db, "team_requests", req.id);
    await setDoc(docRef, {
      ...req,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Firestore send team request error:", err);
  }
}

// Real-time listener for incoming team join requests for owner's team
export function subscribeToTeamRequestsFromFirestore(
  teamId: string,
  callback: (requests: TeamJoinRequest[]) => void
) {
  try {
    const reqsRef = collection(db, "team_requests");
    const q = query(
      reqsRef,
      where("teamId", "==", teamId),
      where("status", "==", "PENDING")
    );
    return onSnapshot(
      q,
      (snap) => {
        const reqs: TeamJoinRequest[] = [];
        snap.forEach((d) => {
          reqs.push(d.data() as TeamJoinRequest);
        });
        callback(reqs);
      },
      (err) => {
        console.warn("Firestore team requests subscription error:", err);
      }
    );
  } catch (err) {
    console.warn("Firestore team requests subscription init error:", err);
    return () => {};
  }
}

// Accept or reject a team join request
export async function updateTeamRequestStatusInFirestore(
  requestId: string,
  status: "ACCEPTED" | "REJECTED"
) {
  try {
    const docRef = doc(db, "team_requests", requestId);
    await updateDoc(docRef, {
      status,
      respondedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Firestore update team request status error:", err);
  }
}
