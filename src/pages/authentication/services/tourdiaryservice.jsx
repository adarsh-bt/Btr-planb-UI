import axios from 'axios';
import mainapi from 'api/mainapi';
import api from 'api/api';


const BASE_URL = mainapi.BASE_URL;
const tourDiaryService = {


  // ✅ Get All Schemes
  async getAllSchemes() {

    try {
      const response = await api.get(
        `${BASE_URL}/tour-diary/api/advanced-tour/getAll`);
      console.log("getAllSchemes response: ", response.data);

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

    try {
      const response = await api.get(
        `${BASE_URL}/tour-diary/api/purposes/active/${schemeId}`);

      return response.data;

    } catch (err) {
      return {
        message:
          err.response?.data?.message ||
          "An error occurred while fetching purposes."
      };
    }
  },
  // Add these methods to your tourdiaryservice.js

  // Get zone dropdown (for Field Inspector & Taluk Level Approver)
  async getZoneDropdown() {
    try {
      const response = await api.get(`${BASE_URL}/user-access/zones/zone_dropdown`);
      return response.data;
    } catch (err) {
      return {
        message: err.response?.data?.message || "An error occurred while fetching zones."
      };
    }
  },

  // Get taluk dropdown (for District Level roles)
  async getTalukDropdown() {
    try {
      const response = await api.get(`${BASE_URL}/user-access/zones/taluk_dropdown`);
      return response.data;
    } catch (err) {
      return {
        message: err.response?.data?.message || "An error occurred while fetching taluks."
      };
    }
  },

  // Get zones by taluk ID (for District Level roles)
  async getZonesByTaluk(talukId) {
    try {
      const response = await api.get(`${BASE_URL}/btr-service/admin-manage/zones/dropdown/Taluk/${talukId}`);
      return response.data;
    } catch (err) {
      return {
        message: err.response?.data?.message || "An error occurred while fetching zones."
      };
    }
  },
  // ✅ Save or Update Advanced Tour
  async saveOrUpdateTour(data) {
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(
        `${BASE_URL}/tour-diary/api/advanced-tour/saveOrUpdate`,
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
        `${BASE_URL}/tour-diary/api/advanced-tour/filter-with-btr`,
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
        `${BASE_URL}/tour-diary/api/advanced-tour/delete/${id}`,
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

  // ✅ Delete Actual Tour
  async deleteActualTour(id) {
    const token = localStorage.getItem('token');

    try {
      const response = await axios.delete(
        `${BASE_URL}/tour-diary/api/advanced-tour/delete/${id}`,
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
          "An error occurred while deleting tour entry."
      };
    }
  },

  async getActiveHalves() {
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(
        `${BASE_URL}/tour-diary/api/advanced-tour/active-halves`,
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
        `${BASE_URL}/tour-diary/api/advanced-tour/validate`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Backend returns strings directly for both success and error cases
      // e.g., "Submitted FirstHalf successfully on time"
      // e.g., "Missing dates: [3, 7, 12]"
      // e.g., "No entries found for given month and year"
      return response.data;

    } catch (err) {
      // Handle validation errors that might come as 400 or other status codes
      if (err.response?.data) {
        // If the error response is a string (like "Missing dates: [1, 3]")
        if (typeof err.response.data === 'string') {
          return err.response.data;
        }
        // If it's an object with message
        if (err.response.data.message) {
          return err.response.data.message;
        }
      }

      // Network errors or other issues
      console.error("Submit error:", err);
      return "An error occurred while submitting. Please try again.";
    }
  },

  // ✅ NEW METHOD: Get admin submission view for a specific user and year
  async getAdminSubmissionView(userId, year) {
    console.log("getAdminSubmissionView called with userId:", userId, "year:", year);

    try {
      const response = await api.get(
        `${BASE_URL}/tour-diary/api/purposes/admin/submission-view`,
        {
          params: {
            userId,
            year
          }
        }
      );
      console.log("getAdminSubmissionView response: ", response.data);
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
        `${BASE_URL}/tour-diary/api/purposes/admin/submission-details`,
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
        `${BASE_URL}/tour-diary/api/purposes/admin/approval`,
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

    try {
      const response = await api.get(
        `${BASE_URL}/tour-diary/api/tour/tours`,
        {
          params: {
            userId: userId,
            month: month,
            year: year
          },

        }
      );
      console.log("dta ", response.data)
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
      const zoneId = localStorage.getItem("activeZone");
      if (zoneId == null || zoneId === undefined) {
        return false
      } // Call getUserRole to ensure the user role is fetched and logged
      const response = await axios.get(
        `${BASE_URL}/btr-service/btr-api/zones/assigned/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("getAssignedZones response:---------  ", response.data);

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


  async getCrops(agriYear) {

    try {

      const yearToUse = agriYear || "2025-2026";
      const response = await api.get(
        `${BASE_URL}/earas-form1-entry/cce-crop-details/cce-crops-selected/fetch-all`,
        {
          params: {
            agriYear: yearToUse,
          },
        }
      );
      if (response.data && response.data.payload) {
        return response.data.payload;
      }
      return response.data;
    } catch (err) {
      console.error("Error fetching crops:", err);
      return [];
    }
  },
  // Add this method to tourDiaryService for updating SYSTEM entries
  async updateSystemTourEntry(data) {
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(
        `${BASE_URL}/tour-diary/api/tour/tour-save`,
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
        `${BASE_URL}/tour-diary/api/tour/tour-saveOrUpdate`,
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

  async getAdvanceTourByDate(userId, date) {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(
        `${BASE_URL}/tour-diary/api/advanced-tour/advance-tour-by-date?userId=${userId}&date=${date}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.error("Error fetching advance tour by date:", err);
      return [];
    }
  },


  getSeasonIdByCurrentMonth(month) {
    const currentMonth = month || (new Date().getMonth() + 1);
    if (currentMonth >= 7 && currentMonth <= 10) {
      return 1; // Season 1: Autumn (July to October)
    } else if (currentMonth === 11 || currentMonth === 12 || currentMonth === 1 || currentMonth === 2) {
      return 2; // Season 2: Winter (November to February)
    } else if (currentMonth >= 3 && currentMonth <= 6) {
      return 3; // Season 3: Summer (March to June)
    }
    return 1;
  },

  async getClusters(zoneId, agriYear, seasonId = null) {
    try {
      const activeSeasonId = seasonId || this.getSeasonIdByCurrentMonth();
      const response = await api.get(
        `${BASE_URL}/earas-form1-entry/form1/cluster-list?zoneId=${zoneId}&seasonId=${activeSeasonId}&agriYear=${agriYear}`
      );
      console.log(`${BASE_URL}/earas-form1-entry/form1/cluster-list?zoneId=${zoneId}&seasonId=${activeSeasonId}&agriYear=${agriYear}`)
      return response.data;
    } catch (err) {
      console.error("Error fetching clusters:", err);
      return [];
    }
  },
  // Add this method to your tourDiaryService object
  async submitFullMonth(userId, month, year, zoneId, submitId = null, isPartialSubmission = false, partialSubmissionRemark = "") {
    const token = localStorage.getItem('token');
    console.log(userId, month, year, zoneId, submitId, isPartialSubmission, partialSubmissionRemark, "submitFullMonth")
    try {
      const response = await axios.post(
        `${BASE_URL}/tour-diary/api/tour/submit/full-month`,
        {
          submissionType: "FULL_MONTH",
          periodType: "FULL_MONTH",
          month: month,
          year: year,
          zoneId: zoneId || null,
          userId: userId,
          submitId: submitId || null,
          isPartialSubmission: Boolean(isPartialSubmission),
          partialSubmissionRemark: isPartialSubmission ? (partialSubmissionRemark || "") : ""
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const responseData = response.data;
      let message = typeof responseData === 'string'
        ? responseData
        : responseData?.message || "Month submitted successfully";

      if (typeof message === 'string') {
        message = message.replace(/\s*using same submission id:\s*\d+/gi, '').replace(/\s*using same submission id.*$/gi, '').trim();
      }

      return {
        data: responseData,
        error: false,
        message: message
      };

    } catch (err) {
      console.error("Error submitting full month:", err);
      return {
        error: true,
        message: err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : err.message) || "Failed to submit month",
        status: err.response?.status
      };
    }
  },


  // Get full year view with month statuses
  async getFullYearView(userId, year) {
    const token = localStorage.getItem('token');
    console.log(year, "fullYearView", userId)
    try {
      const response = await api.get(
        `${BASE_URL}/tour-diary/api/purposes/admin/full-year-view`,
        {
          params: { userId, year },
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
        `${BASE_URL}/tour-diary/api/purposes/admin/full-month-submit`,
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
  },

  async getSubmissionView(userId, year) {
    const token = localStorage.getItem('token');

    try {
      const response = await axios.get(
        `${BASE_URL}/tour-diary/api/purposes/admin/submission-view`,
        {
          params: {
            userId: userId,
            year: year
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching submission view:", error);
      return {
        error: true,
        message: error.response?.data?.message || error.message
      };
    }
  },

  // ✅ Get User Role
  async getUserRole(userId) {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        `${BASE_URL}/user-access/user-profile/user-role/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      return {
        data: response.data,
        error: false
      };
    } catch (err) {
      console.error("Error fetching user role:", err);

      return {
        error: true,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch user role"
      };
    }
  },


  // In tourDiaryService.js
  async saveOrUpdateVerification(payload) {
    console.log("saveOrUpdateVerification payload: ", payload);
    return api.post(`${BASE_URL}/tour-diary/api/purposes/save-or-update-verification`, payload)
      .then(response => {
        if (response.data) {
          return { data: response.data, error: null };
        }
        return { data: null, error: 'No data received' };
      })
      .catch(error => {
        console.error('Verification error:', error);
        return {
          data: null,
          error: error.response?.data || 'Failed to save verification'
        };
      });
  }
};

export default tourDiaryService;