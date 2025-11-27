import React, { createContext, useState, useContext, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './UserContext'; 
export type Phrase = {
  id: string;
  text: string;     
  category: string;
  language: string;
  user_id?: string;
  translation?: string; };

type PhrasesContextType = {
  userPhrases: Phrase[];
  genericPhrases: Phrase[];
  isLoading: boolean;
  fetchPhrases: (language: string) => Promise<void>;
  addPhrase: (text: string, language: string, category?: string) => Promise<void>;
  deletePhrase: (id: string) => Promise<void>;
};

const PhrasesContext = createContext<PhrasesContextType>({} as PhrasesContextType);

export const PhrasesProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [userPhrases, setUserPhrases] = useState<Phrase[]>([]);
  const [genericPhrases, setGenericPhrases] = useState<Phrase[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPhrases = useCallback(async (language: string) => {
    setIsLoading(true);
    try {
      const { data: genericData } = await supabase
        .from('generic_phrases')
        .select('*')
        .eq('language', language);
      
      setGenericPhrases(genericData || []);

      if (user) {
        const { data: userData } = await supabase
          .from('user_phrases')
          .select('*')
          .eq('user_id', user.id)
          .eq('language', language)
          .order('created_at', { ascending: false });

        setUserPhrases(userData || []);
      } else {
        setUserPhrases([]);
      }

    } catch (error) {
      console.error('Error fetching phrases:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  const addPhrase = async (text: string, language: string, category: string = 'Personal') => {
    if (!user) return;
    try {
      const { error } = await supabase.from('user_phrases').insert({
        user_id: user.id,
        text: text,
        language: language,
        category: category,
      });

      if (error) throw error;
    
      await fetchPhrases(language);
      
    } catch (err) {
      console.error("Error adding phrase:", err);
      throw err;
    }
  };

  const deletePhrase = async (id: string) => {
    try {
      const { error } = await supabase.from('user_phrases').delete().eq('id', id);
      if (error) throw error;
      setUserPhrases(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Error deleting phrase:", err);
    }
  };

  return (
    <PhrasesContext.Provider value={{ 
      userPhrases, 
      genericPhrases, 
      isLoading, 
      fetchPhrases, 
      addPhrase, 
      deletePhrase 
    }}>
      {children}
    </PhrasesContext.Provider>
  );
};

export const usePhrases = () => {
  const context = useContext(PhrasesContext);
  if (!context) throw new Error("usePhrases must be used within a PhrasesProvider");
  return context;
};