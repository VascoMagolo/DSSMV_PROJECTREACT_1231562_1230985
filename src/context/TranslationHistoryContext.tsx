import { Action } from '@/constants/values';
import { useFocusEffect } from 'expo-router';
import React, { createContext, useCallback, useContext, useReducer } from 'react';
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

type TranslationHistoryState = {
  translationHistory: TranslationRecord[];
  isLoading: boolean;
  error: string | null;
};
type TranslationHistoryAction = Action<TranslationRecord>;

const initialState: TranslationHistoryState = {
  translationHistory: [],
  isLoading: false,
  error: null,
};

const historyReducer = (state: TranslationHistoryState, action: TranslationHistoryAction): TranslationHistoryState => {
  switch (action.type) {
    case 'FETCH_START':
    case 'OPERATION_START':
      return { ...state, isLoading: true, error: null };
    
    case 'FETCH_SUCCESS':
      return { 
        ...state, 
        isLoading: false, 
        translationHistory: action.payload, 
        error: null 
      };
    
    case 'SET_ERROR':
      return { ...state, isLoading: false, error: action.payload };
      
    default:
      return state;
  }
};

type TranslationHistoryContextType = {
  translationHistory: TranslationRecord[];
  isLoading: boolean;
  error: string | null;
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

const HistoryContext = createContext<TranslationHistoryContextType>({} as TranslationHistoryContextType);

export const TranslationHistoryProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(historyReducer, initialState);

  const fetchTranslationHistory = useCallback(async () => {
    if (!user) return;
    
    dispatch({ type: 'FETCH_START' });

    try {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('user_id', user.id)
        .order('is_favorite', { ascending: false })
        .order('timestamp', { ascending: false });

      if (error) throw error;

      dispatch({ type: 'FETCH_SUCCESS', payload: (data as TranslationRecord[]) || [] });

    } catch (error: any) {
      console.error('Error fetching history:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Erro ao carregar histórico' });
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchTranslationHistory();
    }, [fetchTranslationHistory])
  );

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

    } catch (error: any) {
      console.error('Error saving translation:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const deleteTranslation = async (id: string) => {
    if (!user) return;

    dispatch({ type: 'OPERATION_START' });

    try {
      const { error } = await supabase.from('translations').delete().eq('id', id);
      if (error) throw error;
      
      await fetchTranslationHistory();
      
    } catch (error: any) {
      console.error('Error deleting translation:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const toggleFavorite = async (id: string, currentState: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('translations')
        .update({ is_favorite: !currentState })
        .eq('id', id);

      if (error) throw error;
      
      await fetchTranslationHistory(); 

    } catch (error: any) {
      console.error('Error updating favorite:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  return (
    <HistoryContext.Provider value={{
      translationHistory: state.translationHistory,
      isLoading: state.isLoading,
      error: state.error,
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
  if (!context) throw new Error("useHistory must be used within a TranslationHistoryProvider");
  return context;
};