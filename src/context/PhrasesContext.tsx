import React, { createContext, useState, useContext, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './UserContext';
import { translationAPI } from '../api/translationAPI';
export type Phrase = {
  id: string;
  text: string;
  category: string;
  language: string;
  user_id?: string;
  translation?: string;
};

type PhrasesContextType = {
  userPhrases: Phrase[];
  genericPhrases: Phrase[];
  isLoading: boolean;
  fetchPhrases: (language: string) => Promise<void>;
  addPhrase(adds: Partial<Phrase>): Promise<{ error: string | null; detectedLanguage?: string }>;
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

  const addPhrase = async (adds: Partial<Phrase>): Promise<{ error: string | null; detectedLanguage?: string }> => {
    if (!user) return { error: 'Not authenticated' };
    if (!adds.text) return { error: 'Text is required' };
    try {
      const detectedLang = await translationAPI.detectLanguage(adds.text);
      console.log("Detected language:", detectedLang);
      const { error } = await supabase.from('user_phrases').insert({
        user_id: user.id,
        text: adds.text,
        language: detectedLang,
        category: adds.category || 'Personal',
      });
      if (error) {
        console.error("Error adding phrase:", error);
        throw error;
      }
      await fetchPhrases(detectedLang);
      return { error: null, detectedLanguage: detectedLang };
    } catch (err: any) {
      console.error("Error adding phrase:", err);
      return { error: err.message || String(err) };
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