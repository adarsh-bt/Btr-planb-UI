import axios from 'axios';
import authservice from 'pages/authentication/services/authservice';
import { useNavigate } from 'react-router-dom';

class approvalservice {
  // static BASE_URL = "http://localhost:8080/useraccess"
  static BASE_URL = 'http://localhost:8080/user-access';
 

    // adding header token is reamining
    static async superadmin_approval() {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${approvalservice.BASE_URL}/super-admin/fetch-all`,
            
            {
            headers: {
                'Authorization': `Bearer ${token}` // Add token in Authorization header
            }
        });
            return  response.data // Return a consistent object on success
        } catch (err) {
            return {
                message: err.response.data.message
            };
        }
    }

    static async itadmin_approval() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${approvalservice.BASE_URL}/it-admin/fetch-all`,
          
          {
          headers: {
              'Authorization': `Bearer ${token}` // Add token in Authorization header
          }
      });
          return  response.data // Return a consistent object on success
      } catch (err) {
          return {
              message: err.response.data.message
          };
      } 
  }

  static async districtadmin_approval() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${approvalservice.BASE_URL}/district-admin/fetch-all`,
        
        {
        headers: {
            'Authorization': `Bearer ${token}` // Add token in Authorization header
        }
    });
        return  response.data // Return a consistent object on success
    } catch (err) {
        return {
            message: err.response.data.message
        };
    } 
}


static async tsoadmin_roleassign() {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${approvalservice.BASE_URL}/tso-admin/fetch-all`,
      
      {
      headers: {
          'Authorization': `Bearer ${token}` // Add token in Authorization header
      }
  });
      return  response.data // Return a consistent object on success
  } catch (err) {
      return {
          message: err.response.data.message
      };
  } 
}

    static async saveSuperadminApproval(payload) {
      console.log("service payload", payload);
      try {
        const token = localStorage.getItem('token');
          const response = await axios.post(
              `${approvalservice.BASE_URL}/super-admin/saveapprovals`,
              payload, // Send payload as the body
              {
                  headers: {
                      'Authorization': `Bearer ${token}` // Ensure token is included
                  }
              }
          );
  
          return response.data; // Return response data on success
      } catch (err) {
          console.log("errrrrr ", err);
          return {
              message: err.response ? err.response.data.message : 'An error occurred',
          }; // Return error message if the API call fails
      }
  }
  
  static async saveItadminApproval(payload) {
    console.log("service payload", payload);
    try {
      const token = localStorage.getItem('token');
        const response = await axios.post(
            `${approvalservice.BASE_URL}/it-admin/saveapprovals`,
            payload, // Send payload as the body
            {
                headers: {
                    'Authorization': `Bearer ${token}` // Ensure token is included
                }
            }
        );

        return response.data; // Return response data on success
    } catch (err) {
        console.log("errrrrr ", err);
        return {
            message: err.response ? err.response.data.message : 'An error occurred',
        }; // Return error message if the API call fails
    }
}

static async saveDisApproval(payload) {
  console.log("service payload", payload);
  try {
    const token = localStorage.getItem('token');
      const response = await axios.post(
          `${approvalservice.BASE_URL}/district-admin/saveapprovals`,
          payload, // Send payload as the body
          {
              headers: {
                  'Authorization': `Bearer ${token}` // Ensure token is included
              }
          }
      );

      return response.data; // Return response data on success
  } catch (err) {
      console.log("errrrrr ", err);
      return {
          message: err.response ? err.response.data.message : 'An error occurred',
      }; // Return error message if the API call fails
  }
}

static async saveTsoRolesAssign(payload) {

  try {
    const token = localStorage.getItem('token');
      const response = await axios.post(
          `${approvalservice.BASE_URL}/tso-admin/saverole`,
          payload, // Send payload as the body
          {
              headers: {
                  'Authorization': `Bearer ${token}` // Ensure token is included
              }
          }
      );

      return response.data; // Return response data on success
  } catch (err) {
      console.log("errrrrr ", err);
      return {
          message: err.response ? err.response.data.message : 'An error occurred',
      }; // Return error message if the API call fails
  }
}


      // roles without schmes

      static async allroles() {
        try {
      
          const response = await axios.get(`${approvalservice.BASE_URL}/api/fetch/roles`);

          return response.data; // Return response data on success
        } catch (err) {
          return {
            message: err.response ? err.response.data.message : 'An error occurred',
          }; // Return error message if the API call fails
        }
      }

      static async allschmes() {
        try {
      
          const response = await axios.get(`${approvalservice.BASE_URL}/api/fetch/schemes`);
          console.log("schmes ",response.data)
          return response.data; // Return response data on success
        } catch (err) {
          return {
            message: err.response ? err.response.data.message : 'An error occurred',
          }; // Return error message if the API call fails
        }
      }

      static async allrolesBySchems(schemeId) {
        try {
          const response = await axios.get(`${approvalservice.BASE_URL}/api/fetch/schemes/${schemeId}/roles`);
          console.log("schmes ",response.data)
          return response.data; // Return response data on success
        } catch (err) {
          return {
            message: err.response ? err.response.data.message : 'An error occurred',
          }; // Return error message if the API call fails
        }
      }
      
      // end

}
export default approvalservice;
