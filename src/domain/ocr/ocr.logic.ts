import { OCRRecord } from './ocr.types';

export function isValidOCRResult(extractedText: string, imageUrl: string): boolean {
  return extractedText.trim().length > 0 && imageUrl.startsWith('http');
}

export function formatOCRRecord(data: any): OCRRecord {
  return {
    id: data.id,
    user_id: data.user_id,
    image_url: data.image_url,
    extracted_text: data.extracted_text || '',
    translated_text: data.translated_text || '',
    target_language: data.target_language,
    source_language: data.source_language,
    timestamp: data.timestamp || data.created_at,
  };
}