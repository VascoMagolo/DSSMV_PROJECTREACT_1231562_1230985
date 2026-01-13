export function preparePhraseForSaving(text: string, category?: string) {
  return {
    text: text.trim(),
    category: category || 'Personal', 
    isValid: text.trim().length > 0
  };
}