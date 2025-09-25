import axios from 'axios';
import mainapi from 'api/mainapi';

const RegisterService = {
  USER_URL: mainapi.USER_API,
  // BASE_URL: 'http://localhost:8081/user-access',

  async getDistricts() {
    try {
      const response = await axios.get(`${this.USER_URL}/user-access/api/districts`);
      return response.data;
    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred while fetching districts.'
      };
    }
  },

  async getTaluks(districtId) {
    try {
      const response = await axios.get(`${this.USER_URL}/user-access/api/districts/${districtId}/taluks`);
      return response.data;
    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred while fetching taluks.'
      };
    }
  },

  async getDesignations() {
    try {
      const response = await axios.get(`${this.USER_URL}/user-access/api/fetch-designations`);
<<<<<<< HEAD
      console.log('designations: ', response.data.payload);
=======

      console.log('designationss: ', response.data.payload);
>>>>>>> fdf45dc99ee5525b3c893c71a1c75f07f82d54cd
      return response.data;
    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred while fetching designations.'
      };
    }
  }
};

export default RegisterService;
