import axios from 'axios';

const registerService = {
  BASE_URL: 'http://localhost:8081/user-access',

  async officeList() {
    try {
      const response = await axios.get(`${this.BASE_URL}/api/taluk-district-master/fetch-all`);
      return response.data;
    } catch (err) {
      return {
        message: err.response?.data?.message || "An error occurred"
      };
    }
  }
};

export default registerService;
