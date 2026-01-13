import { Action } from '@/src/types/types';
import { useFocusEffect } from 'expo-router';
import React, { createContext, useCallback, useContext, useReducer } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './UserContext';

// Define the structure of a bilingual record
export type BilingualRecord = {
  id: string;
  user_id: string;
  original_text: string;   
  translated_text: string; 
  source_lang: string;      
  target_lang: string;      
  speaker_side: 'A' | 'B';  
  is_favorite: boolean;
  created_at: string;
};

// Definition of state and actions for the reducer
type BilingualHistoryState = {
  bilingualHistory: BilingualRecord[];
  isLoading: boolean;
  error: string | null;
};

// Define action types
type BilingualHistoryAction = Action<BilingualRecord>;

// Initial state for the reducer
const initialState: BilingualHistoryState = {
    bilingualHistory: [],
    isLoading: false,
    error: null,
};

const historyReducer = (state: BilingualHistoryState, action: BilingualHistoryAction): BilingualHistoryState => {
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
        originalText: string,
        translatedText: string,
        sourceLang: string,
        targetLang: string,
        speakerSide: 'A' | 'B'
    ) => Promise<void>;
    deleteConversation: (id: string) => Promise<void>;
    setConversationFavorite: (id: string, isFavorite: boolean) => Promise<void>;
};

const BilingualHistoryContext = createContext<BilingualHistoryContextType | undefined>(undefined);

export const BilingualHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [state, dispatch] = useReducer(historyReducer, initialState);

    const fetchHistory = async () => {
        if (!user) return;
        dispatch({ type: 'FETCH_START' });
        try {
            const { data, error } = await supabase
                .from('bilingual_history')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            dispatch({ type: 'FETCH_SUCCESS', payload: data || [] });
        }
        catch (error: any) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        }   
    };

    const saveTranslation = async ( 
        originalText: string,
        translatedText: string,
        sourceLang: string,  
        targetLang: string,
        speakerSide: 'A' | 'B'
    ) => {
        if (!user) return;
        dispatch({ type: 'OPERATION_START' });
        try {
            const { error } = await supabase
                .from('bilingual_history')
                .insert({
                    user_id: user.id,
                    original_text: originalText,
                    translated_text: translatedText,
                    source_lang: sourceLang,
                    target_lang: targetLang,
                    speaker_side: speakerSide,
                    is_favorite: false,
                    //created_at: new Date().toISOString(),
                });

            if (error) throw error;
            await fetchHistory();
        } catch (error: any) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        }   
    };

    const deleteConversation = async (id: string) => {
        if (!user) return;
        dispatch({ type: 'OPERATION_START' });
        try {
            const { error } = await supabase
                .from('bilingual_history')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;
            await fetchHistory();
        }
        catch (error: any) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        }
    };

    const setConversationFavorite = async (id: string, isFavorite: boolean) => {
        if (!user) return;
        dispatch({ type: 'OPERATION_START' });
        try {
            const { error } = await supabase
                .from('bilingual_history')
                .update({ is_favorite: isFavorite })
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;
            await fetchHistory();
        }
        catch (error: any) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchHistory();
        }, [])
    );

    return (
        <BilingualHistoryContext.Provider
            value={{
                bilingualHistory: state.bilingualHistory,
                isLoading: state.isLoading,
                error: state.error,
                refreshHistory: fetchHistory,
                saveTranslation,
                deleteConversation,
                setConversationFavorite,
            }}
        >
            {children}
        </BilingualHistoryContext.Provider>
    );
};

export const useHistory = (): BilingualHistoryContextType => {
    const context = useContext(BilingualHistoryContext);
    if (!context) {
        throw new Error('useHistory must be used within a BilingualHistoryProvider');
    }
    return context;
};