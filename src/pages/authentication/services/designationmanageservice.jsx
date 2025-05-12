import axios from 'axios';

const DesignationManageService = {
  BASE_URL: 'http://localhost:8081/user-access',

  async getDesignations() {
    try {
      const response = await axios.get(`${this.BASE_URL}/api/designation`);
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
      const response = await axios.post(`${this.BASE_URL}/api/save-designation`, userData, {
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
