import axios from 'axios';
import mainapi from 'api/mainapi';

const RegisterService = {
  USER_URL: mainapi.BASE_URL,
  
  // BASE_URL: 'http://localhost:8081/user-access',

async getDistricts() {
  try {
    const url = `${this.USER_URL}/user-access/api/districts`;
  
    const response = await axios.get(url);
    return response.data;
  } catch (err) {
    console.error("District Fetch Error:", err);
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
      return response.data;
    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred while fetching designations.'
      };
    }
  }
};

export default RegisterService;
