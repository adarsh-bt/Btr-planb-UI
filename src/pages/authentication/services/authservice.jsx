
import { jwtDecode } from 'jwt-decode';
import { encryptData, decryptData } from './encryptionUtils';
import api from 'api/api';

class AuthService {

  // ================= LOGIN =================
  static async login(userLogin) {
    try {
      const encrypted = encryptData(JSON.stringify(userLogin));

      const response = await api.post(
        '/user-access/api/login',
        encrypted,
        {
          headers: { 'Content-Type': 'text/plain' },
          skipAuth: true
        }
      );

      const decryptedJson = decryptData(response.data);
      const responseData = JSON.parse(decryptedJson);

      const payload = responseData.payload;

      localStorage.setItem('token', payload.token);
      localStorage.setItem('user', payload.username);
      localStorage.setItem('des', payload.designation);
      localStorage.setItem('dis', payload.distid);

      return responseData;
    } catch (err) {
      console.error('Error during login:', err);
      return this.handleEncryptedError(err);
    }
  }

  // ================= PERMISSIONS =================
  static async fetchPermissions() {
    try {
      const response = await api.get('/user-access/user-state/userpremissions');
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to fetch permissions');
    }
  }

  // ================= REGISTER =================
  static async registration(userData) {
    try {
      const response = await api.post(
        '/user-access/api/user-registration/save-user',
        userData,
        { skipAuth: true }
      );
      
      return response;
    } catch (err) {
      return {
        message: err.response?.data?.message || 'Registration failed'
      };
    }
  }

  // ================= EMAIL VERIFY =================
  static async email_verification(username) {
    try {
      const encrypted = encryptData(JSON.stringify(username));

      const response = await api.post(
        '/user-access/api/email_verify',
        encrypted,
        {
          headers: { 'Content-Type': 'text/plain' },
          skipAuth: true
        }
      );

      return JSON.parse(decryptData(response.data));

    } catch (err) {
      return this.handleEncryptedError(err);
    }
  }

  // ================= OTP VERIFY =================
  static async verifyOtp(userData) {
    try {
      const encrypted = encryptData(JSON.stringify(userData));

      const response = await api.post(
        '/user-access/api/validateOtp',
        encrypted,
        {
          headers: { 'Content-Type': 'text/plain' },
          skipAuth: true
        }
      );

      return JSON.parse(decryptData(response.data));

    } catch (err) {
      return this.handleEncryptedError(err);
    }
  }

  // ================= PASSWORD RESET =================
  static async passwordReset(userData) {
    try {
      const encrypted = encryptData(JSON.stringify(userData));

      const response = await api.post(
        '/user-access/api/password_reset',
        encrypted,
        {
          headers: { 'Content-Type': 'text/plain' },
          skipAuth: true
        }
      );

      return JSON.parse(decryptData(response.data));

    } catch (err) {
      return this.handleEncryptedError(err);
    }
  }

  // ================= LOGOUT =================
  static async logout() {
    try {
      await api.post('/user-access/api/logout');

    } catch (err) {
      // ignore error → still logout locally
    }

    // 🔥 ALWAYS clear storage (important)
    localStorage.clear();

    // 🔥 Force redirect
    window.location.href = '/login';
  }

  // ================= TOKEN HELPERS =================
  static gettoken() {
    return localStorage.getItem('token');
  }

  static userid() {
    try {
      return jwtDecode(this.gettoken()).sub;
    } catch {
      return null;
    }
  }

  static getrole() {
    try {
      return jwtDecode(this.gettoken()).roles;
    } catch {
      return null;
    }
  }

  static getusername() {
    try {
      return jwtDecode(this.gettoken()).username;
    } catch {
      return null;
    }
  }

  static getdesignation() {
    try {
      return jwtDecode(this.gettoken()).des;
    } catch {
      return null;
    }
  }

  static getzone() {
    return localStorage.getItem('activeZone');
  }

   static agriyear() {
    return localStorage.getItem('activeAgriYear');
  }

  static hasAllowedRole() {
    try {
      const roles = this.getrole();

      if (!roles) return false;

      const roleArray = Array.isArray(roles) ? roles : [roles];

      const allowed = [
        'Taluk Level Approver',
        'District Level Approver',
        'Super Admin',
        'State Level Approver',
        'IT Admin'
      ];

      return roleArray.some(role => allowed.includes(role));

    } catch {
      return false;
    }
  }

  // ================= COMMON ERROR HANDLER =================
  static handleEncryptedError(err) {
    if (err.response) {
      try {
        const decrypted = decryptData(err.response.data);
        const parsed = JSON.parse(decrypted);

        return {
          success: false,
          message: parsed?.message || 'Request failed'
        };

      } catch {
        return {
          success: false,
          message: 'Server is Busy. Please try again later.'
        };
      }
    }

    if (err.request) {
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }

    return {
      success: false,
      message: err.message || 'Unknown error'
    };
  }

  // ================= SAVE OFFICE INFO =================
static async saveOfficeInfo(userId, officeData) {
  try {
    const response = await api.post(
      `/user-access/api/user-registration/${userId}/office-info`,
      officeData
    );

    return response.data;

  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || 'Failed to save office info'
    };
  }
}

// Add this method to AuthService class
static async getUserOfficeInfo() {
  try {
    const token = this.gettoken();
    if (!token) return null;
    
    const userId = this.userid();
    if (!userId) return null;
    
    const response = await api.get(`/user-access/api/user-registration/${userId}/office-info`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    return response.data;
  } catch (err) {
    console.error('Error fetching office info:', err);
    return null;
  }
}
}

export default AuthService;