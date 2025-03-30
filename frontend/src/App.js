import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import NewPostPage from './pages/NewPostPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
 return (
   <AuthProvider>
     <Router>
       <Routes>
         <Route path="/" element={<Navigate to="/home" />} />
         <Route path="/home" element={<HomePage />} />
         <Route path="/login" element={<LoginPage />} />
         <Route path="/signup" element={<SignUpPage />} /> 
         <Route path="/forgot-password" element={<ForgotPasswordPage />} />
         <Route path="/dashboard" element={
           <ProtectedRoute>
             <DashboardPage />
           </ProtectedRoute>
         } />
         <Route path="/new-post" element={
           <ProtectedRoute>
             <NewPostPage />
           </ProtectedRoute>
         } />
         <Route path="/profile" element={
           <ProtectedRoute>
             <ProfilePage />
           </ProtectedRoute>
         } />
       </Routes>
     </Router>
   </AuthProvider>
 );
}

export default App;