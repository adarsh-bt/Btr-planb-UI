import axios from "axios"
import {InvalidTokenError, jwtDecode} from 'jwt-decode';
import { useNavigate } from 'react-router-dom';


class authservice{
    // static BASE_URL = "http://localhost:8080/useraccess"
    static BASE_URL = "http://localhost:8080/user-access"

    

    static async login(username, password){
      console.log(username,password)
        try{
            const response = await axios.post(`${authservice.BASE_URL}/api/login`,{username,password})
           console.log("response>>>",response.data)
            return response.data
        }catch(err){
          
            throw err;
        }
    }



    static async registration(userData) {
        try {
           
            const response = await axios.post(`${authservice.BASE_URL}/api/user-registration/save-user`, userData);     
            return response.data;
        } catch (err) {           
            throw err;
        }
    }
    

   
    static async email_verification(username){
      
        try{
            const response = await axios.post(`${authservice.BASE_URL}/api/email_verify`,{username})
         console.log(response.data)
            return response.data
        }catch(err){
            throw err;
        }
    }

    static async verify_otp(userid,otp){
        console.log("otp >>",otp)
      console.log("usernamess :",userid)
        try{
            const response = await axios.post(`${authservice.BASE_URL}/api/validateOtp`,{userid,otp})
         console.log(response.data)
            return response.data
        }catch(err){
            throw err;
        }
    }

    static async password_reset(userid,password){
        console.log("password >>",password)
      console.log("usernamess :",userid)
        try{
            const response = await axios.post(`${authservice.BASE_URL}/api/password_reset`,{userid,password})
         console.log(response.data)
            return response.data
        }catch(err){
            throw err;
        }
    }



        // Checker
        static logout(navigate){
        
            localStorage.removeItem('token')
            
            navigate('/');
        }
    
        static isAuth(){
            const token = localStorage.getItem('token')
            return !!token
        }
    
        static isAdmin(){
            try{
    
            
            const token = localStorage.getItem('token')
            const decodedToken = jwtDecode(token);  // Decodes the JWT
            const role = decodedToken.roles; 
            return role === 'ADMIN'
            }catch{
                return false
            }
        }
    
        static isUser(){
            const token = localStorage.getItem('token')
            const decodedToken = jwtDecode(token);  // Decodes the JWT
            const role = decodedToken.role; 
            return role === 'USER'
        }
    
        
        static adminOnly(){
            return this.isAuth() && this.isAdmin();
        }

}


export default authservice;