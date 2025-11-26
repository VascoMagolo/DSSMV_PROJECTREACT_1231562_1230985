export const useTranslation = (from: string, to: string, text: string) => {
    try {
        return fetch('https://translateai.p.rapidapi.com/google/translate/text', {
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
        .then(response => response.json())
    } catch (error) {
        console.error('Error during translation API call:', error);
    }
};

export const detectLanguage = (text: string) => {
    try {
        return fetch('https://translateai.p.rapidapi.com/detect', {
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
        .then(response => response.json())
    } catch (error) {
        console.error('Error during language detection API call:', error);
    }
};