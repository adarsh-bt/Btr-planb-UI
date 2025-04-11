import axios from 'axios';

const BASE_URL = 'http://localhost:8081/user-access';

const roleManageService = {
  async getAllSchemes() {
    try {
      const response = await axios.get(`${BASE_URL}/api/fetch/schemes`);
      return response.data.payload; // ✅ return only the payload array
    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred while fetching schemes.'
      };
    }
  },

  async getRoles(schemeId) {
    try {
      const response = await axios.get(`${BASE_URL}/api/fetch/schemes/${schemeId}/roles`);
      return response.data;
    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred while fetching roles.'
      };
    }
  },
};

export default roleManageService;
