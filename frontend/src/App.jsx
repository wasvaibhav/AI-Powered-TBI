import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import ChatAdvisory from './pages/ChatAdvisory';
import AdvisoryDetail from './pages/AdvisoryDetail';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <div className="bg-cream min-h-screen flex flex-col justify-between selection:bg-terracotta/30 selection:text-pine">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<ChatAdvisory />} />
            <Route path="/advisories/:id" element={<AdvisoryDetail />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
