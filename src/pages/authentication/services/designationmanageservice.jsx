import axios from 'axios';
import mainapi from 'api/mainapi';

const DesignationManageService = {
  BASE_URL:  mainapi.USER_API,

  async getDesignations() {
    try {
      const response = await axios.get(`${this.BASE_URL}/user-access/api/fetch-designations`);
      console.log("designations: ",response.designationName)
      return { payload: response.data.payload };
    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred while fetching designations.'
      };
    }
  },

  async saveOrUpdateDesignation(userData) {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`${this.BASE_URL}/user-access/api/save-designation`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { payload: response.data.payload };
    } catch (err) {
      return {
        message: err.response?.data?.message || 'Error saving Designation.'
      };
    }
  }
};

export default DesignationManageService;
