import axios from 'axios';
import { InvalidTokenError, jwtDecode } from 'jwt-decode';
import authservice from 'pages/authentication/services/authservice';
import { useNavigate } from 'react-router-dom';

class btrservice {
  // static BASE_URL = "http://localhost:8080/useraccess"
  static BASE_URL = 'http://localhost:8082/btr-service';

  // adding header token is reamining
  static async btr_lists_data(userid, page = 0, size = 10, filter = '') {
    try {
      const token = localStorage.getItem('token');
      var userid = authservice.userid();
      console.log('user id ', userid);
      const response = await axios.get(`${btrservice.BASE_URL}/btr-api/btr-data/${userid}?page=${page}&size=${size}&filter=${filter}`, {
        headers: {
          Authorization: `Bearer ${token}` // Add token in Authorization header
        }
      });
      console.log(response.data);
      return response.data; // Return a consistent object on success
    } catch (err) {
      console.log(respo);
      return {
        message: err.response.data.message
      };
    }
  }

  static btrservice_download = {
    // Existing functions like btr_lists_data...

    download_excel: (UserId) => {
      return axios.get(`${btrservice.BASE_URL}/btr-api/exportExcel/${UserId}`, {
        responseType: 'arraybuffer'
      });
    }
  };
}
export default btrservice;
