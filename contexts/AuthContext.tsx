import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../services/firebase';

interface UserProfile {
    displayName: string;
    email: string;
    photoURL?: string;
    username?: string;
    // adicione quaisquer outros campos que você tenha em seu perfil de usuário
}

interface AuthContextType {
    currentUser: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    userProfile: null,
    loading: true,
    isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

// UIDs de administradores
const ADMIN_UIDS = ['YHBxowyZv0hzld7hypnEWHvx5K82', 'tMdWtkeZ7PYBk4l4UNKnbrLQ4i32'];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                // Buscar perfil do Firestore
                const userDocRef = doc(firestore, 'users', user.uid);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    setUserProfile(docSnap.data() as UserProfile);
                }
                // Verificar se é admin
                setIsAdmin(ADMIN_UIDS.includes(user.uid));
            } else {
                setUserProfile(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = {
        currentUser,
        userProfile,
        loading,
        isAdmin,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};