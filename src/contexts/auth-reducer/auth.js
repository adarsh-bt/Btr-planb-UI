import {InvalidTokenError, jwtDecode} from 'jwt-decode';
import { useNavigate } from 'react-router-dom';




class auth{

    
          static isAuth(){
            const token = localStorage.getItem('token');
            return token
        }

        static isAdmin(){
            try{

            
            const token = localStorage.getItem('token')
            const decodedToken = jwtDecode(token);  // Decodes the JWT
            const role = decodedToken.roles; 
            return role === 'ROLE_ADMIN'
            }catch{
                return false
            }
        }

        static isUser(){
            const token = localStorage.getItem('token')
            const decodedToken = jwtDecode(token);  // Decodes the JWT
            const role = decodedToken.role; 
            return role === 'ROLE_USER'
        }


        static adminOnly(){
            return this.isAuth() && this.isAdmin();
        }


}
export default auth;  



// // action - state management
// import { REGISTER, LOGIN, LOGOUT } from './actions';

// // initial state
// export const initialState = {
//   isLoggedIn: false,
//   isInitialized: false,
//   user: null
// };

// // ==============================|| AUTH REDUCER ||============================== //

// const auth = (state = initialState, action) => {
//   switch (action.type) {
//     case REGISTER: {
//       const { user } = action.payload;
//       return {
//         ...state,
//         user
//       };
//     }
//     case LOGIN: {
//       const { user } = action.payload;
//       return {
//         ...state,
//         isLoggedIn: true,
//         isInitialized: true,
//         user
//       };
//     }
//     case LOGOUT: {
//       return {
//         ...state,
//         isInitialized: true,
//         isLoggedIn: false,
//         user: null
//       };
//     }
//     default: {
//       return { ...state };
//     }
//   }
// };

// export default auth;
