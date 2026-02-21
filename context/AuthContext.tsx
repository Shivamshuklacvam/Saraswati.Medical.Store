import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { User } from '../types';

interface AuthContextType {
    user: FirebaseUser | null;
    userProfile: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string, role?: 'customer' | 'admin') => Promise<void>;
    logOut: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                try {
                    const profileSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (profileSnap.exists()) {
                        setUserProfile({ id: profileSnap.id, ...profileSnap.data() } as User);
                    } else {
                        console.warn("User profile document not found in Firestore.");
                    }
                } catch (error: any) {
                    console.error("Error fetching user profile:", error);
                    if (error.code === 'unavailable' || error.message?.includes('offline')) {
                        // We don't alert every time to avoid spam, but we ensure the app isn't stuck
                    }
                }
            } else {
                setUser(null);
                setUserProfile(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signUp = async (email: string, password: string, name: string, role: 'customer' | 'admin' = 'customer') => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const profile: Omit<User, 'id'> = { name, email, role, healthPoints: 0 };
        await setDoc(doc(db, 'users', cred.user.uid), profile);
        setUserProfile({ id: cred.user.uid, ...profile });
    };

    const logOut = async () => {
        await signOut(auth);
        setUser(null);
        setUserProfile(null);
    };

    const updateProfile = async (data: Partial<User>) => {
        if (!user) return;
        await setDoc(doc(db, 'users', user.uid), data, { merge: true });
        setUserProfile(prev => prev ? { ...prev, ...data } : null);
    };

    const value = useMemo(() => ({
        user,
        userProfile,
        loading,
        signIn,
        signUp,
        logOut,
        updateProfile
    }), [user, userProfile, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
