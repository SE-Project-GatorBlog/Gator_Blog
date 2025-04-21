import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import blogService from '../../utils/blogService';
import gatorImage from '../../assets/images/DashboardGator.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, postId: null });
  
  const fetchPosts = useCallback(async (titleFilter = '') => {
    setIsLoading(true);
    try {
      // Use the existing getAllBlogs function which works
      const data = await blogService.getAllBlogs(titleFilter);
      
      // Process blog data
      const formattedPosts = data.blogs ? data.blogs.map(blog => ({
        id: blog.ID || blog.id,
        username: blog.Author || 'Anonymous User',
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
        likes: 0, // Initialize with 0, will be updated
        comments: 0, // Initialize with 0, will be updated
        createdAt: blog.created_at || blog.CreatedAt,
        updatedAt: blog.updated_at || blog.UpdatedAt,
        authorId: blog.user_id || blog.AuthorID,
        isLiked: false // Will be updated later
      })) : [];
      
      // Sort posts by creation date (newest first)
      formattedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // For each post, fetch likes and comments counts
      if (formattedPosts.length > 0) {
        await Promise.all(formattedPosts.map(async (post) => {
          try {
            // Fetch likes for this post
            const likes = await blogService.getLikes(post.id);
            post.likes = likes.length || 0;
            
            // Check if the current user has liked this post
            if (user) {
              post.isLiked = likes.some(like => like.user_id === user.id);
            }
            
            // Fetch comments for this post
            const comments = await blogService.getComments(post.id);
            post.comments = comments.length || 0;
          } catch (err) {
            console.error(`Error fetching interaction data for post ${post.id}:`, err);
            // Don't let errors with individual posts break the entire dashboard
          }
        }));
      }
      
      setPosts(formattedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Fetch posts when component mounts
    fetchPosts();
  }, [fetchPosts]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNewPost = () => {
    navigate('/new-post');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts(searchQuery);
  };

  // Only allow editing if the user is the author of the post
  const handleEditPost = (postId, authorId) => {
    if (user && user.id === authorId) {
      navigate(`/edit-post/${postId}`);
    } else {
      alert("You can only edit your own posts.");
    }
  };
  
  // Only allow deletion if the user is the author of the post
  const handleDeleteClick = (postId, authorId) => {
    if (user && user.id === authorId) {
      setDeleteConfirmation({ show: true, postId });
    } else {
      alert("You can only delete your own posts.");
    }
  };
  
  const handleCancelDelete = () => {
    setDeleteConfirmation({ show: false, postId: null });
  };
  
  const handleConfirmDelete = async () => {
    try {
      await blogService.deleteBlog(deleteConfirmation.postId);
      
      // Remove the deleted post from the local state
      setPosts(posts.filter(post => post.id !== deleteConfirmation.postId));
      
      // Hide the confirmation dialog
      setDeleteConfirmation({ show: false, postId: null });
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };
  
  // Function to handle liking a post
  const handleLike = async (postId, isLiked, e) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    
    try {
      if (isLiked) {
        // Unlike the post
        await blogService.removeLike(postId);
        
        // Update the local state
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              isLiked: false,
              likes: Math.max(0, post.likes - 1)
            };
          }
          return post;
        }));
      } else {
        // Like the post
        await blogService.addLike(postId, {
          user_id: user ? user.id : 0, // Use 0 if no user is logged in
          blog_id: postId
        });
        
        // Update the local state
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              isLiked: true,
              likes: post.likes + 1
            };
          }
          return post;
        }));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      alert('Failed to update like status');
    }
  };

  // Function to safely render HTML content
  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
  };
  
  // Function to create a text preview without HTML tags
  const createPreview = (htmlContent, maxLength = 150) => {
    // Create a temporary div to strip HTML tags
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Truncate the text to maxLength
    if (textContent.length <= maxLength) {
      return textContent;
    }
    
    // Find the last space before maxLength
    const lastSpace = textContent.substring(0, maxLength).lastIndexOf(' ');
    const truncatedText = textContent.substring(0, lastSpace > 0 ? lastSpace : maxLength);
    
    return `${truncatedText}...`;
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
              className="text-white hover:text-blue-200 font-bold"
            >
              ALL POSTS
            </button>
            <button 
              onClick={() => navigate('/profile')} 
              className="text-white hover:text-blue-200"
            >
              MY PROFILE
            </button>
            <button 
              onClick={handleLogout} 
              className="text-white hover:text-red-200"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Search and Gator Image in a horizontal layout with border */}
        <div className="relative mb-5">
          <div className="flex justify-between items-start mx-auto max-w-4xl">
            <div className="relative w-3/4">
              <form onSubmit={handleSearch} className="flex">
                <div className="rounded-lg bg-white/20 backdrop-blur-sm px-5 py-3 text-white font-bold inline-block">
                  SEARCH
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-3/4 ml-2 bg-white/80 rounded-lg p-3 focus:outline-none"
                  placeholder="Search for posts..."
                />
                <button 
                  type="submit"
                  className="ml-2 px-4 py-2 bg-[#0021A5] text-white rounded-lg hover:bg-[#001B8C]"
                >
                  Search
                </button>
              </form>
            </div>
            <div className="w-1/4 flex justify-end">
              <img 
                src={gatorImage}
                alt="Gator mascot"
                className="w-48 h-48 object-contain border-4 border-blue-800 rounded-lg"
              />
            </div>
          </div>
          <div className="border-b border-white/30 w-full mt-6"></div>
        </div>

        {/* Community Feed Header */}
        <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4 text-center">
          <h2 className="text-2xl font-bold text-white">GATORBLOG COMMUNITY FEED</h2>
          <p className="text-white/90">Explore posts from all members of our community</p>
        </div>

        {/* New Post Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handleNewPost}
            className="bg-white/30 backdrop-blur-sm rounded-lg px-6 py-2 text-white font-bold 
            transform transition-all duration-300 hover:scale-105 hover:bg-white/40 shadow-lg"
          >
            NEW POST
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmation.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-[#0021A5] mb-4">Confirm Delete</h3>
              <p className="text-gray-700 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="bg-white/80 rounded-lg p-6 text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 bg-blue-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-blue-100 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-blue-100 rounded w-1/2"></div>
              </div>
              <p className="mt-4 text-blue-800">Loading posts...</p>
            </div>
          ) : error ? (
            <div className="bg-white/80 rounded-lg p-6 text-center">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={() => fetchPosts()} 
                className="mt-4 bg-[#0021A5] text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white/80 rounded-lg p-6 text-center">
              <p className="text-gray-700">No posts found.</p>
              <button
                onClick={handleNewPost}
                className="mt-4 bg-[#0021A5] text-white px-6 py-2 rounded-lg hover:bg-[#001B8C] transition-colors"
              >
                Create the First Post
              </button>
            </div>
          ) : (
            posts.map((post) => (
            <div 
              key={post.id} 
              className="bg-white/90 rounded-lg p-6 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/post/${post.id}`)}>
              <div className="post-content">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-800 rounded-full"></div>
                  <span className="font-medium">{post.username}</span>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm">Created: {post.date}</span>
                    {post.date !== post.updatedDate && 
                      <span className="text-gray-500 text-sm">Updated: {post.updatedDate}</span>
                    }
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-1">{post.title}</h3>
                <div className="text-gray-700 mb-4 border-b border-gray-200 pb-4 line-clamp-3">
                  {createPreview(post.content)}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <button 
                    onClick={(e) => handleLike(post.id, post.isLiked, e)}
                    className={`px-3 py-1 rounded-full text-sm flex items-center ${
                      post.isLiked 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill={post.isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    {post.likes}
                  </button>
                  <div className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                    </svg>
                    {post.comments}
                  </div>
                </div>
                
                {/* Edit and Delete Buttons - only shown if user is the author */}
                {user && user.id === post.authorId && (
                  <div className="flex space-x-2">
                    <button 
                      className="bg-[#0021A5] text-white px-4 py-1 rounded-lg text-sm hover:bg-[#001B8C]"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent onClick
                        handleEditPost(post.id, post.authorId);
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      className="bg-red-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-red-700"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent onClick
                        handleDeleteClick(post.id, post.authorId);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          )))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;