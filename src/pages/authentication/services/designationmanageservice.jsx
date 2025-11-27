import axios from 'axios';
import mainapi from 'api/mainapi';

const DesignationManageService = {
  USER_URL:  mainapi.USER_API,

  async getDesignations() {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${this.USER_URL}/user-access/api/fetch-designations`,{
        headers: {
           Authorization: `Bearer ${token}`
        }
      });
      console.log("designations: ",response.designationName)
      return { payload: response.data.payload };
    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred while fetching designations.'
      };
    }
  },

    async getDesignationsManage() {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${this.USER_URL}/user-access/api/fetch-designations-manage`,{
        headers: {
           Authorization: `Bearer ${token}`
        }
      });
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
      const response = await axios.post(`${this.USER_URL}/user-access/api/save-designation`, userData, {
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
