import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { currentUser, signOutUser } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      // Close user menu
      setShowUserMenu(false);
      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">RoomMatchU</Link>
      </div>
      <div className="navbar-right">
        {currentUser ? (
          <>
            <Link to="/post-listing" className="icon-btn">
              <span className="material-icon">add</span>
            </Link>
            <Link to="/favorites" className="icon-btn">
              <span className="material-icon">favorite</span>
            </Link>
            <Link to="/notifications" className="icon-btn">
              <span className="material-icon">notifications</span>
            </Link>
            <div className="user-profile">
              <button
                className="profile-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="User profile" />
                ) : (
                  <div className="profile-placeholder">
                    {currentUser.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <span>My Profile</span>
              </button>
              {showUserMenu && (
                <div className="user-menu">
                  <Link to="/questionnaire">Questionnaire</Link>
                  <Link to="/profile">View Profile</Link>
                  <Link to="/settings">Settings</Link>

                  <button onClick={handleSignOut}>Sign Out</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button className="sign-in-btn" onClick={handleSignIn}>
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
} 