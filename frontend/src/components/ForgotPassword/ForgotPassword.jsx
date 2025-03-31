import React, { useState, useEffect } from 'react';
import gatorImage from '../../assets/images/ForgotPassword_Gator.png';

// Base URL for API endpoints
const API_BASE_URL = 'http://localhost:8000/api';

const ForgotPassword = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');

  // Check for stored token on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Function to validate email format
  const isValidEmail = (email) => {
    // Check if email ends with @ufl.edu
    return /^[^\s@]+@ufl\.edu$/.test(email);
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate email format
    if (!isValidEmail(email)) {
      setError('Please enter a valid @ufl.edu email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = token;
      }
      
      const response = await fetch(`${API_BASE_URL}/request-reset-code`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ email }),
      });
      
      // Check for JSON content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please try again later.');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Something went wrong');
      }
      
      setSuccess('Verification code sent! Please check your email.');
      setCurrentStep(2);
    } catch (err) {
      console.error('Request OTP Error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = token;
      }
      
      const response = await fetch(`${API_BASE_URL}/verify-reset-code`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ email: email, code: otp }),
      });
      // console.log(body);
      
      // Check for JSON content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please try again later.');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Invalid or expired code');
      }
      
      setSuccess('Code verified successfully!');
      setCurrentStep(3);
    } catch (err) {
      console.error('Verify OTP Error:', err);
      setError(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password should be at least 8 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = token;
      }
      
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ 
          email, 
          new_password: newPassword 
        }),
      });
      
      // Check for JSON content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please try again later.');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to reset password');
      }
      
      setSuccess('Password reset successful!');
      setCurrentStep(4);
    } catch (err) {
      console.error('Reset Password Error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <form onSubmit={handleRequestOTP} className="space-y-6">
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
              disabled={isLoading}
              className={`w-full p-3 rounded bg-[#FA4616] text-white font-semibold 
                transform transition-all duration-300 hover:bg-[#FF5A2C]
                ${isHovered ? 'scale-105 shadow-lg' : 'scale-100'}
                ${isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        );
      
      case 2:
        return (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="space-y-4">
              <div className="relative transition-all duration-300 transform hover:scale-102">
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-3 rounded bg-[#0021A5]/50 border border-[#FA4616]/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-[#FA4616] transition-all duration-300"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full p-3 rounded bg-[#FA4616] text-white font-semibold 
                transform transition-all duration-300 hover:bg-[#FF5A2C]
                ${isHovered ? 'scale-105 shadow-lg' : 'scale-100'}
                ${isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
            
            <div className="text-center">
              <button 
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  setSuccess('');
                }}
                className="text-blue-200 hover:text-white text-sm transition-colors duration-200"
              >
                Change Email
              </button>
            </div>
          </form>
        );
      
      case 3:
        return (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-4">
              <div className="relative transition-all duration-300 transform hover:scale-102">
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 rounded bg-[#0021A5]/50 border border-[#FA4616]/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-[#FA4616] transition-all duration-300"
                  required
                />
              </div>
              
              <div className="relative transition-all duration-300 transform hover:scale-102">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 rounded bg-[#0021A5]/50 border border-[#FA4616]/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-[#FA4616] transition-all duration-300"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full p-3 rounded bg-[#FA4616] text-white font-semibold 
                transform transition-all duration-300 hover:bg-[#FF5A2C]
                ${isHovered ? 'scale-105 shadow-lg' : 'scale-100'}
                ${isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        );
      
      case 4:
        return (
          <div className="text-center">
            <div className="text-white text-lg mb-4">
              Password reset successful!
            </div>
            <button
              onClick={navigateToLogin}
              className={`w-full p-3 rounded bg-[#FA4616] text-white font-semibold 
                transform transition-all duration-300 hover:bg-[#FF5A2C]
                ${isHovered ? 'scale-105 shadow-lg' : 'scale-100'} active:scale-95`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Back to Login
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderHeading = () => {
    switch (currentStep) {
      case 1: return "Forgot Password";
      case 2: return "Verify Code";
      case 3: return "Create New Password";
      case 4: return "Password Reset";
      default: return "Forgot Password";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#0021A5] to-[#FA4616]">
      <div className="w-full max-w-md p-8 rounded-lg">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          {renderHeading()}
        </h1>
        
        {error && (
          <div className="bg-red-500/80 text-white p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}
        
        {success && currentStep !== 4 && (
          <div className="bg-green-500/80 text-white p-3 rounded mb-4 text-center">
            {success}
          </div>
        )}
        
        {renderStepContent()}
        
        {currentStep !== 4 && (
          <div className="text-center mt-4">
            <button 
              type="button"
              onClick={navigateToLogin}
              className="text-blue-200 hover:text-white text-sm transition-colors duration-200"
            >
              Back to Login
            </button>
          </div>
        )}

        {currentStep !== 4 && (
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
                <p>Just follow the instructions to reset your password.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;