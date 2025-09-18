
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
    // const zone_id = zoneId || authservice.getzone(); // fallback if zoneId not passed
// alert("zone id in btr service"+zoneId);
    const response = await axios.get(
      `${btrservice.BASE_URL}/btr-service/btr-api/btr-data/${zoneId}?page=${page}&size=${size}&filter=${filter}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (err) {
    console.error('API Error:', err);
    return {
      message: err?.response?.data?.message || 'Unknown error'
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
