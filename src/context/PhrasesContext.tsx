import React, { createContext, useCallback, useContext, useReducer } from 'react';
import { translationAPI } from '../api/translationAPI';
import { supabase } from '../services/supabase';
import { useAuth } from './UserContext';

export type Phrase = {
  id: string;
  text: string;
  category: string;
  language: string;
  user_id?: string;
  translation?: string;
};

type PhrasesState = {
  userPhrases: Phrase[];
  genericPhrases: Phrase[];
  isLoading: boolean;
  error: string | null;
};

type PhrasesAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS_ALL'; payload: { user: Phrase[]; generic: Phrase[] } }
  | { type: 'OPERATION_START' } 
  | { type: 'DELETE_PHRASE'; payload: string }
  | { type: 'SET_ERROR'; payload: string };

const initialState: PhrasesState = {
  userPhrases: [],
  genericPhrases: [],
  isLoading: false,
  error: null,
};

const phrasesReducer = (state: PhrasesState, action: PhrasesAction): PhrasesState => {
  switch (action.type) {
    case 'FETCH_START':
    case 'OPERATION_START':
      return { ...state, isLoading: true, error: null };

    case 'FETCH_SUCCESS_ALL':
      return {
        ...state,
        isLoading: false,
        userPhrases: action.payload.user,
        genericPhrases: action.payload.generic,
        error: null,
      };

    case 'DELETE_PHRASE':
      return {
        ...state,
        isLoading: false,
        userPhrases: state.userPhrases.filter((p) => p.id !== action.payload),
      };

    case 'SET_ERROR':
      return { ...state, isLoading: false, error: action.payload };

    default:
      return state;
  }
};

type PhrasesContextType = {
  state: PhrasesState;
  fetchPhrases: (language: string) => Promise<void>;
  addPhrase(adds: Partial<Phrase>): Promise<{ error: string | null; detectedLanguage?: string }>;
  deletePhrase: (id: string) => Promise<void>;
};

const PhrasesContext = createContext<PhrasesContextType>({} as PhrasesContextType);

export const PhrasesProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  const [state, dispatch] = useReducer(phrasesReducer, initialState);

  const fetchPhrases = useCallback(async (language: string) => {
    dispatch({ type: 'FETCH_START' });

    try {
      const { data: genericData, error: genericError } = await supabase
        .from('generic_phrases')
        .select('*')
        .eq('language', language);

      if (genericError) throw genericError;

      let userData: Phrase[] = [];
      if (user) {
        const { data, error: userError } = await supabase
          .from('user_phrases')
          .select('*')
          .eq('user_id', user.id)
          .eq('language', language)
          .order('created_at', { ascending: false });

        if (userError) throw userError;
        userData = (data as Phrase[]) || [];
      }
      dispatch({
        type: 'FETCH_SUCCESS_ALL',
        payload: {
          generic: (genericData as Phrase[]) || [],
          user: userData,
        },
      });

    } catch (error: any) {
      console.error('Error fetching phrases:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to fetch phrases.' });
    }
  }, [user]);

  const addPhrase = async (adds: Partial<Phrase>): Promise<{ error: string | null; detectedLanguage?: string }> => {
    if (!user) return { error: 'Not authenticated' };
    if (!adds.text) return { error: 'Text is required' };

    dispatch({ type: 'OPERATION_START' });

    try {
      const detectedLang = await translationAPI.detectLanguage(adds.text);
      
      const { error } = await supabase.from('user_phrases').insert({
        user_id: user.id,
        text: adds.text,
        language: detectedLang,
        category: adds.category || 'Personal',
      });

      if (error) throw error;
      await fetchPhrases(detectedLang);
      
      return { error: null, detectedLanguage: detectedLang };

    } catch (err: any) {
      console.error("Error adding phrase:", err);
      dispatch({ type: 'SET_ERROR', payload: err.message });
      return { error: err.message || String(err) };
    }
  };

  const deletePhrase = async (id: string) => {
    if (!user) return;
    dispatch({ type: 'OPERATION_START' });

    try {
      const { error } = await supabase.from('user_phrases').delete().eq('id', id);
      if (error) throw error;

      dispatch({ type: 'DELETE_PHRASE', payload: id });

    } catch (err: any) {
      console.error("Error deleting phrase:", err);
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  };

  return (
    <PhrasesContext.Provider value={{
      state,
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