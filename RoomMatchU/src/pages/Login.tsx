import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebase/config';
import { signInWithPopup } from 'firebase/auth';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Sign in with Google
      await signInWithPopup(auth, googleProvider);
      
      // If sign-in is successful, get the return URL from query params or go to home
      const searchParams = new URLSearchParams(window.location.search);
      const returnUrl = searchParams.get('returnUrl') || '/';
      
      // Navigate to the return URL
      navigate(returnUrl);
    } catch (err) {
      console.error('Error signing in with Google:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Sign In to RoomMatchU</h1>
        <p className="login-description">
          Sign in to save your favorite listings, post your own listings, and connect with potential roommates.
        </p>
        
        {error && <div className="login-error">{error}</div>}
        
        <button 
          className="google-signin-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
        
        <div className="login-footer">
          <p>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
} 