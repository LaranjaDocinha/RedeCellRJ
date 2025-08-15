import axios from 'axios';

let activeRequests = 0;

const startLoading = () => {
  window.dispatchEvent(new Event('start-loading'));
};

const stopLoading = () => {
  window.dispatchEvent(new Event('stop-loading'));
};

const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(
    config => {
      if (activeRequests === 0) {
        startLoading();
      }
      activeRequests++;
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  const responseInterceptor = response => {
    activeRequests--;
    if (activeRequests === 0) {
      stopLoading();
    }
    return response;
  };

  const errorInterceptor = error => {
    activeRequests--;
    if (activeRequests === 0) {
      stopLoading();
    }

    // Check for 401 Unauthorized or 403 Forbidden status
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear any stored token (e.g., from localStorage)
      localStorage.removeItem('authUser'); // Assuming 'authUser' stores the token
      localStorage.removeItem('token'); // Also remove 'token' if it's stored separately

      // Redirect to login page
      window.location.href = '/login'; // Force a full page reload to clear React state
    }

    return Promise.reject(error);
  };

  axios.interceptors.response.use(responseInterceptor, errorInterceptor);
};

export default setupAxiosInterceptors;
