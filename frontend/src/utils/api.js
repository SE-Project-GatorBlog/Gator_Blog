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
    
    if (token) {

      headers['Authorization'] = token;
      headers['Authorisation'] = token;
    }
    
    // Create the request options with default method as GET
    const requestOptions = {
      method: 'GET', // Set default method to GET
      ...options,
      headers,
    };
    
    // For GET requests, remove the body if it exists
    if (requestOptions.method === 'GET' && requestOptions.body) {
      delete requestOptions.body;
    }
    
    // Debug logging
    console.log(`API Request: ${requestOptions.method} ${url}`);
    console.log('Headers:', JSON.stringify(headers, null, 2));

    const response = await fetch(url, requestOptions);
    
    // Debug logging for response
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (response.status === 401) {
      localStorage.removeItem('token');

      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return response;
  }
};

export default api;