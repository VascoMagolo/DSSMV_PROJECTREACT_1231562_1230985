import { preparePhraseForSaving } from '../src/domain/phrases/phrases.logic';

describe('Phrases Domain Logic', () => {
  it('TC08 - should assign "Personal" category if none is provided', () => {
    const result = preparePhraseForSaving("Hello, how are you?");
    expect(result.category).toBe('Personal');
  });

  it('TC09 - should invalidate phrases that contain only whitespace', () => {
    const result = preparePhraseForSaving("   ");
    expect(result.isValid).toBe(false);
  });
});