import axios from 'axios';
import mainapi from 'api/mainapi';

// Create service class with proper export
class ApprovedUserService {
  static BASE_URL = mainapi.USER_API;

  // Fetch IT admin approved users
  static async fetchITAdminApprovedUsers() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${ApprovedUserService.BASE_URL}/user-access/it-admin/fetch-approved-users`, {
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
      const response = await axios.get(`${ApprovedUserService.BASE_URL}/user-access/district-admin/fetch-approved-users`, {
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
      const userId = '95a816d1-e16a-4fc5-8353-9be4d555bf8a';git 
      const token = localStorage.getItem('token');
      // const userId = "44b2a345-b9c5-429f-8f66-52830f1962c8"
      const response = await axios.get(`${ApprovedUserService.BASE_URL}/user-access/api/user-manage/user/fetch-by-id/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
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
        `${ApprovedUserService.BASE_URL}/user-access/api/user-manage/update-designation`,
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

  // Update user office type
  static async updateUserOfficeType({ userId, desTalukOfficeId, distOfficeId }) {
    try {
      const token = localStorage.getItem('token');
      const payload = { userId };
      if (desTalukOfficeId) payload.desTalukOfficeId = desTalukOfficeId;
      if (distOfficeId) payload.distOfficeId = distOfficeId;

      const response = await axios.post(`${ApprovedUserService.BASE_URL}/user-manage/update-office-type`, payload, {
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

  // Get available designations
  static async getDesignations() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${ApprovedUserService.BASE_URL}/user-access/api/fetch-designations`, {
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
      const response = await axios.post(`${ApprovedUserService.BASE_URL}/user-access/api/user-manage/update-user-roles`, payload, {
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
      const response = await axios.get(`${ApprovedUserService.BASE_URL}/user-access/api/schemes`);
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
    const response = await axios.get(
      `${ApprovedUserService.BASE_URL}/user-access/api/schemes/${schemeId}/roles`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
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
        `${ApprovedUserService.BASE_URL}/user-access/api/user-manage/update-role-scheme`,
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
      const response = await axios.get(`${this.BASE_URL}/user-access/api/districts`);
      return response.data;
    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred while fetching districts.'
      };
    }
  }

  static async getTaluks(districtId) {
    try {
      const response = await axios.get(`${this.BASE_URL}/user-access/api/districts/${districtId}/taluks`);
      return response.data;
    } catch (err) {
      return {
        message: err.response?.data?.message || 'An error occurred while fetching taluks.'
      };
    }
  }
}

// Export as default
export default ApprovedUserService;
