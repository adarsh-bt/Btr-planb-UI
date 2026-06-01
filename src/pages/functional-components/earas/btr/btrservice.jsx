
import axios from 'axios';
import { InvalidTokenError, jwtDecode } from 'jwt-decode';
import authservice from 'pages/authentication/services/authservice';
import { useNavigate } from 'react-router-dom';
import mainapi from 'api/mainapi';
import api from 'api/api';


class btrservice {
  // static BASE_URL = "http://localhost:8080/useraccess"
  static BASE_URL = mainapi.BTR_API;

  // adding header token is reamining
static async btr_lists_data(page = 0, size = 10, filter = '', zoneId = null) {
  try {

    const zone = zoneId || authservice.getzone();

    if (!zone) {
      throw new Error('Zone ID missing');
    }

    const response = await api.get(
      `/btr-service/btr-api/btr-data/${zone}`,
      {
        params: {
          page,
          size,
          filter
        }
      }
    );

    console.log('API Response:', response.data);

    return response.data;

  } catch (err) {

    console.error('API Error:', err);

    // ❗ 401 handled globally by interceptor (DO NOT handle here)

    if (err.response) {
      return {
        message:
          err.response.data?.message ||
          'Failed to fetch BTR data'
      };
    }

    return {
      message: 'Network error. Please try again.'
    };
  }
}
// In your btrservice.js file, add:
static async getPlotUsageData(plotId) {
  try {
    // Get token manually
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authorization token missing');
    }

    // Build URL manually
    const BASE_URL = mainapi.BASE_URL; // manually using BASE_URL
    const url = `${BASE_URL}/btr-service/cluster-api/${plotId}/btrplot-usage`;

    // Make request manually with headers
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

  
    return response.data;
  } catch (error) {
    console.error('Error fetching plot usage:', error);
    return {
      message: error?.response?.data?.message || error.message || 'Unknown error'
    };
  }
}

static async updatePlotTotalArea(btrId, totCent, userId) {
  try {
    // Get token manually
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authorization token missing');
    }

    // Build URL manually
    const BASE_URL = mainapi.BASE_URL; // manually using BASE_URL
const url = `${BASE_URL}/btr-service/api/btr-data/${btrId}/update-totcent?totCent=${totCent}&userId=${userId}`;

    // Make PUT request manually with headers
    const response = await axios.put(url, null, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    
    return response.data;
  } catch (error) {
    console.error('Error updating plot total area:', error);
    return {
      message: error?.response?.data?.message || error.message || 'Unknown error'
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
