import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Listings from './pages/Listings';
import { useMockFirebase } from './firebase';
import ListingDetail from './pages/ListingDetail';
import PostListing from './pages/PostListing';
import Questionnaire from './pages/Questionnaire';
import Login from './pages/Login';
import Favorites from './pages/Favorites';
import DebugPage from './pages/DebugPage';
import Profile from './pages/Profile';
import { AuthProvider } from './contexts/AuthContext';
import FirebaseDebugger from './components/FirebaseDebugger';
import './reset.css';
import './index.css';

function App() {
  const [showDebugger, setShowDebugger] = useState(false);

  // Show debugger when pressing Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setShowDebugger(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <div className="content">
            {showDebugger && <FirebaseDebugger />}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/listing/:id" element={<ListingDetail />} />
              <Route path="/post-listing" element={<PostListing />} />
              <Route path="/questionnaire" element={<Questionnaire />} />
              <Route path="/profile" element={<Profile/>} /> 
              <Route path="/login" element={<Login />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/debug" element={<DebugPage />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App; 