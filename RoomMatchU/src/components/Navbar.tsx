import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { currentUser, signOutUser } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        desktopMenuRef.current &&
        !desktopMenuRef.current.contains(target)
      ) {
        setShowUserMenu(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  useEffect(() => {
    setShowUserMenu(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setShowUserMenu(false);
      setMobileMenuOpen(false);
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

      {/* Desktop Nav */}
      <div className="navbar-right desktop-nav">
        {currentUser ? (
          <>
            <Link to="/post-listing" className="icon-btn">
              <span className="material-icon">add</span>
            </Link>
            <Link to="/favorites" className="icon-btn">
              <span className="material-icon">favorite</span>
            </Link>
            <Link to="/questionnaire" className="icon-btn">
              <span className="material-icon">assignment</span>
            </Link>
            <div className="user-profile" ref={desktopMenuRef}>
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
                  <Link to="/profile">View Profile</Link>
                  <Link to="/matches">My Matches</Link>
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

      {/* Mobile Hamburger */}
      <div className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        <span className="material-icon">menu</span>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu" ref={mobileMenuRef}>
          {currentUser ? (
            <>
              <Link to="/post-listing" onClick={() => setMobileMenuOpen(false)}>Post Listing</Link>
              <Link to="/favorites" onClick={() => setMobileMenuOpen(false)}>Favorites</Link>
              <Link to="/questionnaire" onClick={() => setMobileMenuOpen(false)}>Questionnaire</Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>View Profile</Link>
              <Link to="/matches" onClick={() => setMobileMenuOpen(false)}>My Matches</Link>
              <button onClick={handleSignOut}>Sign Out</button>
            </>
          ) : (
            <button className="sign-in-btn" onClick={handleSignIn}>
              Sign In
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
