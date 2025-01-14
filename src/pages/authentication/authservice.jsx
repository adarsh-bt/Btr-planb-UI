import axios from "axios"
import {InvalidTokenError, jwtDecode} from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

class authservice{
    static BASE_URL = "http://localhost:8080"

    
    static async login(username, password){
      
        try{
            const response = await axios.post(`${authservice.BASE_URL}/api/login`,{username,password})
         
            return response.data
        }catch(err){
            throw err;
        }
    }
    static async email_verification(username){
      
        try{
            const response = await axios.post(`${authservice.BASE_URL}/api/email_verify`,{username})
         
            return response.data
        }catch(err){
            throw err;
        }
    }

}


export default authservice;