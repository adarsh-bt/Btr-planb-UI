
import axios from 'axios';
import { InvalidTokenError, jwtDecode } from 'jwt-decode';
import authservice from 'pages/authentication/services/authservice';
import { useNavigate } from 'react-router-dom';
import mainapi from 'api/mainapi';


class btrservice {
  // static BASE_URL = "http://localhost:8080/useraccess"
  static BASE_URL = mainapi.BTR_API;

  // adding header token is reamining
static async btr_lists_data(page = 0, size = 10, filter = '', zoneId = null) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authorization token missing');
    }

    const zone = zoneId || authservice.getzone();
    if (!zone) {
      throw new Error('Zone ID missing');
    }

    console.log("Zone ID in btr service:", zone);

    const url = `http://localhost:8082/btr-service/api/fetch-btr/zone/${zone}/data?page=${page}&size=${size}&filter=${encodeURIComponent(filter)}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  } catch (err) {
    console.error('API Error:', err);
    return {
<<<<<<< HEAD
      message: err?.response?.data?.message || 'Unknown error'
=======
      message: err?.response?.data?.message || err.message || 'Unknown error'
>>>>>>> origin/local-server
    };
  }
}

  static btrservice_download = {
    // Existing functions like btr_lists_data...

    download_excel: (UserId) => {
      return axios.get(`${btrservice.BASE_URL}/btr-service/btr-api/exportExcel/${UserId}`, {
        responseType: 'arraybuffer'
      });
    }
  };
}
export default btrservice;
