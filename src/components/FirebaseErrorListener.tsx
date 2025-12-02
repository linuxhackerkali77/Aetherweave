'use client';

import React, { useEffect, useState } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { X, ClipboardCopy } from 'lucide-react';

export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    const handleError = (e: FirestorePermissionError) => {
      console.error('Caught Firestore Permission Error:', e);
      setError(e);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here to confirm the copy.
  };

  if (!error) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 9999,
        padding: '2rem',
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '14px',
        lineHeight: '1.6',
        overflowY: 'auto',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: '#ff6b6b', fontSize: '1.5rem' }}>Firestore Security Rule Violation</h1>
          <button
            onClick={() => setError(null)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>
        <p style={{ marginTop: '1rem', color: '#ccc' }}>
          The following request was denied by your project's security rules. Review the request details and your rules to resolve the issue.
        </p>

        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ borderBottom: '1px solid #444', paddingBottom: '0.5rem', color: '#54a0ff' }}>Request Details</h2>
          <pre
            style={{
              backgroundColor: '#1e1e1e',
              padding: '1rem',
              borderRadius: '8px',
              marginTop: '1rem',
              position: 'relative',
            }}
          >
             <button
              onClick={() => handleCopy(error.message)}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
                <ClipboardCopy size={16} />
            </button>
            <code>{error.message}</code>
          </pre>
        </div>

        {error.rules && (
             <div style={{ marginTop: '2rem' }}>
                <h2 style={{ borderBottom: '1px solid #444', paddingBottom: '0.5rem', color: '#54a0ff' }}>Relevant Security Rules</h2>
                 <p style={{ color: '#ccc', fontSize: '12px', marginTop: '0.5rem' }}>This is an *example* of what your rules should look like. You'll need to add this to your `firestore.rules` file.</p>
                <pre
                    style={{
                    backgroundColor: '#1e1e1e',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginTop: '1rem',
                    position: 'relative'
                    }}
                >
                    <button
                        onClick={() => handleCopy(error.rules)}
                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                        >
                        <ClipboardCopy size={16} />
                    </button>
                    <code>{error.rules}</code>
                </pre>
            </div>
        )}

      </div>
    </div>
  );
}
