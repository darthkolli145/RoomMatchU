import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Listings from './pages/Listings';
import PostListing from './pages/PostListing';
import Questionnaire from './pages/Questionnaire';
import Favorites from './pages/Favorites';
import ListingDetail from './pages/ListingDetail';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Matches from './pages/Matches';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/listing/:id" element={<ListingDetail />} />
              <Route path="/post-listing" element={<PostListing />} />
              <Route path="/questionnaire" element={<Questionnaire />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile/>} /> 
              {/* Add more routes as you build additional pages */}
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
