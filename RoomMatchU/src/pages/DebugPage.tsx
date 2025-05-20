import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FirebaseDebugger from '../components/FirebaseDebugger';
import { auth } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export default function DebugPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  
  // Simple authorization check - in a real app, you'd use proper authentication
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Very simple password protection - in production you'd use proper auth
    if (password === 'debug123') {
      setIsAuthorized(true);
    } else {
      alert('Incorrect password');
    }
  };
  
  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="debug-page">
      <div className="debug-header">
        <h1>Firebase Debug Tools</h1>
        <p className="warning">This page is for development purposes only and should not be accessible in production.</p>
        <button onClick={goBack} className="back-button">Back to Home</button>
      </div>
      
      {!isAuthorized ? (
        <div className="auth-container">
          <p>Enter debug password to continue:</p>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Debug password"
            />
            <button type="submit">Verify</button>
          </form>
        </div>
      ) : (
        <>
          <div className="user-info">
            <h2>Current Auth State</h2>
            <div className="auth-state">
              <p><strong>Signed in:</strong> {currentUser ? 'Yes' : 'No'}</p>
              {currentUser && (
                <>
                  <p><strong>User ID:</strong> {currentUser.id}</p>
                  <p><strong>Name:</strong> {currentUser.displayName}</p>
                  <p><strong>Email:</strong> {currentUser.email}</p>
                </>
              )}
            </div>
          </div>
          
          <FirebaseDebugger />
          
          <div className="debug-info">
            <h2>Debug Information</h2>
            <p><strong>Firebase SDK Version:</strong> Check package.json for version</p>
            <p><strong>Environment:</strong> Development</p>
            <h3>Debug Instructions</h3>
            <ul>
              <li>Use the debugger above to check Firebase collections and storage</li>
              <li>Results will be displayed in the console and in the UI</li>
              <li>For authentication issues, try signing out and in again</li>
              <li>Check the browser console for detailed error messages</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
} 