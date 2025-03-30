import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    // Fetch posts when component mounts
    fetchPosts();
  }, []);

  const fetchPosts = async (titleFilter = '') => {
    setIsLoading(true);
    try {
      const data = await blogService.getAllBlogs(titleFilter);
      
      // Process blog data
      const formattedPosts = data.blogs ? data.blogs.map(blog => ({
        id: blog.ID,
        username: user?.username || 'User',
        date: new Date(blog.CreatedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        title: blog.Title,
        content: blog.Post, // This is the HTML content
        likes: 0, // Placeholder - backend doesn't yet support likes
        comments: 0 // Placeholder - backend doesn't yet support comments
      })) : [];
      
      setPosts(formattedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

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
              className="text-white hover:text-blue-200 font-bold"
            >
              POSTS
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
              <div className="rounded-lg bg-white/20 backdrop-blur-sm px-5 py-3 text-white font-bold inline-block">
                SEARCH
              </div>
              <form onSubmit={handleSearch} className="flex">
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
                Create Your First Post
              </button>
            </div>
          ) : (
            posts.map((post) => (
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
                
                <div className="flex gap-4">
                  <div className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                    Likes: {post.likes}
                  </div>
                  <div className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                    Comments: {post.comments}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;