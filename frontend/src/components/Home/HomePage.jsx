import React from 'react';
import { useNavigate } from 'react-router-dom';
import gatorImage from '../../assets/images/Home_Gator.png';
import gatorImage1 from '../../assets/images/Gator1.png';
import gatorImage2 from '../../assets/images/Gator2.png';
import gatorImage3 from '../../assets/images/Gator3.png';
import gatorImage4 from '../../assets/images/Gator4.png';
import gatorImage5 from '../../assets/images/Gator5.png';

const HomePage = () => {
  const navigate = useNavigate();

  const handleStartBlogging = () => {
    navigate('/login');
  };

  const handleNavigation = (page) => {
    navigate(`/${page.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FA4616] via-[#0021A5] to-[#FA4616]">
      <nav className="bg-[#0021A5] p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">GATORBLOG</h1>
          <div className="space-x-6">
            <button 
              className="text-white hover:text-blue-200 font-bold"
              onClick={() => handleNavigation('home')}
            >
              HOME
            </button>
            <button 
              className="text-white hover:text-blue-200"
              onClick={() => handleNavigation('dashboard')}
            >
              POSTS
            </button>
            <button 
              className="text-white hover:text-blue-200"
              onClick={() => handleNavigation('profile')}
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
          <h2 className="text-3xl font-bold text-black mb-6">Our Popular Posts</h2>
          <div className="h-48 bg-white/20 rounded-lg"></div>
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