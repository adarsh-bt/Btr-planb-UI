import axios from "axios"
import {InvalidTokenError, jwtDecode} from 'jwt-decode';
import { useNavigate } from 'react-router-dom';


class btrservice{
    // static BASE_URL = "http://localhost:8080/useraccess"
    static BASE_URL = "http://localhost:8082/btr-service"

    // adding header token is reamining
    static async btr_lists_data(userid,page = 0, size = 10,filter = '') {

        try {
            var userid = "9d511610-6941-4590-b9e8-f5b7c0eb8888"
            const response = await axios.get(`${btrservice.BASE_URL}/btr-api/zoneslists/${userid}?page=${page}&size=${size}&filter=${filter}`);
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