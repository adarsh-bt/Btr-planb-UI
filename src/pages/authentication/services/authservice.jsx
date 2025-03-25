import axios from 'axios';
import { InvalidTokenError, jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

class authservice {
//   static BASE_URL = "https://c163-103-170-55-191.ngrok-free.app/user-access"
  static BASE_URL = 'http://localhost:8080/user-access';


    static async login(username, password) {
        try {
            const response = await axios.post(`${authservice.BASE_URL}/api/login`, { username, password });
            localStorage.setItem('token', response.data.payload.token);
            localStorage.setItem('user', response.data.payload.username);
            return response.data;  // Return the data when the response is successful
        } catch (err) {
            // Check if `err.response` exists before accessing `err.response.data`
            if (err.response) {
                // If the error has a response, return the error message from the backend
                return {
                    message: err.response.data.message || 'Unknown error from backend'
                };
            } else if (err.request) {
                // If the request was made but no response was received, handle it here
                return {
                    message: 'Sorry, Please try again later'
                };
            } else {
                // For any other errors (e.g., request setup issues)
                return {
                    message: err.message || 'An unknown error occurred'
                };
            }
        }
    }
    

    static async registration(userData) {
        try {
           
            const response = await axios.post(`${authservice.BASE_URL}/api/user-registration/save-user`, userData);    
          
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
            const response = await axios.post(`${authservice.BASE_URL}/api/email_verify`,{username})
            return response
        }catch(err){
            return {
                message: err.response.data.message
            };
        }
    }

  static async verify_otp(userid, otp) {
    try {
      const response = await axios.post(`${authservice.BASE_URL}/api/validateOtp`, { userid, otp });
      console.log(response.data);
      return response.data;
    } catch (err) {
      throw err;
    }
  }

    static async password_reset(userid,password){
        try{
            const response = await axios.post(`${authservice.BASE_URL}/api/password_reset`,{userid,password})
            return response
        }catch(err){
            throw err;
        }
    }
  

        // Checker
        static logout(navigate){
        
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            
            navigate('/login');
        }
    
}

export default authservice;
