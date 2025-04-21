// This file handles the API communication with our backend
// It adds authentication headers when needed and handles common error cases

const api = {
  // Enhanced fetch method that handles authentication and common errors
  fetch: async (url, options = {}) => {
    // Get stored token if it exists
    const token = localStorage.getItem('token');
    
    // Create headers object with content type
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = token;
      headers['Authorisation'] = token;  // Keep both header formats for compatibility
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
    
    try {
      const response = await fetch(url, requestOptions);
      
      // Debug logging for response
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
      // Handle authentication errors
      if (response.status === 401) {
        // Token expired or invalid, clear it
        localStorage.removeItem('token');
        
        // Redirect to login page if not already there
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },
  
  // Helper method for GET requests
  get: async (url) => {
    return api.fetch(url, { method: 'GET' });
  },
  
  // Helper method for POST requests
  post: async (url, data) => {
    return api.fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Helper method for PUT requests
  put: async (url, data) => {
    return api.fetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Helper method for DELETE requests
  delete: async (url) => {
    return api.fetch(url, { method: 'DELETE' });
  }
};

export default api;