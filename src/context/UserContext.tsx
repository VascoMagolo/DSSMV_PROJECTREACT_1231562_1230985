import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
export type CustomUser = {
  id: string;
  email: string;
  username?: string;
  preferred_language?: string;
};

type UserContextType = {
  user: CustomUser | null;
  isLoading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInAsGuest: () => void;
  signOut: () => void;
  updateUserProfile: (updates: Partial<CustomUser>) => Promise<{ error: string | null }>;
};
const UserContext = createContext<UserContextType>({} as UserContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@app_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log('Error loading session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);
  const signIn = async (email: string, passwordInput: string) => {
    try {
      setIsLoading(true);
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !userData) {
        setIsLoading(false);
        return { error: 'User not found.' };
      }
      if (userData.password !== passwordInput) {
        setIsLoading(false);
        return { error: 'Incorrect password.' };
      }

      const userToSave = {
        id: userData.id,
        email: userData.email,
        username: userData.name,
        preferred_language: userData.preferred_language
      };
      setUser(userToSave);
      await AsyncStorage.setItem('@app_user', JSON.stringify(userToSave));
      setIsGuest(false);

      return { error: null };

    } catch (err) {
      return { error: 'Unexpected error during login.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsGuest = () => {
    setIsGuest(true);
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      await AsyncStorage.removeItem('@app_user');
      setUser(null);
      setIsGuest(false);
      console.log('Signed out successfully.');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateUserProfile = async (updates: Partial<CustomUser>) => {
    if (!user || isGuest) return { error: "Action not allowed for guest or logged out users." };

    try {
      const updatesForDb: any = {};
      
      if (updates.username !== undefined) {
        updatesForDb.name = updates.username; 
      }
      if (updates.preferred_language !== undefined) {
        updatesForDb.preferred_language = updates.preferred_language;
      }
      const { error } = await supabase
        .from('users')
        .update(updatesForDb)
        .eq('id', user.id);

      if (error) {
        console.error("Supabase update error:", error);
        throw new Error(error.message);
      }
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      await AsyncStorage.setItem('@app_user', JSON.stringify(updatedUser));

      return { error: null };

    } catch (err: any) {
      return { error: err.message || 'Error updating profile.' };
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoading, isGuest, signIn, signInAsGuest, signOut, updateUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useAuth = () => useContext(UserContext);