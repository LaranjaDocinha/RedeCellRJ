import axios from 'axios';

const IFIXIT_API_URL = 'https://www.ifixit.com/api/2.0';
const IFIXIT_API_KEY = process.env.IFIXIT_API_KEY; // Chave da API do iFixit

export const searchGuides = async (device: string) => {
  try {
    const params: any = {
      filter: 'guide',
      limit: 5, // Limit results
    };
    if (IFIXIT_API_KEY) {
      params.api_key = IFIXIT_API_KEY;
    }

    const response = await axios.get(`${IFIXIT_API_URL}/search/${encodeURIComponent(device)}`, {
      params,
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching iFixit guides:', error);
    // Fallback to empty array instead of error if search fails
    return [];
  }
};

export const getGuideDetails = async (guideId: number) => {
  try {
    const params: any = {};
    if (IFIXIT_API_KEY) {
      params.api_key = IFIXIT_API_KEY;
    }
    const response = await axios.get(`${IFIXIT_API_URL}/guides/${guideId}`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching iFixit guide details for ID ${guideId}:`, error);
    throw new Error(`Failed to fetch guide details from iFixit for ID ${guideId}`);
  }
};
