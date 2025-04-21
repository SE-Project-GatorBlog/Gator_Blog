import api from './api';

const BASE_URL = 'http://localhost:8000/api';

const blogService = {
  // Original methods remain unchanged
  getAllBlogs: async (titleFilter = '') => {
    try {
      const url = titleFilter 
        ? `${BASE_URL}/blogs?title=${encodeURIComponent(titleFilter)}` 
        : `${BASE_URL}/blogs`;
      
      const response = await api.fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          // Try to parse as JSON
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.msg || 'Failed to fetch blogs';
        } catch (e) {
          // If not valid JSON, use the text directly
          errorMessage = errorText || `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw error;
    }
  },
  
  // Get a single blog by ID
  getBlogById: async (id) => {
    try {
      const response = await api.fetch(`${BASE_URL}/blogs/${id}`, {
        method: 'GET'
      });
      
      // Check if the response is OK
      if (!response.ok) {
        console.error(`Error response from server: ${response.status} ${response.statusText}`);
        
        // Get the response as text first
        const errorText = await response.text();
        let errorMessage;
        
        try {
          // Try to parse as JSON if possible
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.msg || `Failed to fetch blog with ID ${id}`;
        } catch (e) {
          // If not valid JSON, use the text directly
          errorMessage = errorText || `Error ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // The API might return a different structure than expected
      // It might return the blog directly rather than in a "blog" property
      if (!data) {
        throw new Error('No data received from the server');
      }
      
      // Handle different possible response structures
      if (data.blog) {
        return data;
      } else if (data.ID || data.id) {
        // If the API returns the blog object directly
        return { blog: data };
      } else {
        throw new Error('Blog data not found in the response');
      }
    } catch (error) {
      console.error(`Error fetching blog with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new blog
  createBlog: async (blogData) => {
    try {
      const response = await api.fetch(`${BASE_URL}/blogs`, {
        method: 'POST',
        body: JSON.stringify(blogData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          // Try to parse as JSON
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.msg || 'Failed to create blog';
        } catch (e) {
          // If not valid JSON, use the text directly
          errorMessage = errorText || `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  },
  
  // Update an existing blog
  updateBlog: async (id, blogData) => {
    try {
      // Use the correct endpoint format based on your API
      const response = await api.fetch(`${BASE_URL}/blogs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(blogData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          // Try to parse as JSON
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.msg || `Failed to update blog with ID ${id}`;
        } catch (e) {
          // If not valid JSON, use the text directly
          errorMessage = errorText || `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating blog with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a blog
  deleteBlog: async (id) => {
    try {
      const response = await api.fetch(`${BASE_URL}/blogs/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          // Try to parse as JSON
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.msg || `Failed to delete blog with ID ${id}`;
        } catch (e) {
          // If not valid JSON, use the text directly
          errorMessage = errorText || `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error deleting blog with ID ${id}:`, error);
      throw error;
    }
  },

  getComments: async (blogId) => {
    try {
      const response = await api.fetch(`${BASE_URL}/blogs/${blogId}/comments`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          // Try to parse as JSON
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.msg || `Failed to fetch comments for blog ID ${blogId}`;
        } catch (e) {
          // If not valid JSON, use the text directly
          errorMessage = errorText || `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching comments for blog ID ${blogId}:`, error);
      throw error;
    }
  },

  addComment: async (blogId, commentData) => {
    try {
      // Ensure a default user_id of 0 if not provided
      const data = {
        ...commentData,
        user_id: commentData.user_id || 0
      };
      
      const response = await api.fetch(`${BASE_URL}/blogs/${blogId}/comments`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          // Try to parse as JSON
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.msg || `Failed to add comment to blog ID ${blogId}`;
        } catch (e) {
          // If not valid JSON, use the text directly
          errorMessage = errorText || `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error adding comment to blog ID ${blogId}:`, error);
      throw error;
    }
  },

  // Get likes for a blog post
  getLikes: async (blogId) => {
    try {
      // Ensure blogId is valid
      if (!blogId) {
        console.error("Invalid blogId provided to getLikes");
        return [];
      }
      
      const token = localStorage.getItem('token');
      
      // Use plain fetch to have more control
      const response = await fetch(`${BASE_URL}/blogs/${blogId}/likes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });
      
      if (!response.ok) {
        console.error(`Error fetching likes: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      console.log("###");
      console.log(data.likes);
      //const data = response.json();
      console.log(`Fetched ${data.likes} likes for post ${blogId}:`, data);
      return Array.isArray(data) ? data : [data.likes];
    } catch (error) {
      console.error("Error in getLikes:", error);
      return [];
    }
  },

  // Add a like to a blog post - FIXED WITH BETTER ERROR HANDLING
  addLike: async (blogId) => {
    try {
      // Ensure blogId is valid
      if (!blogId) {
        throw new Error("Invalid blogId provided to addLike");
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Authentication token missing. Please log in again.");
      }
      
      console.log(`Sending POST request to add like for blog ID: ${blogId}`);
      
      // Simplified request - no body needed
      const response = await fetch(`${BASE_URL}/blogs/${blogId}/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
        // No body needed as API extracts info from URL and token
      });
      
      console.log(`Like response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const responseText = await response.text();
        console.error(`Error response: ${responseText}`);
        throw new Error(`Failed to add like: ${response.statusText}`);
      }
      
      // Return success
      return { success: true };
    } catch (error) {
      console.error("Error in addLike:", error);
      throw error;
    }
  },

  // Remove a like from a blog post - FIXED
  removeLike: async (blogId) => {
    try {
      // Ensure blogId is valid
      if (!blogId) {
        throw new Error("Invalid blogId provided to removeLike");
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Authentication token missing. Please log in again.");
      }
      
      console.log(`Sending DELETE request for removing like from blog ID: ${blogId}`);
      
      // Use DELETE method to remove the like
      const response = await fetch(`${BASE_URL}/blogs/${blogId}/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });
      
      console.log(`Unlike response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const responseText = await response.text();
        console.error(`Error response: ${responseText}`);
        throw new Error(`Failed to remove like: ${response.statusText}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error in removeLike:", error);
      throw error;
    }
  }
};

export default blogService;