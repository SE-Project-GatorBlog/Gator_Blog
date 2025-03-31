import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import blogService from '../../utils/blogService';
import defaultGatorImage from '../../assets/images/SignUp_Gator.png'; // Using existing gator image as default

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
  
  // Use useCallback to memoize the fetchUserPosts function
  const fetchUserPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await blogService.getAllBlogs();
      
      // Process blog data
      const formattedPosts = data.blogs ? data.blogs.map(blog => ({
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
        likes: 0, // Placeholder - backend doesn't yet support likes
        comments: 0 // Placeholder - backend doesn't yet support comments
      })) : [];
      
      setUserPosts(formattedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    // In a real app, you would fetch the user's profile data from your backend
    if (user) {
      setUsername(user.username || 'Gator User');
      setEmailId(user.email || 'gator@ufl.edu');
      if (user.profileImage) {
        setProfileImage(user.profileImage);
      }
    }
    
    // Fetch user's posts
    fetchUserPosts();
  }, [user, fetchUserPosts]); // Added fetchUserPosts as a dependency
  
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
        // In a real app, you would upload this to your server
        // uploadProfileImage(file);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleEditPost = (postId) => {
    navigate(`/edit-post/${postId}`);
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
      
      // Remove the deleted post from the local state
      setUserPosts(userPosts.filter(post => post.id !== deleteConfirmation.postId));
      
      // Hide the confirmation dialog
      setDeleteConfirmation({ show: false, postId: null });
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };
  
  // Function to safely render HTML content
  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
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
            <div className="space-y-6">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center">
                  <div className="bg-[#6A7199]/70 text-white font-bold px-6 py-3 rounded-l-lg w-36 flex justify-center items-center">
                    Username
                  </div>
                  <div className="bg-[#FFFFFF]/90 px-6 py-3 rounded-r-lg flex-1">
                    {username}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-[#6A7199]/70 text-white font-bold px-6 py-3 rounded-l-lg w-36 flex justify-center items-center">
                    Email ID
                  </div>
                  <div className="bg-[#FFFFFF]/90 px-6 py-3 rounded-r-lg flex-1">
                    {emailId}
                  </div>
                </div>
              </div>
            </div>
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
        <div className="space-y-6">
          {isLoading ? (
            <div className="bg-white/90 rounded-lg p-6 text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 bg-blue-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-blue-100 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-blue-100 rounded w-1/2"></div>
              </div>
              <p className="mt-4 text-blue-800">Loading your posts...</p>
            </div>
          ) : error ? (
            <div className="bg-white/90 rounded-lg p-6 text-center">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={fetchUserPosts} 
                className="mt-4 bg-[#0021A5] text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          ) : userPosts.length === 0 ? (
            <div className="bg-white/90 rounded-lg p-6 text-center">
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
              <div key={post.id} className="bg-white/90 rounded-lg p-6 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-800 rounded-full"></div>
                  <span className="font-medium">{post.username}</span>
                  <span className="text-gray-500 text-sm">{post.date}</span>
                </div>
                
                <h3 className="text-xl font-bold mb-1">{post.title}</h3>
                <div 
                  className="text-gray-700 mb-4 border-b border-gray-200 pb-4"
                  dangerouslySetInnerHTML={createMarkup(post.content)}
                ></div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <div className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                      Likes: {post.likes}
                    </div>
                    <div className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                      Comments: {post.comments}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="bg-[#0021A5] text-white px-4 py-1 rounded-lg text-sm hover:bg-[#001B8C]"
                      onClick={() => handleEditPost(post.id)}
                    >
                      Edit
                    </button>
                    <button 
                      className="bg-red-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-red-700"
                      onClick={() => handleDeleteClick(post.id)}
                    >
                      Delete
                    </button>
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