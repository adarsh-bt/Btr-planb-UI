import axios from 'axios';
import authservice from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';


const USER_URL = mainapi.USER_API;

const profileService = {
  fetchUserById: async (userId) => {
    const token = localStorage.getItem('token');
    // const userId1 = "05041486-30f1-4620-ae6a-998c40881981"
    console.log(userId);
    try {
      const response = await axios.get(`${USER_URL}/user-access/user-profile/user/fetch-by-id/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("response usersss",response)
      return response.data; // Return the entire response payload
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error; // Rethrow error to handle it in the component
    }
  },

  emailVerification: async (username) => {
    try {
      const response = await axios.post(`${USER_URL}/api/email_verify`, { username });
      console.log("result ",response)
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
      const response = await axios.post(`${USER_URL}/api/validateOtp`, { userid, otp });
      console.log(response.data);
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  changePassword: async (passwordCheckRequest) => {
    try {
      const response = await axios.post(`${USER_URL}/api/profile/change_password`, passwordCheckRequest); // Make sure the endpoint is correct
      return response;
    } catch (error) {
      return {
        message: error.response.data.message
      };
    }
  }
};

export default profileService;
