import axios from 'axios';
import mainapi from 'api/mainapi';



const tourDiaryService = {
    DIARY_URL: mainapi.DIARY_API,

  // ✅ Get All Schemes
  async getAllSchemes() {
    const token = localStorage.getItem('token');

    try {
      const response = await axios.get(
        `${this.DIARY_URL}/tour-diary/api/schemes/getAll`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;   // modify if your API returns payload inside object

    } catch (err) {
      return {
        message:
          err.response?.data?.message ||
          "An error occurred while fetching schemes."
      };
    }
  },


  // ✅ Get Active Purposes By Scheme ID
  async getActivePurposes(schemeId) {
    const token = localStorage.getItem('token');

    try {
      const response = await axios.get(
        `${this.DIARY_URL}/tour-diary/api/purposes/active/${schemeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;

    } catch (err) {
      return {
        message:
          err.response?.data?.message ||
          "An error occurred while fetching purposes."
      };
    }
  },

  // ✅ Save or Update Advanced Tour
async saveOrUpdateTour(data) {
  const token = localStorage.getItem('token');

  try {
    const response = await axios.post(
      `${this.DIARY_URL}/tour-diary/api/advanced-tour/saveOrUpdate`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;

  } catch (err) {
    return {
      message:
        err.response?.data?.message ||
        "An error occurred while saving tour."
    };
  }
},
// ✅ Get Advanced Tour By Filter (Month + Year)
async getAdvancedTourByFilter(zoneId, month, year) {
  const token = localStorage.getItem('token');

  try {
    const response = await axios.get(
      `${this.DIARY_URL}/tour-diary/api/advanced-tour/filter`,
      {
        params: {
          zoneId: zoneId,
          month: month,
          year: year
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;

  } catch (err) {
    return {
      message:
        err.response?.data?.message ||
        "An error occurred while fetching tour data."
    };
  }
},

// ✅ Delete Advanced Tour
  async deleteAdvancedTour(id) {
    const token = localStorage.getItem('token');

    try {
      const response = await axios.delete(
        `${this.DIARY_URL}/tour-diary/api/advanced-tour/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;

    } catch (err) {
      return {
        message:
          err.response?.data?.message ||
          "An error occurred while deleting tour."
      };
    }
  }
};

export default tourDiaryService;