import axios from 'axios';
const IFIXIT_API_URL = 'https://www.ifixit.com/api/2.0';
const IFIXIT_API_KEY = process.env.IFIXIT_API_KEY; // Chave da API do iFixit
export const searchGuides = async (device) => {
    try {
        if (!IFIXIT_API_KEY) {
            throw new Error('IFIXIT_API_KEY not configured');
        }
        const response = await axios.get(`${IFIXIT_API_URL}/search/${encodeURIComponent(device)}`, {
            params: {
                filter: 'guide',
                api_key: IFIXIT_API_KEY,
            },
        });
        return response.data.results;
    }
    catch (error) {
        console.error('Error fetching iFixit guides:', error);
        throw new Error('Failed to fetch guides from iFixit');
    }
};
export const getGuideDetails = async (guideId) => {
    try {
        if (!IFIXIT_API_KEY) {
            throw new Error('IFIXIT_API_KEY not configured');
        }
        const response = await axios.get(`${IFIXIT_API_URL}/guides/${guideId}`, {
            params: {
                api_key: IFIXIT_API_KEY,
            },
        });
        return response.data;
    }
    catch (error) {
        console.error(`Error fetching iFixit guide details for ID ${guideId}:`, error);
        throw new Error(`Failed to fetch guide details from iFixit for ID ${guideId}`);
    }
};
