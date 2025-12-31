export const ocrAPI = {
    useOCR: async (imageUri: string) => {
        const formdata = new FormData();
        formdata.append('image', {
            uri: imageUri,
            name: 'photo.jpg',
            type: 'image/jpeg',
        } as any);
        try {
            const response = await fetch('https://ocr43.p.rapidapi.com/v1/results', {
                method: 'POST',
                headers: {
                    'X-RapidAPI-Key': process.env.EXPO_PUBLIC_RAPIDAPI_KEY!,
                    'X-RapidAPI-Host': 'ocr43.p.rapidapi.com'
                },
                body: formdata
            });
            if (!response.ok) {
                return `Erro API: ${response.status}`;
            }

            const data = await response.json();
            if (
                data?.results?.[0]?.entities?.[0]?.objects?.[0]?.entities?.[0]?.text
            ) {
                return data.results[0].entities[0].objects[0].entities[0].text;
            }
        } catch (error) {
            console.error('Error during OCR API call:', error);
        }
    },
};