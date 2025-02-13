import axios from 'axios';

const RegisterService = {
  BASE_URL: 'http://localhost:8081/user-access',

  async getDistricts() {
    try {
      const response = await axios.get(`${this.BASE_URL}/api/districts`);
      console.log('dist > ', response.data);
      return response.data;
    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred while fetching districts.'
      };
    }
  },

  async getTaluks(districtId) {
    try {
      const response = await axios.get(`${this.BASE_URL}/api/districts/${districtId}/taluks`);
      console.log('taluk >>', response.data);
      return response.data;
    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred while fetching taluks.'
      };
    }
  },

  async getDesignations() {
    try {
      const response = await axios.get(`${this.BASE_URL}/api/designation`);
      return response.data;
    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred while fetching designations.'
      };
    }
  }
};

export default RegisterService;
