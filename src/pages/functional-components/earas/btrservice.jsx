import axios from "axios"
import {InvalidTokenError, jwtDecode} from 'jwt-decode';
import { useNavigate } from 'react-router-dom';


class btrservice{
    // static BASE_URL = "http://localhost:8080/useraccess"
    static BASE_URL = "http://localhost:8080/user-access"

    // adding header token is reamining
    static async btr_lists_data(userid) {
        try {
            const response = await axios.get(`${btrservice.BASE_URL}/api/zoneslists/${userid}`);
            console.log(response.data)
            return  response.data // Return a consistent object on success
        } catch (err) {
            return {
                message: err.response.data.message
            };
        }
    }

}
export default btrservice;