import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import type { User, UserRole } from '../types';

function getAdminEmail(): string {
  return import.meta.env.VITE_ADMIN_EMAIL || '';
}

function determineRole(email: string): UserRole {
  const adminEmail = getAdminEmail();
  const role: UserRole = email === adminEmail ? 'SUPER_ADMIN' : 'CUSTOMER';
  console.log('[Auth] Authenticated email:', email);
  console.log('[Auth] VITE_ADMIN_EMAIL:', adminEmail);
  console.log('[Auth] Assigned role:', role);
  return role;
}

async function ensureUserProfile(uid: string, email: string, displayName: string): Promise<void> {
  const role = determineRole(email);
  const userRef = doc(db, 'users', uid);
  const existingDoc = await getDoc(userRef);

  if (!existingDoc.exists()) {
    const userData = {
      uid,
      email,
      displayName,
      role,
      isActive: true,
      createdAt: serverTimestamp(),
    };
    await setDoc(userRef, userData);
    console.log('[Auth] Firestore user profile created:', userData);
  } else {
    const currentData = existingDoc.data();
    // Upgrade to SUPER_ADMIN if email matches admin and role is not already set
    if (email === getAdminEmail() && currentData.role !== 'SUPER_ADMIN') {
      await setDoc(userRef, { role: 'SUPER_ADMIN', isActive: true }, { merge: true });
      console.log('[Auth] Firestore user profile upgraded to SUPER_ADMIN');
    } else {
      console.log('[Auth] Firestore user profile already exists:', currentData);
    }
  }
}

export async function registerUser(
  email: string,
  password: string,
  displayName: string
): Promise<void> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  console.log('[Auth] User registered:', email);
  await ensureUserProfile(credential.user.uid, email, displayName);
}

export async function loginUser(email: string, password: string): Promise<void> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  console.log('[Auth] User logged in with email:', email);
  const displayName = credential.user.displayName || email;
  await ensureUserProfile(credential.user.uid, email, displayName);
}

export async function loginWithGoogle(): Promise<void> {
  try {
    const provider = new GoogleAuthProvider();
    console.log('[Auth] Starting Google sign-in popup...');
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const email = user.email || '';
    const displayName = user.displayName || email;
    console.log('[Auth] Google sign-in successful for:', email);
    await ensureUserProfile(user.uid, email, displayName);
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    console.error('[Auth] Google sign-in error:', err.code, err.message);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
  console.log('[Auth] User logged out');
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
  console.log('[Auth] Password reset email sent to:', email);
}

export async function getUserData(uid: string): Promise<User | null> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  // Migrate old role values
  let role: UserRole = data.role;
  if (role === 'admin' as unknown) role = 'ADMIN';
  if (role === 'customer' as unknown) role = 'CUSTOMER';
  return {
    uid: data.uid,
    email: data.email,
    displayName: data.displayName,
    role,
    active: data.isActive ?? data.active ?? true,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? undefined,
  };
}
