import axios from 'axios';
import { InvalidTokenError, jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { encryptData, decryptData } from './encryptionUtils';

import mainapi from 'api/mainapi';

class authservice {
  static BASE_URL = mainapi.BASE_URL;
  //   static BASE_URL = "https://9a89-103-149-159-190.ngrok-free.app";

  static async login(userLogin) {
    try {
      
      const encrypted = encryptData(JSON.stringify(userLogin));
      console.log("user login ",encrypted)

      const response = await axios.post(`${authservice.BASE_URL}/user-access/api/login`, encrypted, {
        headers: {
          'Content-Type': 'text/plain'
        }
      });

      // Decrypt the response here
      const decryptedJson = decryptData(response.data);
      const responseData = JSON.parse(decryptedJson);

      // localStorage.setItem('pression', response.payload.schmes);
      console.log('pression', response.payload);
      // Store token/user
      localStorage.setItem('token', responseData.payload.token);
      localStorage.setItem('user', responseData.payload.username);

      console.log('>> >>>>> >>>>>> ', responseData);
      return responseData;
    } catch (err) {
  if (err.response) {
    let decryptedError = '';
try {
  const decrypted = decryptData(err.response.data);
  decryptedError = JSON.parse(decrypted)?.message || decrypted;
} catch (decryptionError) {
  decryptedError = 'Unknown encrypted error from backend';
}

console.log("err ",decryptedError.message)
    return {
      message: decryptedError || err.response.data.message || 'Unknown error from backend'
    };
  } else if (err.request) {
    return {
      message: 'Sorry, Please try again later'
    };
  } else {
    return {
      message: err.message || 'An unknown error occurred'
    };
  }
}

  }

  static async fetchPermissions(token) {
    try {
      const response = await axios.get(`${authservice.BASE_URL}/user-access/user-state/userpremissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      // If your API returns encrypted data, decrypt here:
      // const decryptedJson = decryptData(response.data);
      // return JSON.parse(decryptedJson);
      return response.data;
    } catch (err) {
      throw new Error((err.response && err.response.data && err.response.data.message) || 'Failed to fetch permissions');
    }
  }

  static async registration(userData) {
    try {
      console.log('userdataregister > ', userData);
      const response = await axios.post(`${authservice.BASE_URL}/user-access/api/user-registration/save-user`, userData, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      console.log('ress   ', response.status);
      return response;
    } catch (err) {
      console.log('err >>', err.response.data.message);
      return {
        message: err.response.data.message
      };
    }
  }

  static async email_verification(username) {
    try {
      const encrypted = encryptData(JSON.stringify(username));
      const response = await axios.post(
        `${authservice.BASE_URL}/user-access/api/email_verify`, // <-- CORRECTED
        encrypted,
        {
          headers: {
            'Content-Type': 'text/plain'
          }
        }
      );
      const decryptedJson = decryptData(response.data);
      const responseData = JSON.parse(decryptedJson);
      console.log('ok', responseData);
      return responseData;
    } catch (err) {
      return {
        message: err.response.data.message
      };
    }
  }

  static async verify_otp(userData) {
    try {
      const encrypted = encryptData(JSON.stringify(userData));
      const response = await axios.post(`${authservice.BASE_URL}/user-access/api/validateOtp`, encrypted, {
        headers: {
          'Content-Type': 'text/plain'
        }
      });

      const decryptedJson = decryptData(response.data);
      const responseData = JSON.parse(decryptedJson);
      return responseData;
    } catch (err) {
      throw err;
    }
  }

  static async password_reset(userData) {
    try {
      const encrypted = encryptData(JSON.stringify(userData));
      const response = await axios.post(`${authservice.BASE_URL}/user-access/api/password_reset`, encrypted, {
        headers: {
          'Content-Type': 'text/plain'
        }
      });
      const decryptedJson = decryptData(response.data);
      const responseData = JSON.parse(decryptedJson);
      console.log('use data ');
      return responseData;
    } catch (err) {
      throw err;
    }
  }

  // Checker

static async logout(navigate) {
  try {
    const token = localStorage.getItem('token');

    const response = await axios.post(`${authservice.BASE_URL}/user-access/api/logout`, null, {
      headers: {
        'Authorization': `Bearer ${token}`, // or handled via cookie if not using token in header
        'Content-Type': 'application/json'
      },
      withCredentials: true 
    });
    if (response.status === 200) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  navigate('/login');
}

    return response.data;
  } catch (error) {
    if (error.response) {
      return { message: error.response.data || 'Logout failed' };
    } else {
      return { message: error.message || 'Logout error' };
    }
  }
}

  // static logout(navigate) {
  //   localStorage.removeItem('token');
  //   localStorage.removeItem('user');

  //   navigate('/login');
  // }

  static userid() {
    const token = localStorage.getItem('token');
    const decodedToken = jwtDecode(token);
    return decodedToken.sub;
  }

  static getrole() {
    const token = localStorage.getItem('token');
    const decodedToken = jwtDecode(token);

    return decodedToken.roles;
  }

  static getzone() {
    try{
      const zoneId = localStorage.getItem('activeZone');
      return zoneId;
    } catch (error) {
      console.error('Error decoding token:', error);
      
    }
  }

  static getusername() {
    const user_name = localStorage.getItem('user');
   
    return user_name;
  }

  static gettoken() {
    return localStorage.getItem('token');
  }

  static hasAllowedRole() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      let userRoles = decoded.roles;

      // Normalize roles into an array
      if (typeof userRoles === 'string') {
        userRoles = [userRoles];
      } else if (!Array.isArray(userRoles)) {
        return false; // Unexpected format
      }

      const allowedRoles = new Set(['Taluk Level Approver', 'District Level Approver', 'Super Admin', 'State Level Approver', 'IT Admin']);

      return userRoles.some((role) => allowedRoles.has(role));
    } catch (error) {
      console.error('Invalid token:', error);
      return false;
    }
  }
  // ✅ NEW METHOD: Get user's specific role level for conditional logic
  static getUserRole() {
    try {
      const roles = this.getrole();
      if (!roles) return null;
      
      // Normalize to array
      const roleArray = Array.isArray(roles) ? roles : [roles];
      
      // Return highest priority role
      if (roleArray.includes('Super Admin')) return 'Super Admin';
      if (roleArray.includes('State Level Approver')) return 'State Level Approver';
      if (roleArray.includes('District Level Approver')) return 'District Level Approver';
      if (roleArray.includes('Taluk Level Approver')) return 'Taluk Level Approver';
      if (roleArray.includes('IT Admin')) return 'IT Admin';
      
      return roleArray[0]; // Return first role if none of the above
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  // ✅ NEW METHOD: Clear all authentication data
  static clearAuthData() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('activeZone');
      // Add any other auth-related items you store in localStorage
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  // ✅ NEW METHOD: Get token expiration info
  static getTokenInfo() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = decoded.exp - currentTime;
      
      return {
        isExpired: decoded.exp < currentTime,
        expiresAt: new Date(decoded.exp * 1000),
        timeUntilExpiry: timeUntilExpiry > 0 ? timeUntilExpiry : 0,
        issuedAt: new Date(decoded.iat * 1000)
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      return null;
    }
  }
}

export default authservice;