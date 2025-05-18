import axios from 'axios';
import { InvalidTokenError, jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { encryptData , decryptData } from './encryptionUtils';

import mainapi from 'api/mainapi';

class authservice {

  static BASE_URL = mainapi.USER_API;
//   static BASE_URL = "https://9a89-103-149-159-190.ngrok-free.app";


    static async login(userLogin) {
    try {
        const encrypted = encryptData(JSON.stringify(userLogin));

        const response = await axios.post(`${authservice.BASE_URL}/user-access/api/login`, encrypted, {
            headers: {
                'Content-Type': 'text/plain'
            }
        });

        // Decrypt the response here
        const decryptedJson = decryptData(response.data);
        const responseData = JSON.parse(decryptedJson);

        // Store token/user
        localStorage.setItem('token', responseData.payload.token);
        localStorage.setItem('user', responseData.payload.username);

        return responseData;
    } catch (err) {
        if (err.response) {
            return {
                message: err.response.data.message || 'Unknown error from backend'
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


    static async registration(userData) {
        try {
           
            console.log("userdataregister > ",userData);
            const response = await axios.post(`${authservice.BASE_URL}/user-access/api/user-registration/save-user`, userData, {
                headers: {
                  'Cache-Control': 'no-cache',
                }
              });
          console.log("ress   ",response.status)
            return response;
        } catch (err) {
            console.log("err >>",err.response.data.message)           
            return {
                message: err.response.data.message
            };
        }
    }
    

   
    static async email_verification(username){
      
        try{
            const response = await axios.post(`${authservice.BASE_URL}/user-access/api/email_verify`,{username})
            return response
        }catch(err){
            return {
                message: err.response.data.message
            };
        }
    }

  static async verify_otp(userid, otp) {
    try {
      const response = await axios.post(`${authservice.BASE_URL}/user-access/api/validateOtp`, { userid, otp });
      console.log(response.data);
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  static async password_reset(userid, password) {
    try {
      const response = await axios.post(`${authservice.BASE_URL}/user-access/api/password_reset`, { userid, password });
      return response;
    } catch (err) {
      throw err;
    }
  }

  // Checker
  static logout(navigate) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/login');
  }

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

    const allowedRoles = new Set([
      'Taluk Level Approver',
      'District Level Approver',
      'Super Admin',
      'State Level Approver',
      'IT Admin'
    ]);

    return userRoles.some(role => allowedRoles.has(role));
  } catch (error) {
    console.error('Invalid token:', error);
    return false;
  }
}


}

export default authservice;
