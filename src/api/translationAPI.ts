export const translationAPI = {
    useTranslation: async (from: string, to: string, text: string) => {
        try {
            const response = await fetch('https://translateai.p.rapidapi.com/google/translate/text', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'X-RapidAPI-Key': process.env.EXPO_PUBLIC_RAPIDAPI_KEY!,
                    'X-RapidAPI-Host': 'translateai.p.rapidapi.com'
                },
                body: JSON.stringify({
                    origin_language: from,
                    target_language: to,
                    input_text: text
                })
            })
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            return data.translation;
        } catch (error) {
            console.error('Error during translation API call:', error);
        }
    },
    detectLanguage: async (text: string) => {
        try {
            const response = await fetch('https://translateai.p.rapidapi.com/detect', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'X-RapidAPI-Key': process.env.EXPO_PUBLIC_RAPIDAPI_KEY!,
                    'X-RapidAPI-Host': 'translateai.p.rapidapi.com'
                },
                body: JSON.stringify({
                    input_text: text
                })
            })
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            return data.lang || 'en';
        } catch (error) {
            console.error('Error during language detection API call:', error);
            return 'en'; // default to English on error
        }
    },

    detectAndTranslate: async (to: string, text: string) => {
        const detectLang = await translationAPI.detectLanguage(text);
        const translateText = await translationAPI.useTranslation(detectLang, to, text);
        return {
            originalText: text,
            translatedText: translateText,
            detectedLanguage: detectLang,
            targetLang: to
        }
    }
};