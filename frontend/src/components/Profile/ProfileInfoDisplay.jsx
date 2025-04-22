import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ProfileInfoDisplay = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState({
    username: 'Loading...',
    email: 'Loading...'
  });

  useEffect(() => {
    console.log("Auth context user data:", user);
    
    // Check if user is available and has required properties
    if (user) {
      const username = user.username || user.name || (user.data && user.data.username);
      const email = user.email || (user.data && user.data.email);
      
      console.log("Setting user data to:", { username, email });
      
      setUserData({
        username,
        email
      });
    } else {
      console.log("User data not available in auth context");
    }
  }, [user]);

  return (
    <div className="w-full">
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center">
            <div className="bg-[#6A7199]/70 text-white font-bold px-6 py-3 rounded-l-lg w-36 flex justify-center items-center">
              Username
            </div>
            <div className="bg-[#FFFFFF]/90 px-6 py-3 rounded-r-lg flex-1 text-[#0021A5] font-medium">
              {userData.username}
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="bg-[#6A7199]/70 text-white font-bold px-6 py-3 rounded-l-lg w-36 flex justify-center items-center">
              Email ID
            </div>
            <div className="bg-[#FFFFFF]/90 px-6 py-3 rounded-r-lg flex-1 text-[#0021A5] font-medium">
              {userData.email}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfoDisplay;