/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { type User } from '@supabase/supabase-js';

type Profile = {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'student';
};

type AuthContextType = {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    signOut: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (data) setProfile(data as Profile);
        if (error) console.error("Error fetching profile:", error);
    };

    useEffect(() => {
        const checkAuth = async () => {
            const storedMock = localStorage.getItem('mock_auth_user');
            if (storedMock) {
                const mockProf = JSON.parse(storedMock);
                setUser({ id: mockProf.id } as User);
                setProfile(mockProf);
                setLoading(false);
                return;
            }

            // Real Supabase Auth Flow
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchProfile(session.user.id);
            }
            setLoading(false);
        };

        checkAuth();

        const handleMockAuthChange = () => {
            checkAuth();
        };

        window.addEventListener('mock-auth-changed', handleMockAuthChange);

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!localStorage.getItem('mock_auth_user')) {
                setUser(session?.user ?? null);
                if (session?.user) {
                    fetchProfile(session.user.id).finally(() => setLoading(false));
                } else {
                    setProfile(null);
                    setLoading(false);
                }
            }
        });

        return () => {
            window.removeEventListener('mock-auth-changed', handleMockAuthChange);
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        localStorage.removeItem('mock_auth_user');
        window.dispatchEvent(new Event('mock-auth-changed'));
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
