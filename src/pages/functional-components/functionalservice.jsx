import axios from "axios"
import {InvalidTokenError, jwtDecode} from 'jwt-decode';
import { useNavigate } from 'react-router-dom';


class functionalservice{
    // static BASE_URL = "http://localhost:8080/useraccess"
    static BASE_URL = "http://localhost:8080/user-access"

    // adding header token is reamining
    static async user_approvel_list() {
        try {
            const response = await axios.get(`${functionalservice.BASE_URL}/api/user-registration/user/fetch-all`);
           
            return  response.data // Return a consistent object on success
        } catch (err) {
            return {
                message: err.response.data.message
            };
        }
    }


}
export default functionalservice;