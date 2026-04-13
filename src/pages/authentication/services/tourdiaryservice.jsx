import axios from 'axios';
import mainapi from 'api/mainapi';



const tourDiaryService = {
    DIARY_URL: mainapi.DIARY_API,
    BASE_URL: mainapi.BTR_API,

  // ✅ Get All Schemes
  async getAllSchemes() {
    const token = localStorage.getItem('token');

    try {
      const response = await axios.get(
        `${this.DIARY_URL}/tour-diary/api/advanced-tour/getAll`,
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
async getAdvancedTourByFilter(userId, month, year) {
  const token = localStorage.getItem('token');

  try {
    const response = await axios.get(
      `${this.DIARY_URL}/tour-diary/api/advanced-tour/filter-with-btr`,
      {
        params: {
          userId: userId,
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
  },

async getActiveHalves() {
  const token = localStorage.getItem('token');

  try {
    const response = await axios.put(
      `${this.DIARY_URL}/tour-diary/api/advanced-tour/active-halves`,
      {}, // Empty body as per your API (though you showed a body in the example)
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
        "An error occurred while fetching active halves."
    };
  }
},

// ✅ Submit Tour Half (Validate/Submit)
async submitTourHalf(data) {
  const token = localStorage.getItem('token');

  try {
    const response = await axios.post(
      `${this.DIARY_URL}/tour-diary/api/advanced-tour/validate`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

   
    if (typeof response.data === 'string') {
      return response.data;
    }
    
    // If it's an object with data
    return response.data;

  } catch (err) {
    // If error response has data (like "Missing entries for...")
    if (err.response?.data) {
      // If it's a string error message
      if (typeof err.response.data === 'string') {
        return err.response.data;
      }
      // If it's an object with message
      return err.response.data.message || "Validation failed";
    }
    
    return {
      message: err.message || "An error occurred while submitting."
    };
  }
},

// ✅ NEW METHOD: Get admin submission view for a specific user and year
  async getAdminSubmissionView(userId, year) {
    const token = localStorage.getItem('token');

    try {
      const response = await axios.get(
        `${this.DIARY_URL}/tour-diary/api/purposes/admin/submission-view`,
        {
          params: {
            userId,
            year
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return {
        data: response.data,
        error: false
      };

    } catch (err) {
      return {
        error: true,
        message: err.response?.data?.message || err.message || "Failed to fetch submission data",
        status: err.response?.status
      };
    }
  },

  // Add these methods to your existing tourDiaryService object

// ✅ Get admin submission details for a specific user, year, and month for Advanced tour diary
async getAdminSubmissionDetails(userId, year, month) {
  const token = localStorage.getItem('token');

  try {
    const response = await axios.get(
      `${this.DIARY_URL}/tour-diary/api/purposes/admin/submission-details`,
      {
        params: {
          userId,
          year,
          month
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return {
      data: response.data,
      error: false
    };

  } catch (err) {
    return {
      error: true,
      message: err.response?.data?.message || err.message || "Failed to fetch submission details",
      status: err.response?.status
    };
  }
},

// ✅ Submit admin approval for a submission (first half or second half)
async submitAdminApproval(payload) {
  const token = localStorage.getItem('token');

  try {
    const response = await axios.post(
      `${this.DIARY_URL}/tour-diary/api/purposes/admin/approval`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // If response.data is a string (like "Submission APPROVED successfully")
    if (typeof response.data === 'string') {
      return {
        data: response.data,
        error: false
      };
    }
    
    return {
      data: response.data,
      error: false
    };

  } catch (err) {
    return {
      error: true,
      message: err.response?.data?.message || err.message || "Failed to submit approval",
      status: err.response?.status
    };
  }
},

// Add this method to your tourDiaryService object
async getTourEntries(userId, month, year) {
  const token = localStorage.getItem('token');

  try {
    const response = await axios.get(
      `${this.DIARY_URL}/tour-diary/api/tour/tours`,
      {
        params: {
          userId: userId,
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
    console.error("Error fetching tour entries:", err);
    return {
      message: err.response?.data?.message || "An error occurred while fetching tour entries."
    };
  }
},

// In tourDiaryService.js, update the getAssignedZones method
async getAssignedZones(userId) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        console.error("No token found");
        return { error: true, message: "No authentication token found" };
    }

    try {
        console.log(`Fetching zones for user: ${userId}`);
        const response = await axios.get(
            `${this.BASE_URL}/btr-service/btr-api/zones/assigned/${userId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log("API Response Status:", response.status);
        console.log("API Response Data:", response.data);
        
        // Return the data directly
        return response.data;
        
    } catch (err) {
        console.error("Error in getAssignedZones:", err);
        console.error("Error response:", err.response?.data);
        console.error("Error status:", err.response?.status);
        
        // Return a consistent error format
        return {
            error: true,
            message: err.response?.data?.message || err.message || "Failed to fetch assigned zones",
            status: err.response?.status
        };
    }
},

// Add this method to tourDiaryService for updating SYSTEM entries
async updateSystemTourEntry(data) {
  const token = localStorage.getItem('token');

  try {
    const response = await axios.post(
      `${this.DIARY_URL}/tour-diary/api/tour/tour-save`,
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
    console.error("Error updating system tour entry:", err);
    return {
      message: err.response?.data?.message || "An error occurred while updating tour entry."
    };
  }
},

// Add this method to your tourDiaryService object
async saveOrUpdateManualEntry(data) {
  const token = localStorage.getItem('token');

  try {
    const response = await axios.post(
      `${this.DIARY_URL}/tour-diary/api/tour/tour-saveOrUpdate`,
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
    console.error("Error saving/updating manual entry:", err);
    return {
      message: err.response?.data?.message || "An error occurred while saving manual entry."
    };
  }
},

// Add this method to your tourDiaryService object
async submitFullMonth(userId, month, year, zoneId) {
  const token = localStorage.getItem('token');

  try {
    const response = await axios.post(
      `${this.DIARY_URL}/tour-diary/api/tour/submit/full-month`,
      {
        periodType: "FULL_MONTH",
        month: month,
        year: year,
        zoneId: zoneId,
        userId: userId
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      data: response.data,
      error: false,
      message: response.data.message || "Month submitted successfully"
    };

  } catch (err) {
    console.error("Error submitting full month:", err);
    return {
      error: true,
      message: err.response?.data?.message || err.message || "Failed to submit month",
      status: err.response?.status
    };
  }
},

// Get full year view with month statuses
async getFullYearView(userId, year) {
  const token = localStorage.getItem('token');
  
  try {
    const response = await axios.get(
      `${this.DIARY_URL}/tour-diary/api/purposes/admin/full-year-view`,
      {
        params: { userId, year },
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching full year view:", error);
    return { error: true, message: error.response?.data?.message || error.message };
  }
},

// Approve full month submission
async approveFullMonth(fullMonthId, adminId, adminRemark, adminStatus) {
  const token = localStorage.getItem('token');
  
  try {
    const response = await axios.post(
      `${this.DIARY_URL}/tour-diary/api/purposes/admin/full-month-submit`,
      {
        id: fullMonthId,
        adminId: adminId,
        adminRemark: adminRemark,
        adminStatus: adminStatus
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error approving month:", error);
    return { error: true, message: error.response?.data?.message || error.message };
  }
}

};

export default tourDiaryService;