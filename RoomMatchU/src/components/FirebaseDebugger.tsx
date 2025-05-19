import { useState } from 'react';
import { checkCollection, checkDocument, checkStorageFolder } from '../utils/firebaseDebug';

interface DebugResult {
  data: any;
  error?: string;
}

export default function FirebaseDebugger() {
  const [selectedAction, setSelectedAction] = useState('checkCollection');
  const [collectionName, setCollectionName] = useState('listings');
  const [documentId, setDocumentId] = useState('');
  const [storagePath, setStoragePath] = useState('');
  const [results, setResults] = useState<DebugResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDebug = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      let data;
      switch (selectedAction) {
        case 'checkCollection':
          data = await checkCollection(collectionName);
          break;
        case 'checkDocument':
          data = await checkDocument(collectionName, documentId);
          break;
        case 'checkStorageFolder':
          data = await checkStorageFolder(storagePath);
          break;
        default:
          throw new Error('Invalid action selected');
      }
      
      setResults({ data });
    } catch (error) {
      console.error('Debug error:', error);
      setResults({ 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="firebase-debugger">
      <h2>Firebase Debugger</h2>
      <p>Use this tool to check data in Firebase (should be removed in production)</p>
      
      <div className="debug-controls">
        <div className="debug-form-group">
          <label>
            Debug Action:
            <select 
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
            >
              <option value="checkCollection">Check Collection</option>
              <option value="checkDocument">Check Document</option>
              <option value="checkStorageFolder">Check Storage Folder</option>
            </select>
          </label>
        </div>
        
        {(selectedAction === 'checkCollection' || selectedAction === 'checkDocument') && (
          <div className="debug-form-group">
            <label>
              Collection Name:
              <input 
                type="text" 
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="e.g., listings"
              />
            </label>
          </div>
        )}
        
        {selectedAction === 'checkDocument' && (
          <div className="debug-form-group">
            <label>
              Document ID:
              <input 
                type="text" 
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                placeholder="e.g., abc123"
              />
            </label>
          </div>
        )}
        
        {selectedAction === 'checkStorageFolder' && (
          <div className="debug-form-group">
            <label>
              Storage Path:
              <input 
                type="text" 
                value={storagePath}
                onChange={(e) => setStoragePath(e.target.value)}
                placeholder="e.g., listings/"
              />
            </label>
          </div>
        )}
        
        <button 
          onClick={handleDebug}
          disabled={loading}
          className="debug-button"
        >
          {loading ? 'Running...' : 'Run Debug'}
        </button>
      </div>
      
      {results && (
        <div className="debug-results">
          <h3>Results</h3>
          {results.error ? (
            <div className="error-message">
              Error: {results.error}
            </div>
          ) : (
            <>
              <p>Check browser console for detailed logs</p>
              <pre>{JSON.stringify(results.data, null, 2)}</pre>
            </>
          )}
        </div>
      )}
    </div>
  );
} 