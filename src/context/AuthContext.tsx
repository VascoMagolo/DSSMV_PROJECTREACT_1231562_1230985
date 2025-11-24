import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
export type CustomUser = {
  id: string;
  email: string;
  username?: string;
  preferredLanguage?: string;
};

type AuthContextType = {
  user: CustomUser | null;
  isLoading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInAsGuest: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

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
        console.log('Erro ao carregar sessão:', error);
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
        return { error: 'Utilizador não encontrado.' };
      }
      if (userData.password !== passwordInput) {
        setIsLoading(false);
        return { error: 'Password incorreta.' };
      }

      const userToSave = {
          id: userData.id,
          email: userData.email,
          username: userData.username ,
          preferredLanguage: userData.preferredLanguage
      };

      setUser(userToSave);
      await AsyncStorage.setItem('@app_user', JSON.stringify(userToSave));
      setIsGuest(false);
      
      return { error: null };

    } catch (err) {
      return { error: 'Erro inesperado no login.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsGuest = () => {
    setIsGuest(true);
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('@app_user');
      setUser(null);
      setIsGuest(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isGuest, signIn, signInAsGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);