'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, type Firestore }from 'firebase/firestore';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { firebaseConfig } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  app: FirebaseApp;
  auth: ReturnType<typeof getAuth>;
  db: Firestore;
}

const AuthContext = createContext<AuthContextType | null>(null);

function initializeClientApp() {
  if (getApps().length > 0) {
      return getApp();
  }
  return initializeApp(firebaseConfig);
}

const unauthenticatedRoutes = ['/login', '/signup'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebase, setFirebase] = useState<{
    app: FirebaseApp;
    auth: ReturnType<typeof getAuth>;
    db: Firestore;
  } | null>(null);
  const router = useRouter();
  const pathname = usePathname();


  useEffect(() => {
    const app = initializeClientApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    setFirebase({ app, auth, db });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser && !unauthenticatedRoutes.includes(pathname)) {
        router.push('/login');
      } else if (currentUser && unauthenticatedRoutes.includes(pathname)) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  if (loading || !firebase) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }
  
  if (!user && !unauthenticatedRoutes.includes(pathname)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="w-full max-w-2xl space-y-4">
          <p>Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading, ...firebase }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
