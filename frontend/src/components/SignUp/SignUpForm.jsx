import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gatorImage from '../../assets/images/SignUp_Gator.png';

const SignUpForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    verifyPassword: ''
  });

  const validateForm = () => {
    // Email validation
    if (!formData.email.endsWith('@ufl.edu')) {
      setError('Please use your UF email address (@ufl.edu)');
      return false;
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    if (!usernameRegex.test(formData.username)) {
      setError('Username can only contain letters, numbers, underscores (_) and periods (.)');
      return false;
    }

    // Password validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters long, contain one capital letter and one number');
      return false;
    }

    // Password match validation
    if (formData.password !== formData.verifyPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    const value = e.target.value.trim();
    setError('');
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.statusText === 'error') {
        setError(data.msg);
        return;
      }

      navigate('/login');

    } catch (err) {
      setError('Failed to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FA4616] via-[#0021A5] to-[#FA4616]">
      <div className="w-full max-w-md p-8 rounded-lg">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Sign Up
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative transition-all duration-300 transform hover:scale-102">
              <input
                type="email"
                name="email"
                placeholder="UFL Email Address"
                className="w-full p-3 rounded bg-white border border-[#0021A5]/30 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0021A5] transition-all duration-300"
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative transition-all duration-300 transform hover:scale-102">
              <input
                type="text"
                name="username"
                placeholder="Username"
                className="w-full p-3 rounded bg-white border border-[#0021A5]/30 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0021A5] transition-all duration-300"
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative transition-all duration-300 transform hover:scale-102">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="w-full p-3 rounded bg-white border border-[#0021A5]/30 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0021A5] transition-all duration-300"
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative transition-all duration-300 transform hover:scale-102">
              <input
                type={showVerifyPassword ? "text" : "password"}
                name="verifyPassword"
                placeholder="Verify Password"
                className="w-full p-3 rounded bg-white border border-[#0021A5]/30 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0021A5] transition-all duration-300"
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowVerifyPassword(!showVerifyPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showVerifyPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full p-3 rounded bg-[#FA4616] text-white font-semibold 
              transform transition-all duration-300 hover:bg-[#FF5A2C]
              ${isHovered ? 'scale-105 shadow-lg' : 'scale-100'}
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>

          <div className="text-center">
            <button 
              type="button"
              onClick={() => navigate('/login')}
              className="text-blue-200 hover:text-white text-sm transition-colors duration-200"
            >
              Already have an account? Log In Here
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
              <p className="font-semibold">Hey there!</p>
              <p>So glad you hopped on board!</p>
              <p>Let's dive in, have a blast, and create some amazing writing together!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;