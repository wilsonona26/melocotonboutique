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

export async function registerUser(
  email: string,
  password: string,
  displayName: string
): Promise<void> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  const role: UserRole = email === adminEmail ? 'SUPER_ADMIN' : 'CUSTOMER';
  await setDoc(doc(db, 'users', credential.user.uid), {
    uid: credential.user.uid,
    email,
    displayName,
    role,
    active: true,
    createdAt: serverTimestamp(),
  });
}

export async function loginUser(email: string, password: string): Promise<void> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  if (email === adminEmail) {
    const userRef = doc(db, 'users', credential.user.uid);
    const existingDoc = await getDoc(userRef);
    if (!existingDoc.exists() || existingDoc.data().role !== 'SUPER_ADMIN') {
      await setDoc(userRef, {
        uid: credential.user.uid,
        email,
        displayName: credential.user.displayName || email,
        role: 'SUPER_ADMIN' as UserRole,
        active: true,
        createdAt: serverTimestamp(),
      }, { merge: true });
    }
  }
}

export async function loginWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const email = user.email || '';
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  const role: UserRole = email === adminEmail ? 'SUPER_ADMIN' : 'CUSTOMER';

  const userRef = doc(db, 'users', user.uid);
  const existingDoc = await getDoc(userRef);

  if (!existingDoc.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email,
      displayName: user.displayName || email,
      role,
      active: true,
      createdAt: serverTimestamp(),
    });
  } else if (email === adminEmail && existingDoc.data().role !== 'SUPER_ADMIN') {
    await setDoc(userRef, { role: 'SUPER_ADMIN', active: true }, { merge: true });
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
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
    active: data.active ?? true,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? undefined,
  };
}
