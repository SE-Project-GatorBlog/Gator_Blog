import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gatorImage from '../../assets/images/Home_Gator.png';
import gatorImage1 from '../../assets/images/Gator1.png';
import gatorImage2 from '../../assets/images/Gator2.png';
import gatorImage3 from '../../assets/images/Gator3.png';
import gatorImage4 from '../../assets/images/Gator4.png';
import gatorImage5 from '../../assets/images/Gator5.png';
import blogService from '../../utils/blogService';

const HomePage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch posts when component mounts
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        // Fetch all posts
        const response = await blogService.getAllBlogs();
        
        if (response && response.blogs) {
          // Get the available posts
          const availablePosts = response.blogs;
          
          // Create an array to hold our posts (real + fallback)
          let displayPosts = [];
          
          // Format the available posts
          if (availablePosts.length > 0) {
            const formattedPosts = availablePosts.map(post => ({
              id: post.ID || post.id,
              title: post.Title || post.title || 'Untitled Post',
              content: post.Post || post.post || 'No content available',
              author: post.user_name || 'Gator Blogger',
              createdAt: new Date(post.CreatedAt || post.created_at).toLocaleDateString()
            }));
            
            // Add the available posts to our display posts
            displayPosts = [...formattedPosts];
          }
          
          // If we have fewer than 3 posts, add placeholder posts
          const fallbackPosts = [
            {
              id: 'fallback-1',
              title: 'Welcome to GatorBlog!',
              content: 'This is a platform for UF students to share their thoughts, ideas, and experiences. Start writing today!',
              author: 'Gator Admin',
              createdAt: new Date().toLocaleDateString()
            },
            {
              id: 'fallback-2',
              title: 'How to Get Started with Blogging',
              content: 'Writing your first blog post can be intimidating. Here are some tips to help you get started on your blogging journey.',
              author: 'Gator Admin',
              createdAt: new Date().toLocaleDateString()
            },
            {
              id: 'fallback-3',
              title: 'The Benefits of Sharing Your Knowledge',
              content: 'Blogging is not just about writing; it is about connecting with others and sharing your unique perspective with the world.',
              author: 'Gator Admin',
              createdAt: new Date().toLocaleDateString()
            }
          ];
          
          // Fill in with fallback posts if needed
          while (displayPosts.length < 3) {
            const nextFallbackIndex = displayPosts.length;
            if (nextFallbackIndex < fallbackPosts.length) {
              displayPosts.push(fallbackPosts[nextFallbackIndex]);
            } else {
              break; // Just in case
            }
          }
          
          // Limit to 3 posts
          displayPosts = displayPosts.slice(0, 3);
          
          setPosts(displayPosts);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        // Even if there's an error, we'll show placeholder posts
        const errorFallbackPosts = [
          {
            id: 'fallback-1',
            title: 'Welcome to GatorBlog!',
            content: 'This is a platform for UF students to share their thoughts, ideas, and experiences. Start writing today!',
            author: 'Gator Admin',
            createdAt: new Date().toLocaleDateString()
          },
          {
            id: 'fallback-2',
            title: 'How to Get Started with Blogging',
            content: 'Writing your first blog post can be intimidating. Here are some tips to help you get started on your blogging journey.',
            author: 'Gator Admin',
            createdAt: new Date().toLocaleDateString()
          },
          {
            id: 'fallback-3',
            title: 'The Benefits of Sharing Your Knowledge',
            content: 'Blogging is not just about writing; it is about connecting with others and sharing your unique perspective with the world.',
            author: 'Gator Admin',
            createdAt: new Date().toLocaleDateString()
          }
        ];
        setPosts(errorFallbackPosts);
        setError('Failed to load posts. Showing sample content instead.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  // Create a preview of the content without HTML tags
  const createPreview = (htmlContent, maxLength = 100) => {
    if (!htmlContent) return '';
    
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

  const handleStartBlogging = () => {
    navigate('/login');
  };

  const handleViewPost = (postId) => {
    // If it's a fallback post, navigate to new post creation
    if (postId.startsWith('fallback-')) {
      navigate('/login');
      return;
    }
    navigate(`/post/${postId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FA4616] via-[#0021A5] to-[#FA4616]">
      <nav className="bg-[#0021A5] p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">GATORBLOG</h1>
          <div className="space-x-6">
            <button 
              className="text-white hover:text-blue-200 font-bold"
              onClick={() => navigate('/home')}
            >
              HOME
            </button>
            <button 
              className="text-white hover:text-blue-200"
              onClick={() => navigate('/dashboard')}
            >
              POSTS
            </button>
            <button 
              className="text-white hover:text-blue-200"
              onClick={() => navigate('/profile')}
            >
              MY PROFILE
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-8 flex items-center justify-between">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-black">
              Connecting<br />
              You With<br />
              Your Fellow<br />
              Gators!
            </h2>
            <button
              onClick={handleStartBlogging}
              className="bg-[#0021A5] text-white px-6 py-3 rounded-lg hover:bg-[#001B8C] transition-colors"
            >
              START BLOGGING
            </button>
          </div>
          <img 
            src={gatorImage}
            alt="Gator mascot"
            className="w-64 h-64 object-contain"
          />
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-8">
          <h2 className="text-3xl font-bold text-black mb-6">Featured Posts</h2>
          
          {isLoading ? (
            <div className="h-48 bg-white/20 rounded-lg flex items-center justify-center">
              <div className="text-white">Loading posts...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div 
                  key={post.id} 
                  className="bg-white/90 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleViewPost(post.id)}
                >
                  <h3 className="text-xl font-bold mb-2 text-[#0021A5] line-clamp-2">{post.title}</h3>
                  <p className="text-gray-700 mb-3 line-clamp-3">{createPreview(post.content)}</p>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>By {post.author}</span>
                    <span>{post.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-8">
          <h2 className="text-3xl font-bold text-black mb-6">Writing Your First Blog</h2>
          <div className="space-y-8">
            <div className="flex items-center gap-8">
              <img src={gatorImage1} alt="Step 1" className="w-24 h-24" />
              <p className="text-lg"><span className="font-bold">Step 1:</span> Pick A Topic You Love 💝 - Write About Something That Excites You! If You're Passionate, Your Readers Will Feel It Too.</p>
            </div>
            
            <div className="flex items-center gap-8">
              <p className="text-lg"><span className="font-bold">Step 2:</span> Outline Before You Write 📝 - A Simple Roadmap (Intro, Main Points, Conclusion) Keeps You From Getting Lost Mid-Post.</p>
              <img src={gatorImage2} alt="Step 2" className="w-24 h-24" />
            </div>

            <div className="flex items-center gap-8">
              <img src={gatorImage3} alt="Step 3" className="w-24 h-24" />
              <p className="text-lg"><span className="font-bold">Step 3:</span> Write Like You Talk 💭 - Imagine Chatting With A Friend. Keep It Fun, Natural, And Avoid Sounding Like A Textbook!</p>
            </div>

            <div className="flex items-center gap-8">
              <p className="text-lg"><span className="font-bold">Step 4:</span> Make It Engaging 😊 - Add Images, Memes, And Even A Personal Story To Keep Readers Hooked. Nobody Likes A Boring Wall Of Text!</p>
              <img src={gatorImage4} alt="Step 4" className="w-24 h-24" />
            </div>

            <div className="flex items-center gap-8">
              <img src={gatorImage5} alt="Step 5" className="w-24 h-24" />
              <p className="text-lg"><span className="font-bold">Step 5:</span> Hit Publish & Share! ✍️ - Don't Overthink. Get Your Post Out There, Share It On Social Media, And Keep Writing!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;