import axios from 'axios';
import authservice from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';


const USER_URL = mainapi.USER_API;

const profileService = {
  fetchUserById: async (userId) => {
    const token = localStorage.getItem('token');
    // const userId1 = "05041486-30f1-4620-ae6a-998c40881981"

    try {
      const response = await axios.get(`${USER_URL}/user-access/user-profile/user/fetch-by-id/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
     
      return response.data; // Return the entire response payload
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error; // Rethrow error to handle it in the component
    }
  },

  emailVerification: async (username) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${USER_URL}/user-access/user-profile/email_verify`, { "email":username },{
        headers: {
          Authorization: `Bearer ${token}`
         
        }
      });
    
      return response;
    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred'
      };
    }
  },

  verifyOtp: async (userid, otp) => {
  
   
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${USER_URL}/user-access/user-profile/validateOtp`, { userid, otp },{
        headers: {
          Authorization: `Bearer ${token}`
          
        }
      });
    
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  changePassword: async (passwordCheckRequest) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${USER_URL}/user-access/user-profile/change_password`, passwordCheckRequest,{
        headers: {
          Authorization: `Bearer ${token}`
          
        }
      }); // Make sure the endpoint is correct
      return response;
    } catch (error) {
      return {
        message: error.response.data.message
      };
    }
  },

updateProfile: async (payload) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${USER_URL}/user-access/user-profile/update-profile`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Ensure response.data has success field
    return {
      success: response.data?.success || false,
      message: response.data?.message || 'Profile updated successfully',
      payload: response.data?.payload || null
    };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        'Profile update failed due to server error'
    };
  }
},



};

export default profileService;