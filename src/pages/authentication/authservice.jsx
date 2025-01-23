import axios from 'axios';
import { InvalidTokenError, jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

class authservice {
  // static BASE_URL = "http://localhost:8080/useraccess"
  static BASE_URL = 'http://localhost:8081/user-access';

  // static async login(username, password){
  //   console.log(username,password)
  //     try{
  //         const response = await axios.post(`${authservice.BASE_URL}/api/login`,{username,password})
  //        console.log("response>>>",response.data)
  //         return response.data
  //     }catch(err){

  //         throw err;
  //     }
  // }

  static async login(username, password) {
    try {
      const response = await axios.post(`${authservice.BASE_URL}/api/login`, { username, password });
      console.log('response>>>', response.data);
      return response.data; // Return a consistent object on success
    } catch (err) {
      return {
        message: err.response.data.message
      };
    }
  }

  static async registration(userData) {
    try {
      const response = await axios.post(`${authservice.BASE_URL}/api/user-registration/save-user`, userData);
      return { success: true, data: response.data }; // Return a consistent object on success
    } catch (err) {
      return {
        message: err.response.data.message
      };
    }
  }

  static async email_verification(username) {
    try {
      const response = await axios.post(`${authservice.BASE_URL}/api/email_verify`, { username });
      return response;
    } catch (err) {
      return {
        message: err.response.data.message
      };
    }
  }

  static async verify_otp(userid, otp) {
    console.log('otp >>', otp);
    console.log('usernamess :', userid);
    try {
      const response = await axios.post(`${authservice.BASE_URL}/api/validateOtp`, { userid, otp });
      console.log(response.data);
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  static async password_reset(userid, password) {
    console.log('password >>', password);
    console.log('usernamess :', userid);
    try {
      const response = await axios.post(`${authservice.BASE_URL}/api/password_reset`, { userid, password });
      console.log(response.data);
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  // Checker
  static logout(navigate) {
    localStorage.removeItem('token');

    navigate('/');
  }
}

export default authservice;
