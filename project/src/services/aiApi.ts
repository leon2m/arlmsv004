import axios from 'axios';

const aiApiClient = axios.create({
  baseURL: import.meta.env.VITE_AI_API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
    'apikey': import.meta.env.VITE_AI_API_KEY
  }
});

export const aiApiService = {
  get: async (url: string) => {
    try {
      const response = await aiApiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('AI API Get Error:', error);
      throw error;
    }
  },

  post: async (url: string, data: any) => {
    try {
      const response = await aiApiClient.post(url, data);
      return response.data;
    } catch (error) {
      console.error('AI API Post Error:', error);
      throw error;
    }
  }
};