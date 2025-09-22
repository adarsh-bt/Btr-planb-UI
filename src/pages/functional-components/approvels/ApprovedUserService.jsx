import axios from 'axios';
import mainapi from 'api/mainapi';
// Create service class with proper export
class ApprovedUserService {
  static USER_URL = mainapi.USER_API;
  static BTR_URL = mainapi.BTR_API;
  // Fetch IT admin approved users
  static async fetchITAdminApprovedUsers() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${ApprovedUserService.USER_URL}/user-access/it-admin/fetch-approved-users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (err) {
      return {
        message: err?.response?.data?.message || 'Failed to fetch IT admin approved users',
        error: true
      };
    }
  }
  // Fetch district admin approved users
  static async fetchDistrictAdminApprovedUsers() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${ApprovedUserService.USER_URL}/user-access/district-admin/fetch-approved-users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(response.data);
      return response.data;
    } catch (err) {
      return {
        message: err?.response?.data?.message || 'Failed to fetch district admin approved users',
        error: true
      };
    }
  }
  // Fetch user details by ID
  static async fetchUserById(userId) {
    try {
      // const userId = '95a816d1-e16a-4fc5-8353-9be4d555bf8a';
      const token = localStorage.getItem('token');
      console.log('userId in service:', userId);
      // const userId = "44b2a345-b9c5-429f-8f66-52830f1962c8"
      const response = await axios.get(`${ApprovedUserService.USER_URL}/user-access/api/user-manage/fetch-by-id/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('response usersss', response);
      return response.data;
    } catch (err) {
      return {
        message: err?.response?.data?.message || 'Failed to fetch user details',
        error: true
      };
    }
  }
  // Update user designation
  static async updateUserDesignation(userId, designationId) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${ApprovedUserService.USER_URL}/user-access/api/user-manage/update-designation`,
        { userId, designationId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (err) {
      return {
        message: err?.response?.data?.message || 'Failed to update designation',
        error: true
      };
    }
  }
  // Get available designations
  static async getDesignations() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${ApprovedUserService.USER_URL}/user-access/user-registration/fetch-designations`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return { payload: response.data.payload };
    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred while fetching designations.',
        error: true
      };
    }
  }
  // Update user roles and office
  static async updateUserRolesAndOffice(payload) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${ApprovedUserService.USER_URL}/user-access/api/user-manage/update-user-roles`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (err) {
      return {
        message: err?.response?.data?.message || 'Failed to update user roles and office',
        error: true
      };
    }
  }
  static async getSchemes() {
    try {
      const response = await axios.get(`${ApprovedUserService.USER_URL}/user-access/api/user-approval/fetch/schemes`);
      console.log('schemes >>', response.data);
      return response.data.payload; // Add fallback for different response structures
    } catch (err) {
      console.error('Error fetching schemes:', err);
      throw err; // Throw the error instead of returning an object
    }
  }
  static async getRolesbySchemes(schemeId) {
    try {
      const token = localStorage.getItem('token'); // <-- Add this line
      const response = await axios.get(`${ApprovedUserService.USER_URL}/user-access/api/user-approval/fetch/schemes/${schemeId}/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('rolesbyscheme > ', response.data);
      return response.data.payload || response.data;
    } catch (err) {
      console.error('Error fetching roles by scheme:', err);
      throw err;
    }
  }
  // Update user schemes and roles
  static async updateUserRoleScheme({ userId, isActive, roleScheme }) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${ApprovedUserService.USER_URL}/user-access/api/user-manage/update-role-scheme`,
        { userId, isActive, roleScheme },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (err) {
      return {
        message: err?.response?.data?.message || 'Failed to update user role and scheme',
        error: true
      };
    }
  }
  static async getDistricts() {
    try {
      const response = await axios.get(`${this.USER_URL}/user-access/api/districts`);
      return response.data;
    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred while fetching districts.'
      };
    }
  }
  static async getTaluks(districtId) {
    try {
      const response = await axios.get(`${this.USER_URL}/user-access/api/districts/${districtId}/taluks`);
      return response.data;
    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred while fetching taluks.'
      };
    }
  }


  // Set user active status
  // Set user active/inactive status
  static async setUserActiveStatus(userId, isActive) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${this.USER_URL}/user-access/api/user-manage/set-active/${userId}?isActive=${isActive}`,
        {}, // Empty body as per backend
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (err) {
      return {
        message: err?.response?.data?.message || 'Failed to update user active status',
        error: true
      };
    }
  }
  // In ApprovedUserService.js
  static async updateUserOfficeType({ userId, officeType, distOfficeId, desTalukOfficeId }) {
    try {
      const token = localStorage.getItem('token');
      let payload = { userId, officeType };
      if (officeType === 'TALUK') {
        payload.desTalukOfficeId = desTalukOfficeId;
      } else if (officeType === 'DISTRICT' || officeType === 'DIRECTORATE') {
        payload.distOfficeId = distOfficeId;
      }
      const response = await axios.post(`${this.USER_URL}/user-access/api/user-manage/update-office-type`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (err) {
      return {
        message: err?.response?.data?.message || 'Failed to update office type',
        error: true
      };
    }
  }

  


    static async getZonesByUserId(userId) {
    try {
      const response = await axios.get(`${this.BTR_URL}/btr-service/btr-api/zones/assigned/${userId}`);
      console.log("response in getZonesByUserId",response);
      return response;
    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred while fetching districts.'
      };
    }
  }

  // Inside class ApprovedUserService

// Update zone assignment active status
static async updateZoneAssignmentStatus(userdata) {

  try {
    const token = localStorage.getItem('token');

   console.log("userdata in service",userdata)
   alert("ooo")

    const response = await axios.post(`${ApprovedUserService.BTR_URL}/btr-service/btr-api/zone-assignment/update-status`, userdata, {
      // headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return {
      error: false,
      payload: response.data?.payload,
      message: response.data?.message || 'Zone status updated successfully'
    };
  } catch (err) {
    return {
      error: true,
      message: err?.response?.data?.message || 'Failed to update zone status'
    };
  }
}


}
// Export as default
export default ApprovedUserService;
