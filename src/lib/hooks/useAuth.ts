// src/lib/hooks/useAuth.ts
'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import { db } from '../firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Check the Allowlist in Firestore
      const docRef = doc(db, 'allowlist', email);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Access Denied: This email is not on the allowlist.');
      }

      // 2. If allowed, proceed with login
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      if (err.message.includes('Access Denied')) {
        setError(err.message);
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else {
        setError('Failed to log in');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Check the Allowlist in Firestore
      const docRef = doc(db, 'allowlist', email);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Access Denied: This email is not on the allowlist.');
      }

      // 2. If allowed, create the account
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      if (err.message.includes('Access Denied')) {
        setError(err.message);
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else {
        setError('Failed to create account');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };
};
