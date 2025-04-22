import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import blogService from '../../utils/blogService';
import defaultGatorImage from '../../assets/images/SignUp_Gator.png';
import ProfileInfoDisplay from './ProfileInfoDisplay';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileImage, setProfileImage] = useState(defaultGatorImage);
  const [username, setUsername] = useState('');
  const [emailId, setEmailId] = useState('');
  const fileInputRef = useRef(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, postId: null });
  
  const fetchUserPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await blogService.getAllBlogs();
      
      // Filter only posts from the current user
      const userBlogs = data.blogs ? data.blogs.filter(blog => 
        blog.user_id === user?.id || blog.AuthorID === user?.id
      ) : [];
      
      // Process blog data
      const formattedPosts = userBlogs.map(blog => ({
        id: blog.ID,
        username: user?.username || 'User',
        date: new Date(blog.created_at || blog.CreatedAt).toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        title: blog.Title,
        content: blog.Post, // This is the HTML content
        createdAt: blog.created_at || blog.CreatedAt,
        likes: blog.Likes || 0, 
        comments: blog.Comments || 0,
        authorId: blog.user_id || blog.AuthorID
      }));
      
      // For each post, fetch the current likes and comments count
      await Promise.all(formattedPosts.map(async (post) => {
        try {
          const likes = await blogService.getLikes(post.id);
          post.likesCount = likes.length || 0;
          post.isLiked = likes.some(like => like.user_id === user.id);
          
          const comments = await blogService.getComments(post.id);
          post.commentsCount = comments.length || 0;
        } catch (error) {
          console.error(`Error fetching interactions for post ${post.id}:`, error);
        }
      }));
      
      setUserPosts(formattedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    if (user) {
      setUsername(user.username || 'Gator User');
      setEmailId(user.email || 'gator@ufl.edu');
      if (user.profileImage) {
        setProfileImage(user.profileImage);
      }
    }
    
    // Fetch user's posts
    fetchUserPosts();
  }, [user, fetchUserPosts]); 
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
        // uploadProfileImage(file);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleEditPost = (postId) => {
    navigate(`/edit-post/${postId}`);
  };

  const handleViewPost = (postId) => {
    navigate(`/post/${postId}`);
  };
  
  const handleDeleteClick = (postId) => {
    setDeleteConfirmation({ show: true, postId });
  };
  
  const handleCancelDelete = () => {
    setDeleteConfirmation({ show: false, postId: null });
  };
  
  const handleConfirmDelete = async () => {
    try {
      await blogService.deleteBlog(deleteConfirmation.postId);
    
      setUserPosts(userPosts.filter(post => post.id !== deleteConfirmation.postId));
    
      setDeleteConfirmation({ show: false, postId: null });
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };
  
  const handleLike = async (postId, isLiked, e) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    
    if (!user) {
      alert('Please log in to like posts');
      return;
    }
    
    try {
      if (isLiked) {
        // Unlike the post
        await blogService.removeLike(postId);
        
        // Update the local state
        setUserPosts(userPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              isLiked: false,
              likesCount: Math.max(0, post.likesCount - 1)
            };
          }
          return post;
        }));
      } else {
        // Like the post
        await blogService.addLike(postId, {
          user_id: user.id,
          blog_id: postId
        });
        
        // Update the local state
        setUserPosts(userPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              isLiked: true,
              likesCount: (post.likesCount || 0) + 1
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
              className="text-white hover:text-blue-200"
            >
              ALL POSTS
            </button>
            <button 
              className="text-white hover:text-blue-200 font-bold"
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

      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Profile Image Section */}
          <div className="relative">
            <div 
              className="w-48 h-48 bg-gray-200 rounded-full overflow-hidden cursor-pointer border-4 border-white"
              onClick={handleProfileImageClick}
            >
              <img 
                src={profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <button
              className="absolute bottom-2 left-1/2 transform -translate-x-1/2 
                        bg-white text-[#0021A5] rounded-lg px-4 py-2 font-bold
                        hover:bg-blue-100 transition-colors"
              onClick={handleProfileImageClick}
            >
              Profile
            </button>
          </div>

          {/* Profile Info */}
          <div className="flex-1 w-full md:w-auto">
            <ProfileInfoDisplay />
          </div>
        </div>

        {/* Divider */}
        <div className="border-b border-white/30 w-full my-10"></div>

        {/* My Posts Section */}
        <div className="flex justify-center mb-10">
          <div className="bg-[#6A7199]/70 text-white font-bold px-12 py-4 rounded-lg text-4xl">
            MY POSTS
          </div>
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

        {/* Posts List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-full bg-white/90 rounded-lg p-6 text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 bg-blue-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-blue-100 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-blue-100 rounded w-1/2"></div>
              </div>
              <p className="mt-4 text-blue-800">Loading your posts...</p>
            </div>
          ) : error ? (
            <div className="col-span-full bg-white/90 rounded-lg p-6 text-center">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={fetchUserPosts} 
                className="mt-4 bg-[#0021A5] text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          ) : userPosts.length === 0 ? (
            <div className="col-span-full bg-white/90 rounded-lg p-6 text-center">
              <p className="text-lg text-gray-600">You haven't created any posts yet.</p>
              <button
                onClick={() => navigate('/new-post')}
                className="mt-4 bg-[#0021A5] text-white px-6 py-2 rounded-lg hover:bg-[#001B8C] transition-colors"
              >
                Create Your First Post
              </button>
            </div>
          ) : (
            userPosts.map((post) => (
              <div key={post.id} className="bg-white/90 rounded-lg shadow-md overflow-hidden flex flex-col h-full">
                {/* Post Card Header */}
                <div className="p-4 bg-gray-50 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-800 rounded-full"></div>
                    <span className="font-medium">{post.username}</span>
                    <span className="text-gray-500 text-sm">{post.date}</span>
                  </div>
                </div>
                
                {/* Post Card Content */}
                <div className="p-4 flex-grow">
                  <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {createPreview(post.content)}
                  </p>
                </div>
                
                {/* Post Card Footer */}
                <div className="p-4 bg-gray-50 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <button 
                        onClick={(e) => handleLike(post.id, post.isLiked, e)}
                        className={`px-2 py-1 rounded-full text-xs flex items-center ${
                          post.isLiked 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill={post.isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        {post.likesCount || post.likes || 0}
                      </button>
                      <div className="bg-gray-200 px-2 py-1 rounded-full text-xs flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                        </svg>
                        {post.commentsCount || post.comments || 0}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600"
                        onClick={() => handleViewPost(post.id)}
                      >
                        View
                      </button>
                      <button 
                        className="bg-[#0021A5] text-white px-3 py-1 rounded-lg text-sm hover:bg-[#001B8C]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPost(post.id);
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(post.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* New Post Button */}
        <div className="flex justify-center my-10">
          <button
            onClick={() => navigate('/new-post')}
            className="bg-white/30 backdrop-blur-sm rounded-lg px-12 py-4 text-white font-bold text-2xl 
            transform transition-all duration-300 hover:scale-105 hover:bg-white/40 shadow-lg"
          >
            NEW POST
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;