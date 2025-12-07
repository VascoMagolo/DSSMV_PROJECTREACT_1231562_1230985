import { Action } from '@/src/types/types';
import { useFocusEffect } from 'expo-router';
import React, { createContext, useCallback, useContext, useReducer } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './UserContext';

export type OCRRecord = {
    id: string;
    user_id: string;
    image_url: string;
    extracted_text: string;
    translated_text: string;
    target_language: string;
    source_language: string;
    timestamp: string;
};

type OCRState = {
    ocrHistory: OCRRecord[];
    isLoading: boolean;
    error: string | null;
};

type OCRAction = Action<OCRRecord>;

const initialState: OCRState = {
    ocrHistory: [],
    isLoading: false,
    error: null,
};

const ocrReducer = (state: OCRState, action: OCRAction): OCRState => {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, isLoading: true, error: null };
        case 'OPERATION_START':
            return { ...state, isLoading: true, error: null };
        case 'FETCH_SUCCESS':
            return { ...state, isLoading: false, ocrHistory: action.payload, error: null };
        case 'SET_ERROR':
            return { ...state, isLoading: false, error: action.payload };
        default:
            return state;
    }
};
type OCRHistoryContextType = {
    ocrHistory: OCRRecord[];
    isLoading: boolean;
    error: string | null;
    fetchOCRHistory: () => Promise<void>;
    saveOCRRecord: (imageUrl: string, extractedText: string, translationText: string, targetLanguage: string) => Promise<void>;
    deleteOCRRecord: (id: string) => Promise<void>;
};

const OCRHistoryContext = createContext<OCRHistoryContextType>({} as OCRHistoryContextType);

export const OCRHistoryProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();

    const [state, dispatch] = useReducer(ocrReducer, initialState);

    const fetchOCRHistory = useCallback(async () => {
        if (!user) return;

        dispatch({ type: 'FETCH_START' });

        try {
            const { data, error } = await supabase
                .from('image_history')
                .select('*')
                .eq('user_id', user.id)
                .order('timestamp', { ascending: false });

            if (error) throw error;

            dispatch({ type: 'FETCH_SUCCESS', payload: (data as OCRRecord[]) || [] });
        } catch (error: any) {
            console.error('Error fetching history:', error);
            dispatch({ type: 'SET_ERROR', payload: error.message || 'Error fetching history' });
        }
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            fetchOCRHistory();
        }, [fetchOCRHistory])
    );

    const saveOCRRecord = async (imageUrl: string, extractedText: string, translated_text: string, targetLanguage: string) => {
        if (!user) return;

        dispatch({ type: 'OPERATION_START' });

        try {
            const { error } = await supabase
                .from('image_history')
                .insert({
                    user_id: user.id,
                    image_url: imageUrl,
                    extracted_text: extractedText,
                    translated_text: translated_text,
                    target_language: targetLanguage,
                    source_language: 'auto', // later change to actual source language if needed
                    timestamp: new Date().toISOString(),
                });

            if (error) throw error;
            await fetchOCRHistory();
        } catch (error: any) {
            console.error('Error saving OCR record:', error);
            dispatch({ type: 'SET_ERROR', payload: error.message || 'Error saving record' });
        }
    };

    const deleteOCRRecord = async (id: string) => {
        if (!user) return;

        dispatch({ type: 'OPERATION_START' });

        try {
            const { error } = await supabase
                .from('image_history')
                .delete()
                .eq('id', id);
            if (error) throw error;
            await fetchOCRHistory();
        } catch (error: any) {
            console.error('Error deleting OCR record:', error);
            dispatch({ type: 'SET_ERROR', payload: error.message || 'Error deleting record' });
        }
    };

    return (
        <OCRHistoryContext.Provider
            value={{
                ocrHistory: state.ocrHistory,
                isLoading: state.isLoading,
                error: state.error,
                fetchOCRHistory,
                saveOCRRecord,
                deleteOCRRecord,
            }}
        >
            {children}
        </OCRHistoryContext.Provider>
    );
};

export const useOCRHistory = () => {
    const context = useContext(OCRHistoryContext);
    if (!context) throw new Error("useOCRHistory must be used within a OCRHistoryProvider");
    return context;
};