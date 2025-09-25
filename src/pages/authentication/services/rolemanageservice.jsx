import mainapi from 'api/mainapi';
import axios from 'axios';



const USER_URL = mainapi.USER_API

const BASE_URL = mainapi.USER_API;

const roleManageService = {
  
  async getAllSchemes() {
     const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${BASE_URL}/user-access/api/user-approval/fetch/schemes`,{
        headers: {
           Authorization: `Bearer ${token}`
        } 
      });
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
      const response = await axios.get(`${BASE_URL}/user-access/api/user-approval/fetch/schemes/${schemeId}/roles`, {
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
      const response = await axios.get(`${BASE_URL}/user-access/api/user-approval/fetch/permissions/${schemeId}`, {
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
      const response = await axios.post(`${BASE_URL}/user-access/api/user-approval/save-role-permissions`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      return { message: err.response?.data?.message || 'Error saving role.' };
    }
  }
};

export default roleManageService;
