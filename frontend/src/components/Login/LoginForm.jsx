import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import gatorImage from '../../assets/images/SignUp_Gator.png';

const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
    };

    const navigateToSignup = () => {
        window.location.href = '/signup';
    };

    const navigateToForgotPassword = () => {
        window.location.href = '/forgot-password';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FA4616] via-[#0021A5] to-[#FA4616]">
            <div className="w-full max-w-md p-8 rounded-lg">
                <h1 className="text-4xl font-bold text-white text-center mb-8">
                    Log In
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative transition-all duration-300 transform hover:scale-102">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email address"
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
                        Log In
                    </button>

                    <div className="text-center space-y-2">
                        <div>
                            <button
                                type="button"
                                onClick={navigateToSignup}
                                className="text-blue-200 hover:text-white text-sm transition-colors duration-200"
                            >
                                New User? Sign Up Here
                            </button>
                        </div>
                        <div>
                            <button
                                type="button"
                                onClick={navigateToForgotPassword}
                                className="text-blue-200 hover:text-white text-sm transition-colors duration-200"
                            >
                                Forgot Password? Click Here
                            </button>
                        </div>
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
                            <p>Look at the superstar who's back!</p>
                            <p>Let's dive back into some amazing writing together!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;