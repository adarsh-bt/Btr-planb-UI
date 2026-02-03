
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
    const BASE_URL = mainapi.BASE_URL;
    // const url = `${BASE_URL}/btr-service/api/fetch-btr/zone/${zone}/data?page=${page}&size=${size}&filter=${encodeURIComponent(filter)}`;
    const url = `${BASE_URL}/btr-service/btr-api/btr-data/${zone}?page=${page}&size=${size}&filter=${filter}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
console.log("ressss ",response)
    return response.data;
  } catch (err) {
    console.error('API Error:', err);
    return {
      message: err?.response?.data?.message || err.message || 'Unknown error'
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
console.log("Plot ID in btr service:", plotId);
    // Build URL manually
    const BASE_URL = mainapi.BASE_URL; // manually using BASE_URL
    const url = `${BASE_URL}/btr-service/cluster-api/${plotId}/btrplot-usage`;

    // Make request manually with headers
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("Plot usage response:", response);
    return response.data;
  } catch (error) {
    console.error('Error fetching plot usage:', error);
    return {
      message: error?.response?.data?.message || error.message || 'Unknown error'
    };
  }
}

static async updatePlotTotalArea(btrId, totCent) {
  try {
    // Get token manually
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authorization token missing');
    }
alert("btrId "+btrId+" totCent "+totCent)
    // Build URL manually
    const BASE_URL = mainapi.BASE_URL; // manually using BASE_URL
    const url = `${BASE_URL}/btr-service/api/btr-data/${btrId}/update-totcent?totCent=${encodeURIComponent(totCent)}`;

    // Make PUT request manually with headers
    const response = await axios.put(url, null, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("Update plot total area response:", response);
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
