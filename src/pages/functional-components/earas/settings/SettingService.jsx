import mainapi from 'api/mainapi';
import axios from 'axios';



const USER_URL = mainapi.USER_API

const BASE_URL = mainapi.USER_API;

const SettingService = {
  
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found. Please login again.');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  },

  async fetchDistricts() {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${BASE_URL}/user-access/api/it-admin/get-all`,
        { headers }
      );
      return response.data; // returns the array of districts
    } catch (err) {
      if (err.response?.status === 403) {
        throw new Error('Access denied. You don’t have permission to view districts.');
      }
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch districts');
    }
  },

  async saveDistrict(districtData) {
  try {
    const headers = this.getAuthHeaders();
    const userId = authservice.userid(); // you still need authservice for userid
    const payload = {
      ...districtData,
      addedBy: userId,
      dist_lsg_code: Number(districtData.dist_lsg_code),
      des_dist_code: Number(districtData.des_dist_code),
    };
    const response = await axios.post(
      `${BASE_URL}/user-access/api/it-admin/saveDistrict`,
      payload,
      { headers }
    );
    return response.data;
  } catch (err) {
    if (err.response?.status === 403) throw new Error('Access denied. You don’t have permission to modify districts.');
    if (err.response?.status === 401) throw new Error('Session expired. Please login again.');
    throw new Error(err.response?.data?.message || err.message || 'Failed to save district');
  }
},

async toggleDistrictActive(district) {
  const updatedDistrict = { ...district, is_active: !district._active };
  return this.saveDistrict(updatedDistrict);
}

  
};

export default SettingService;
