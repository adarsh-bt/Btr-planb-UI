import axios from 'axios';
import mainapi from 'api/mainapi';

class ApprovedListService {
  static USER_URL = mainapi.USER_API;

  static async fetchApprovedUsersForDistrictAdmin() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${this.USER_URL}/user-access/fetch-approved-users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (err) {
      return {
        message: err.response ? err.response.data.message : 'An error occurred'
      };
    }
  }

  static async fetchApprovedUsersForItAdmin() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${this.USER_URL}/user-access/it-admin/fetch-approved-users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (err) {
      return {
        message: err.response ? err.response.data.message : 'An error occurred'
      };
    }
  }
}

export default ApprovedListService;
