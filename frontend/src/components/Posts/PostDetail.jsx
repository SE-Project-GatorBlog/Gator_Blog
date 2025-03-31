import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import blogService from '../../utils/blogService';

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        // Fetch the specific post by ID
        const response = await blogService.getBlogById(id);
        
        // Check if the response contains a blog property
        if (response && response.blog) {
          const blog = response.blog;
          
          // Format the post data, handling potential missing fields
          setPost({
            id: blog.ID,
            username: blog.Author || 'Anonymous User', // Fallback if Author is missing
            date: new Date(blog.created_at || blog.CreatedAt).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            updatedDate: new Date(blog.updated_at || blog.UpdatedAt).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            title: blog.Title,
            content: blog.Post,
            likes: blog.Likes || 0, // Default to 0 if Likes is missing
            comments: blog.Comments || 0, // Default to 0 if Comments is missing
            authorId: blog.user_id || blog.AuthorID,
            createdAt: blog.created_at || blog.CreatedAt,
            updatedAt: blog.updated_at || blog.UpdatedAt
          });
        } else {
          setError('Post not found');
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(`Failed to load post: ${err.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPost();
  }, [id]);
  
  // Function to safely render HTML content
  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
  };
  
  const handleBack = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FA4616] via-[#0021A5] to-[#FA4616]">
      {/* Navigation Bar */}
      <nav className="bg-[#0021A5] p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">GATORBLOG</h1>
          <div className="space-x-6">
            <button 
              onClick={() => navigate('/home')} 
              className="text-white hover:text-blue-200"
            >
              HOME
            </button>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="text-white hover:text-blue-200"
            >
              POSTS
            </button>
            <button 
              onClick={() => navigate('/profile')} 
              className="text-white hover:text-blue-200"
            >
              MY PROFILE
            </button>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto p-6">
        <button
          onClick={handleBack}
          className="mb-4 text-white flex items-center"
        >
          <span className="mr-2">←</span> Back to Posts
        </button>
        
        {isLoading ? (
          <div className="bg-white/80 rounded-lg p-6 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 bg-blue-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-blue-100 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-blue-100 rounded w-1/2"></div>
            </div>
            <p className="mt-4 text-blue-800">Loading post...</p>
          </div>
        ) : error ? (
          <div className="bg-white/80 rounded-lg p-6 text-center">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={handleBack} 
              className="mt-4 bg-[#0021A5] text-white px-4 py-2 rounded-lg"
            >
              Return to Dashboard
            </button>
          </div>
        ) : post ? (
          <div className="bg-white/90 rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-800 rounded-full"></div>
              <div className="flex flex-col">
                <span className="font-medium text-lg">{post.username}</span>
                <div>
                  <span className="text-gray-500 text-sm">Created: {post.date}</span>
                  {post.date !== post.updatedDate && 
                    <span className="text-gray-500 text-sm ml-2">Updated: {post.updatedDate}</span>
                  }
                </div>
              </div>
            </div>
            
            <div className="border-b border-gray-300 pb-4 mb-6">
              <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
              <div 
                className="text-gray-700 text-lg prose max-w-none"
                dangerouslySetInnerHTML={createMarkup(post.content)}
              ></div>
            </div>
            
            <div className="flex space-x-4">
              <div className="bg-gray-200 px-4 py-2 rounded-lg">
                Likes: {post.likes}
              </div>
              <div className="bg-gray-200 px-4 py-2 rounded-lg">
                Comments: {post.comments}
              </div>
              
              {/* Edit and Delete Buttons - only shown if user is the author */}
              {user && user.id === post.authorId && (
                <div className="flex space-x-2 ml-auto">
                  <button 
                    className="bg-[#0021A5] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#001B8C]"
                    onClick={() => navigate(`/edit-post/${post.id}`)}
                  >
                    Edit
                  </button>
                  <button 
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this post?')) {
                        // Call delete function and redirect to dashboard
                        blogService.deleteBlog(post.id)
                          .then(() => navigate('/dashboard'))
                          .catch(err => alert('Failed to delete post'));
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white/80 rounded-lg p-6 text-center">
            <p className="text-gray-700">Post not found.</p>
            <button
              onClick={handleBack}
              className="mt-4 bg-[#0021A5] text-white px-6 py-2 rounded-lg hover:bg-[#001B8C] transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetailPage;