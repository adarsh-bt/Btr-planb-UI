import axios from 'axios';
import mainapi from 'api/mainapi';


const USER_URL = mainapi.USER_API


const roleManageService = {
  async getAllSchemes() {
    try {
      const response = await axios.get(`${USER_URL}/api/schemes`);
      return response.data.payload; // ✅ return only the payload array
    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred while fetching schemes.'
      };
    }
  },

  async getRoles(schemeId) {
    const token = localStorage.getItem('token');
    console.log('token', token);
    try {
      const response = await axios.get(`${USER_URL}/api/schemes/${schemeId}/roles`, {
        headers: {
          Authorization: `Bearer ${token}` // Add token in Authorization header
        }
      });
      return response.data;
    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred while fetching roles.'
      };
    }
  },

  async getPermissions(schemeId) {
    const token = localStorage.getItem('token');
    console.log('token', token);
    try {
      const response = await axios.get(`${USER_URL}/api/permissions/${schemeId}`, {
        headers: {
          Authorization: `Bearer ${token}` // Add token in Authorization header
        }
      });
      return response.data;
    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred while fetching permissions.'
      };
    }
  },

  async saveOrUpdateRole(userData) {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`${USER_URL}/api/save-role-permissions`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      return { message: err.response?.data?.message || 'Error saving role.' };
    }
  }
};

export default roleManageService;
