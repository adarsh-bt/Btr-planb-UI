import axios from 'axios';

const RoleSchemeService = {
  BASE_URL: 'http://localhost:8080/user-access',

  async getRoles() {
    try {
      const response = await axios.get(`${this.BASE_URL}/api/fetch/roles`);
      console.log('roles > ', response.data);
      return response.data.payload || response.data; // Add fallback for different response structures
    } catch (err) {
      console.error('Error fetching roles:', err);
      throw err; // Throw the error instead of returning an object
    }
  },

  async getRolesbySchemes(schemeId) {
    try {
      const response = await axios.get(`${this.BASE_URL}/api/fetch/schemes/${schemeId}/roles`);
      console.log('rolesbyscheme > ', response.data);
      return response.data.payload || response.data; // Add fallback for different response structures
    } catch (err) {
      console.error('Error fetching roles by scheme:', err);
      throw err; // Throw the error instead of returning an object
    }
  },

  async getSchemes() {
    try {
      const response = await axios.get(`${this.BASE_URL}/api/fetch/schemes`);
      console.log('schemes >>', response.data);
      return response.data.payload // Add fallback for different response structures
    } catch (err) {
      console.error('Error fetching schemes:', err);
      throw err; // Throw the error instead of returning an object
    }
  }
};

export default RoleSchemeService;