import { BilingualRecord } from '@/src/context/BilingualHistoryContext';

export function formatBilingualEntry(data: any): BilingualRecord {
  return {
    id: data.id || '',
    user_id: data.user_id || '',
    original_text: data.original_text || '',
    translated_text: data.translated_text || '',
    source_lang: data.source_lang || '',
    target_lang: data.target_lang || '',
    speaker_side: data.speaker_side as 'A' | 'B',
    is_favorite: !!data.is_favorite,
    created_at: data.created_at || new Date().toISOString()
  };
}

export function toggleFavoriteInList(history: BilingualRecord[], id: string): BilingualRecord[] {
  return history.map(item => 
    item.id === id ? { ...item, is_favorite: !item.is_favorite } : item
  );
}