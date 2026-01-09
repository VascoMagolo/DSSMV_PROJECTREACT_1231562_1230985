import { formatBilingualEntry, toggleFavoriteInList } from '@/src/domain/bilingual/bilingual.logic';

describe('Bilingual History Logic', () => {

  it('should correctly format database raw data into a BilingualRecord', () => {
    const rawData = {
      id: 'uuid-123',
      user_id: 'user-456',
      original_text: 'Bom dia',
      translated_text: 'Good morning',
      source_lang: 'pt',
      target_lang: 'en',
      speaker_side: 'A',
      is_favorite: 0 
    };

    const result = formatBilingualEntry(rawData);

    expect(result.speaker_side).toBe('A');
    expect(result.is_favorite).toBe(false);
    expect(result.original_text).toBe('Bom dia');
  });

  it('should toggle favorite status for a specific record in the list', () => {
    const mockHistory = [
      { id: '1', is_favorite: false, original_text: 'Hi', speaker_side: 'A' } as any,
      { id: '2', is_favorite: false, original_text: 'Bye', speaker_side: 'B' } as any,
    ];

    const updatedHistory = toggleFavoriteInList(mockHistory, '1');

    expect(updatedHistory[0].is_favorite).toBe(true);
    expect(updatedHistory[1].is_favorite).toBe(false); 
  });
});