import React, { useState } from 'react';
import gatorImage from '../../assets/images/SignUp_Gator.png';

const ForgotPassword = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Reset password email requested for:', email);
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#0021A5] to-[#FA4616]">
      <div className="w-full max-w-md p-8 rounded-lg">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Forgot Password
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative transition-all duration-300 transform hover:scale-102">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded bg-[#0021A5]/50 border border-[#FA4616]/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-[#FA4616] transition-all duration-300"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full p-3 rounded bg-[#FA4616] text-white font-semibold 
              transform transition-all duration-300 hover:bg-[#FF5A2C]
              ${isHovered ? 'scale-105 shadow-lg' : 'scale-100'}
              active:scale-95`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Send Email
          </button>

          <div className="text-center">
            <button 
              type="button"
              onClick={navigateToLogin}
              className="text-blue-200 hover:text-white text-sm transition-colors duration-200"
            >
              Back to Login
            </button>
          </div>
        </form>

        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center space-x-4">
            <img 
              src={gatorImage}
              alt="Gator Mascot"
              className="w-24 h-24 object-contain"
            />
            <div className="text-[#0021A5]">
              <p className="font-semibold">Oops!</p>
              <p>Don't worry, we'll help you get back into your account.</p>
              <p>just follow the instructions in your email.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;