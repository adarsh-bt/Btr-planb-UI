import axios from 'axios';
import authservice from 'pages/authentication/services/authservice';
import { useNavigate } from 'react-router-dom';

class approvalservice {
  // static BASE_URL = "http://localhost:8080/useraccess"
  static BASE_URL = 'http://localhost:8081';

  // adding header token is reamining
  static async superadmin_approval() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${approvalservice.BASE_URL}/user-access/super-admin/fetch-all`,

        {
          headers: {
            Authorization: `Bearer ${token}` // Add token in Authorization header
          }
        }
      );
      return response.data; // Return a consistent object on success
    } catch (err) {
      return {
        message: err.response.data.message
      };
    }
  }

  static async itadmin_approval() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${approvalservice.BASE_URL}/user-access/it-admin/fetch-all`,

        {
          headers: {
            Authorization: `Bearer ${token}` // Add token in Authorization header
          }
        }
      );
      return response.data; // Return a consistent object on success
    } catch (err) {
      return {
        message: err.response.data.message
      };
    }
  }

  static async districtadmin_approval() {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `${approvalservice.BASE_URL}/user-access/district-admin/fetch-all`,

        {
          headers: {
            Authorization: `Bearer ${token}` // Add token in Authorization header
          }
        }
      );

      console.log(' dis admin ', response.data);
      return response.data; // Return a consistent object on success
    } catch (err) {
      return {
        message: err.response.data.message
      };
    }
  }

  static async tsoadmin_roleassign() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${approvalservice.BASE_URL}/user-access/tso-admin/fetch-all`,

        {
          headers: {
            Authorization: `Bearer ${token}` // Add token in Authorization header
          }
        }
      );
      return response.data; // Return a consistent object on success
    } catch (err) {
      return {
        message: err.response.data.message
      };
    }
  }

  static async saveSuperadminApproval(payload) {
    console.log('service payload', payload);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${approvalservice.BASE_URL}/user-access/super-admin/saveapprovals`,
        payload, // Send payload as the body
        {
          headers: {
            Authorization: `Bearer ${token}` // Ensure token is included
          }
        }
      );

      return response.data; // Return response data on success
    } catch (err) {
      console.log('errrrrr ', err);
      return {
        message: err.response ? err.response.data.message : 'An error occurred'
      }; // Return error message if the API call fails
    }
  }

  static async saveItadminApproval(payload) {
    console.log('service payload', payload);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${approvalservice.BASE_URL}/user-access/it-admin/saveapprovals`,
        payload, // Send payload as the body
        {
          headers: {
            Authorization: `Bearer ${token}` // Ensure token is included
          }
        }
      );

      return response.data; // Return response data on success
    } catch (err) {
      console.log('errrrrr ', err);
      return {
        message: err.response ? err.response.data.message : 'An error occurred'
      }; // Return error message if the API call fails
    }
  }

  static async saveDisApproval(payload) {
    console.log('service payload', payload);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${approvalservice.BASE_URL}/user-access/district-admin/saveapprovals`,
        payload, // Send payload as the body
        {
          headers: {
            Authorization: `Bearer ${token}` // Ensure token is included
          }
        }
      );

      return response.data; // Return response data on success
    } catch (err) {
      console.log('errrrrr ', err);
      return {
        message: err.response ? err.response.data.message : 'An error occurred'
      }; // Return error message if the API call fails
    }
  }

  static async saveTsoRolesAssign(payload) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${approvalservice.BASE_URL}/user-access/tso-admin/saverole`,
        payload, // Send payload as the body
        {
          headers: {
            Authorization: `Bearer ${token}` // Ensure token is included
          }
        }
      );

      return response.data; // Return response data on success
    } catch (err) {
      console.log('errrrrr ', err);
      return {
        message: err.response ? err.response.data.message : 'An error occurred'
      }; // Return error message if the API call fails
    }
  }

  // roles without schmes

  static async allroles() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${approvalservice.BASE_URL}/user-access/role/fetch/roles`, {
        headers: {
          Authorization: `Bearer ${token}` // Ensure token is included
        }
      });

      return response.data; // Return response data on success
    } catch (err) {
      return {
        message: err.response ? err.response.data.message : 'An error occurred'
      }; // Return error message if the API call fails
    }
  }

  static async allschmes() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${approvalservice.BASE_URL}/user-access/role/fetch/schemes`, {
        headers: {
          Authorization: `Bearer ${token}` // Ensure token is included
        }
      });
      console.log('schmes ', response.data);
      return response.data; // Return response data on success
    } catch (err) {
      return {
        message: err.response ? err.response.data.message : 'An error occurred'
      }; // Return error message if the API call fails
    }
  }

  static async allrolesBySchems(schemeId) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${approvalservice.BASE_URL}/user-access/role/fetch/schemes/${schemeId}/roles`, {
        headers: {
          Authorization: `Bearer ${token}` // Ensure token is included
        }
      });
      console.log('schmes ', response.data);
      return response.data; // Return response data on success
    } catch (err) {
      return {
        message: err.response ? err.response.data.message : 'An error occurred'
      }; // Return error message if the API call fails
    }
  }

  // end

  // zone services

  static async zoneslist(officeType, officeId) {
    console.log('office type ', officeType, ' officeId ', officeId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${approvalservice.BASE_URL}/btr-service/btr-api/zones/${officeType}/${officeId}`, {
        headers: {
          Authorization: `Bearer ${token}` // Ensure token is included
        }
      });
      return response.data; // Return response data on success
    } catch (err) {
      return {
        message: err.response ? err.response.data.message : 'An error occurred'
      }; // Return error message if the API call fails
    }
  }

  static async zone_save(zoneId, user_id, assigner_id) {
    console.log('zone id ', zoneId, ' userid ', user_id);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${approvalservice.BASE_URL}/btr-service/btr-api/assigned-zone-save`,
        { user_id, zoneId, assigner_id },
        {
          headers: {
            Authorization: `Bearer ${token}` // Ensure token is included
          }
        }
      );
      return response.data; // Return response data on success
    } catch (err) {
      return {
        message: err.response ? err.response.data.message : 'An error occurred'
      }; // Return error message if the API call fails
    }
  }
}
export default approvalservice;
