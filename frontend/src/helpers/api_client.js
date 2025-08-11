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
    return Promise.reject(error);
  };

  axios.interceptors.response.use(responseInterceptor, errorInterceptor);
};

export default setupAxiosInterceptors;
