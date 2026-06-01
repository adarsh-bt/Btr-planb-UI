import axios from 'axios';
import mainapi from './mainapi';
import Swal from 'sweetalert2';

// ✅ Create instance
const api = axios.create({
  baseURL: mainapi.BASE_URL,
  timeout: 15000,
});

// 🔒 Prevent multiple popups
let isRedirecting = false;

// ================= REQUEST =================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token && !config.skipAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================= RESPONSE =================
api.interceptors.response.use(
  (response) => response,
  async (error) => {

    const status = error.response?.status;


    if (status === 401 && !isRedirecting) {

      isRedirecting = true;

      // ✅ Clear session
      localStorage.clear();

      // ✅ Show SweetAlert (non-blocking style with timer)
      await Swal.fire({
        icon: 'warning',
        title: 'Session Expired',
        text: 'Your session has expired. Please login again.',
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false
      });

      // ✅ Redirect after alert closes
      window.location.href = '/login?expired=true';
    }

    return Promise.reject(error);
  }
);

export default api;