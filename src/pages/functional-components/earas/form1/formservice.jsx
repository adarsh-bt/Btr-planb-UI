// src/api/FormService.js
import axios from 'axios';
import mainapi from 'api/mainapi';

class FormService {
  static FORM_URL = mainapi.FORM_API;

  // hard‑coded zoneId = 5
  static async fetchAvailableCcePlots() {
    const token  = localStorage.getItem('token');
    const zoneId = 5;

    try {
      const { data } = await axios.post(
        `${FormService.FORM_URL}/earas-form1-entry/available-cce-plot-details/fetch-by-zoneId`,
        { zoneId },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }) // keep only if needed
          }
        }
      );
      return data;                    // ↩︎ { payload, message }
    } catch (err) {
      // re‑throw so caller can decide what to do
      throw new Error(
        err.response?.data?.message ||
        err.message ||
        'Unable to fetch CCE plots'
      );
    }
  }
}

export default FormService;
