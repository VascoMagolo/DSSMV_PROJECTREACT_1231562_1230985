import { translationAPI } from "@/src/api/translationAPI";
import React, { createContext, useContext, useState } from "react";

type TranslationResult = {
  originalText: string;
  translatedText: string;
  detectedLanguage: string;
  targetLang: string;
};

type TranslationContextType = {
  isLoading: boolean;
  error: string | null;
  performTranslation: (
    sourceLang: string,
    targetLang: string,
    text: string
  ) => Promise<string | null>;
  performDetectionAndTranslation: (
    text: string,
    targetLang: string
  ) => Promise<TranslationResult | null>;
  clearError: () => void;
};

const TranslationContext = createContext<TranslationContextType>(
  {} as TranslationContextType
);

export const TranslationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const performTranslation = async (
    sourceLang: string,
    targetLang: string,
    text: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await translationAPI.useTranslation(
        sourceLang,
        targetLang,
        text
      );
      return result;
    } catch (err: any) {
      setError(err.message || "Fail in translation");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const performDetectionAndTranslation = async (
    text: string,
    targetLang: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await translationAPI.detectAndTranslate(targetLang, text);
      return result;
    } catch (err: any) {
      setError(err.message || "Fail in detection and translation");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TranslationContext.Provider
      value={{
        isLoading,
        error,
        performTranslation,
        performDetectionAndTranslation,
        clearError,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context)
    throw new Error("useTranslation must be used within a TranslationProvider");
  return context;
};
