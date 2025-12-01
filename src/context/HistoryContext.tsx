import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './UserContext';

export type TranslationRecord = {
  id: string;
  user_id: string;
  original_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  is_favorite: boolean;
  timestamp: string;
};

type HistoryContextType = {
  translationHistory: TranslationRecord[];
  isLoading: boolean;
  refreshHistory: () => Promise<void>;
  saveTranslation: (
    original: string, 
    translated: string, 
    source: string, 
    target: string
  ) => Promise<void>;
  deleteTranslation: (id: string) => Promise<void>;
  toggleFavorite: (id: string, isFavorite: boolean) => Promise<void>;
};

const HistoryContext = createContext<HistoryContextType>({} as HistoryContextType);

export const HistoryProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [translationHistory, setTranslationHistory] = useState<TranslationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetchTranslationHistory = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('user_id', user.id)
        .order('is_favorite', { ascending: false })
        .order('timestamp', { ascending: false });

      if (error) throw error;

      if (data) {
        setTranslationHistory(data as TranslationRecord[]);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchTranslationHistory();
  }, [user]);

  const saveTranslation = async (original: string, translated: string, source: string, target: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('translations').insert({
        user_id: user.id,
        original_text: original,
        translated_text: translated,
        source_language: source,
        target_language: target,
        is_favorite: false,
        timestamp: new Date().toISOString()
      });

      if (error) throw error;
      await fetchTranslationHistory();

    } catch (error) {
      console.error('Error saving translation:', error);
    }
  };

  const deleteTranslation = async (id: string) => {
    try {
      const { error } = await supabase.from('translations').delete().eq('id', id);
      if (error) throw error;
      setTranslationHistory(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting translation:', error);
    }
  };
  const toggleFavorite = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('translations')
        .update({ is_favorite: !currentState })
        .eq('id', id);

      if (error) throw error;
      await fetchTranslationHistory(); 

    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  return (
    <HistoryContext.Provider value={{
      translationHistory,
      isLoading,
      refreshHistory: fetchTranslationHistory,
      saveTranslation,
      deleteTranslation,
      toggleFavorite
    }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) throw new Error("useHistory must be used within a HistoryProvider");
  return context;
};