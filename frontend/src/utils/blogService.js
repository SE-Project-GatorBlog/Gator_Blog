// utils/blogService.js
import api from './api';

const BASE_URL = 'http://localhost:8000/api';

const blogService = {
  // Get all blogs, optionally filtered by title
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
      const response = await api.fetch(`${BASE_URL}/blogs/${id}`);
      
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
      
      // Add additional validation to ensure the response contains a blog
      if (!data || !data.blog) {
        throw new Error('Blog data not found in the response');
      }
      
      return data;
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
      // Use the correct endpoint format based on your API
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
  }
};

export default blogService;