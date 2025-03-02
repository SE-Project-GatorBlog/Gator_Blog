import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import gatorImage from '../../assets/images/DashboardGator.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock posts data
  const posts = [
    {
      id: 1,
      username: 'User',
      date: 'March 1, 2025',
      title: 'Name of posts',
      content: 'Contents of post',
      likes: 5,
      comments: 3
    },
    {
      id: 2,
      username: 'User',
      date: 'February 27, 2025',
      title: 'Name of posts',
      content: 'Contents of post',
      likes: 12,
      comments: 7
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNewPost = () => {
    navigate('/new-post');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FA4616] via-[#0021A5] to-[#FA4616]">
      {/* Navigation Bar */}
      <nav className="bg-[#0021A5] p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">GATORBLOG</h1>
          <div className="space-x-6">
            <button className="text-white hover:text-blue-200">HOME</button>
            <button className="text-white hover:text-blue-200">POSTS</button>
            <button className="text-white hover:text-blue-200">MY PROFILE</button>
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
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-3/4 ml-2 bg-white/80 rounded-lg p-3 focus:outline-none"
                placeholder="Search for posts..."
              />
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
        <div className="flex justify-center my-10">
          <button
            onClick={handleNewPost}
            className="bg-white/30 backdrop-blur-sm rounded-lg px-12 py-4 text-white font-bold text-2xl 
            transform transition-all duration-300 hover:scale-105 hover:bg-white/40 shadow-lg"
          >
            NEW POST
          </button>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white/90 rounded-lg p-6 shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-800 rounded-full"></div>
                <span className="font-medium">{post.username}</span>
                <span className="text-gray-500 text-sm">{post.date}</span>
              </div>
              
              <h3 className="text-xl font-bold mb-1">{post.title}</h3>
              <p className="text-gray-700 mb-4 border-b border-gray-200 pb-4">{post.content}</p>
              
              <div className="flex gap-4">
                <div className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                  Likes: {post.likes}
                </div>
                <div className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                  Comments: {post.comments}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;