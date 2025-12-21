import { Action } from '@/src/types/types';
import { useFocusEffect } from 'expo-router';
import React, { createContext, useCallback, useContext, useReducer } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './UserContext';

export type BilingualRecord = {
  id: string;
  user_id: string;
  original_text: string;
  translated_text: string;
  source_lang: string;
  target_lang: string;
  is_favorite: boolean;
  created_at: string;
  speaker_side: 'A' | 'B';  // A = de cima para baixo, B = de baixo para cima
};

type BilingualHistoryState = {
  bilingualHistory: BilingualRecord[];
  isLoading: boolean;
  error: string | null;
};

type BilingualHistoryAction = Action<BilingualRecord>;

const initialState: BilingualHistoryState = {
  bilingualHistory: [],
  isLoading: false,
  error: null,
};

const bilingualHistoryReducer = (state: BilingualHistoryState, action: BilingualHistoryAction): BilingualHistoryState => {
  switch (action.type) {
    case 'FETCH_START':
    case 'OPERATION_START':
      return { ...state, isLoading: true, error: null };
    
    case 'FETCH_SUCCESS':
      return { 
        ...state, 
        isLoading: false, 
        bilingualHistory: action.payload, 
        error: null 
      };
    
    case 'SET_ERROR':
      return { ...state, isLoading: false, error: action.payload };
      
    default:
      return state;
  }
};

type BilingualHistoryContextType = {
  bilingualHistory: BilingualRecord[];
  isLoading: boolean;
  error: string | null;
  refreshHistory: () => Promise<void>;
  saveTranslation: (
    original: string, 
    translated: string, 
    source: string, 
    target: string,
    speaker_side: 'A' | 'B'
  ) => Promise<void>;
  deleteTranslation: (id: string) => Promise<void>;
  toggleFavorite: (id: string, isFavorite: boolean) => Promise<void>;
};

const BilingualHistoryContext = createContext<BilingualHistoryContextType>({} as BilingualHistoryContextType);

export const BilingualHistoryProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(bilingualHistoryReducer, initialState);

  const fetchBilingualHistory = useCallback(async () => {
    if (!user) return;
    
    dispatch({ type: 'FETCH_START' });

    try {
      const { data, error } = await supabase
        .from('bilingual_history')  // Tabela separada no Supabase
        .select('*')
        .eq('user_id', user.id)
        .order('is_favorite', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      dispatch({ type: 'FETCH_SUCCESS', payload: (data as BilingualRecord[]) || [] });

    } catch (error: any) {
      console.error('Error fetching bilingual history:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Error fetching bilingual history' });
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchBilingualHistory();
    }, [fetchBilingualHistory])
  );

  const saveTranslation = async (
    original: string, 
    translated: string, 
    source: string, 
    target: string,
    speaker_side: 'A' | 'B'
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('bilingual_history').insert({
        user_id: user.id,
        original_text: original,
        translated_text: translated,
        source_lang: source,
        target_lang: target,
        is_favorite: false,
        created_at: new Date().toISOString(),
        speaker_side: speaker_side
      });

      if (error) throw error;
      await fetchBilingualHistory();

    } catch (error: any) {
      console.error('Error saving bilingual translation:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const deleteTranslation = async (id: string) => {
    if (!user) return;

    dispatch({ type: 'OPERATION_START' });

    try {
      const { error } = await supabase.from('bilingual_history').delete().eq('id', id);
      if (error) throw error;
      
      await fetchBilingualHistory();
      
    } catch (error: any) {
      console.error('Error deleting bilingual translation:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const toggleFavorite = async (id: string, currentState: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('bilingual_history')
        .update({ is_favorite: !currentState })
        .eq('id', id);

      if (error) throw error;
      
      await fetchBilingualHistory(); 

    } catch (error: any) {
      console.error('Error updating bilingual favorite:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  return (
    <BilingualHistoryContext.Provider value={{
      bilingualHistory: state.bilingualHistory,
      isLoading: state.isLoading,
      error: state.error,
      refreshHistory: fetchBilingualHistory,
      saveTranslation,
      deleteTranslation,
      toggleFavorite
    }}>
      {children}
    </BilingualHistoryContext.Provider>
  );
};

export const useBilingualHistory = () => {
  const context = useContext(BilingualHistoryContext);
  if (!context) throw new Error("useBilingualHistory must be used within a BilingualHistoryProvider");
  return context;
};
