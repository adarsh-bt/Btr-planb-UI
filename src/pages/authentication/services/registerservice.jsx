import axios from 'axios';
import mainapi from 'api/mainapi';

const RegisterService = {
  BASE_URL: mainapi.USER_API,

  async getDistricts() {
    try {
      const response = await axios.get(`${this.BASE_URL}/user-access/api/districts`);
      return response.data;
    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred while fetching districts.'
      };
    }
  },

  async getTaluks(districtId) {
    try {
      const response = await axios.get(`${this.BASE_URL}/user-access/api/districts/${districtId}/taluks`);
      return response.data;
    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred while fetching taluks.'
      };
    }
  },

  async getDesignations() {
    try {
      const response = await axios.get(`${this.BASE_URL}/user-access/api/designation`);
      return response.data;
    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred while fetching designations.'
      };
    }
  }
};

export default RegisterService;
