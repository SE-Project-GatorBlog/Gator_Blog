// utils/api.js
const api = {
  fetch: async (url, options = {}) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = token;
    }
    
    // Create the request options
    const requestOptions = {
      ...options,
      headers,
    };
    
    // Make the fetch request
    const response = await fetch(url, requestOptions);
    
    return response;
  }
};

export default api;