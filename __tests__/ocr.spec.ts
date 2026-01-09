import { isValidOCRResult, formatOCRRecord } from '../src/domain/ocr/ocr.logic';

describe('OCR Domain Logic', () => {
  it('TC06 - should successfully validate a complete OCR result', () => {
    const text = "Detected text";
    const url = "https://supabase.storage/image.jpg";
    const result = isValidOCRResult(text, url);
    expect(result).toBe(true);
  });

  it('TC07 - should correctly format raw database data into UI model', () => {
    const dbData = {
      id: 'ocr_01',
      user_id: 'user_99',
      image_url: 'http://link.com',
      extracted_text: 'Hello',
      target_language: 'pt',
      source_language: 'en',
      created_at: '2023-10-27T10:00:00Z'
    };

    const formatted = formatOCRRecord(dbData);
    expect(formatted.extracted_text).toBe('Hello');
    expect(formatted.timestamp).toBe(dbData.created_at);
  });
});