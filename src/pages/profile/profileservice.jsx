import api from 'api/api'; // ✅ IMPORTANT
import mainapi from 'api/mainapi';

const USER_URL = mainapi.USER_API;

const profileService = {

  fetchUserById: async (userId) => {
    try {
      const response = await api.get(
        `${USER_URL}/user-access/user-profile/user/fetch-by-id/${userId}`
      );

      return response.data;

    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  },

  emailVerification: async (username) => {
    try {
      const response = await api.post(
        `${USER_URL}/user-access/user-profile/email_verify`,
        { email: username }
      );

      return response;

    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred'
      };
    }
  },

  verifyOtp: async (userid, otp) => {
    try {
      const response = await api.post(
        `${USER_URL}/user-access/user-profile/validateOtp`,
        { userid, otp }
      );

      return response.data;

    } catch (err) {
      throw err;
    }
  },

  changePassword: async (passwordCheckRequest) => {
    try {
      const response = await api.post(
        `${USER_URL}/user-access/user-profile/change_password`,
        passwordCheckRequest
      );

      return response;

    } catch (error) {
      return {
        message: error.response?.data?.message
      };
    }
  },

  updateProfile: async (payload) => {
    try {
      const response = await api.post(
        `${USER_URL}/user-access/user-profile/update-profile`,
        payload
      );

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
          'Profile update failed'
      };
    }
  }
};

export default profileService;