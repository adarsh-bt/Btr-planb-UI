import axios from 'axios';
import authservice from 'pages/authentication/authservice';

const API_BASE_URL = 'http://localhost:8081/user-access/api/user-registration'; // Base URL for your API

const profileService = {
  fetchUserById: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/fetch-by-id/${userId}`);
      return response.data; // Return the entire response payload
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error; // Rethrow error to handle it in the component
    }
  },

  emailVerification: async (username) => {
    try {
      const response = await axios.post(`${authservice.BASE_URL}/api/email_verify`, { username });
      return response;
    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred'
      };
    }
  },

  verifyOtp: async (userid, otp) => {
    console.log('otp >>', otp);
    console.log('usernamess :', userid);
    try {
      const response = await axios.post(`${authservice.BASE_URL}/api/validateOtp`, { userid, otp });
      console.log(response.data);
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  changePassword: async (passwordCheckRequest) => {
    try {
      const response = await axios.post(`${authservice.BASE_URL}/api/profile/change_password`, passwordCheckRequest); // Make sure the endpoint is correct
      return response;
    } catch (error) {
      return {
        message: error.response.data.message
      };
    }
  }
};

export default profileService;
