import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserData, loginUser, logoutUser, registerUser, sendPasswordReset } from '../firebase/auth';
import type { User, UserRole, RolePermissions } from '../types';
import { ROLE_PERMISSIONS } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  isAdmin: boolean;
  loading: boolean;
  role: UserRole;
  permissions: RolePermissions;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await getUserData(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const role: UserRole = userProfile?.role ?? 'CUSTOMER';
  const permissions = ROLE_PERMISSIONS[role];
  const isAdmin = permissions.canAccessAdmin;

  const hasPermission = (permission: keyof RolePermissions): boolean => {
    return permissions[permission];
  };

  const login = async (email: string, password: string) => {
    await loginUser(email, password);
  };

  const logout = async () => {
    await logoutUser();
  };

  const register = async (email: string, password: string, displayName: string) => {
    await registerUser(email, password, displayName);
  };

  const forgotPassword = async (email: string) => {
    await sendPasswordReset(email);
  };

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, isAdmin, loading, role, permissions, hasPermission, login, logout, register, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
