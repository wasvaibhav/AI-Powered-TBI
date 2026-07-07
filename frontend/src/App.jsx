import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import ChatAdvisory from './pages/ChatAdvisory';
import AdvisoryDetail from './pages/AdvisoryDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Loader from './components/Loader';

// Protected Route wrapper component
function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-cream min-h-[80vh] flex items-center justify-center">
        <Loader message="Loading supervisor session..." />
      </div>
    );
  }

  if (!user) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-cream min-h-screen flex flex-col justify-between selection:bg-terracotta/30 selection:text-pine">
          <Navbar />
          <div className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <ChatAdvisory />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/advisories/:id" 
                element={
                  <ProtectedRoute>
                    <AdvisoryDetail />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
