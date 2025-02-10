import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
 return (
   <AuthProvider>
     <Router>
       <Routes>
         <Route path="/" element={<Navigate to="/login" />} />
         <Route path="/login" element={<LoginPage />} />
         <Route path="/signup" element={<SignUpPage />} /> 
         <Route path="/forgot-password" element={<ForgotPasswordPage />} />
         <Route path="/dashboard" element={
           <ProtectedRoute>
             <DashboardPage />
           </ProtectedRoute>
         } />
       </Routes>
     </Router>
   </AuthProvider>
 );
}

export default App;