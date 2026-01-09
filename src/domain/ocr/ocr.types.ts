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