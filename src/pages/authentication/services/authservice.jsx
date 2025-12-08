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
      localStorage.setItem('des', responseData.payload.designation);
      console.log('>> >>>>> >>>>>> ', responseData);
      return responseData;
    } 
 catch (err) {
  if (err.response) {
    const status = err.response.status;
    const rawError = err.response.data;

    // Handle service down cases clearly
    if (status === 503 || status === 502 || status === 500) {
      return { message: "Server is temporarily unavailable. Please try again later." };
    }

    let decryptedError = '';
    try {
      // Try decrypting only if the data is your encrypted string
      const decrypted = decryptData(rawError);
      decryptedError = JSON.parse(decrypted)?.message || decrypted;
    } catch {
      // Fallback for non-encrypted backend errors
      decryptedError = rawError?.message || "Unexpected error from server.";
    }

    return { message: decryptedError };
  }

  if (err.request) {
    return { message: "Unable to reach server. Please check your connection." };
  }

  return { message: err.message || "An unknown error occurred" };
}

  }

static async fetchPermission(token)  {
    try {
        const BASE_URL = mainapi.USER_API;
        const res = await fetch(`${BASE_URL}/user-access/user-state/access`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            throw new Error(`Permissions API failed: ${res.status}`);
        }

        const data = await res.json();
        return { success: true, data };
    } catch (err) {
        console.error("Error fetching permissions:", err);
        return { success: false, error: err.message };
    }
};

  
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
      const response = await axios.post(`${authservice.BASE_URL}/user-access/api/user-registration/save-user`, userData
      );
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
        `${authservice.BASE_URL}/user-access/api/email_verify`,
        encrypted, // assuming `encrypted` is a string or compatible payload
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
    console.log("api   ????? ",authservice.BASE_URL);
    if (response.status === 200) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('activeZone');
  localStorage.removeItem('des');
  localStorage.removeItem('permissionsData');
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
    try{
    const token = localStorage.getItem('token');
    const decodedToken = jwtDecode(token);
    return decodedToken.roles;}
    catch{
      return null
    }
  }

    static getdesignation() {
    try{
      const designation = localStorage.getItem('des');
      return designation;
    } catch (error) {
      console.error('Error decoding token:', error);
    }
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
}
export default authservice;