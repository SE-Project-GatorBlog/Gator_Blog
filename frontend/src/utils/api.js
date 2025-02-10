const api = {
    fetch: async (url, options = {}) => {
      const token = localStorage.getItem('token');
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: token
        };
      }
      return fetch(url, options);
    }
  };
  
  export default api;