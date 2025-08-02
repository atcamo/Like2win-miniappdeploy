"use client";

import { useState, useEffect } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';

export default function MiniAppTest() {
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { setFrameReady, isFrameReady, context } = useMiniKit();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isFrameReady && isClient) {
      try {
        setFrameReady();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize frame');
      }
    }
  }, [setFrameReady, isFrameReady, isClient]);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading client...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h1 className="text-2xl font-bold text-amber-600 mb-4">Like2Win MiniApp Test</h1>
          
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-800 mb-2">✅ Success</h2>
              <p className="text-green-600">The MiniApp is loading correctly!</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Frame Status</h2>
              <p>Frame Ready: {isFrameReady ? '✅ Yes' : '⏳ Initializing...'}</p>
            </div>

            {context && (
              <div>
                <h2 className="text-lg font-semibold mb-2">User Context</h2>
                <div className="bg-gray-100 rounded-lg p-4">
                  <p><strong>FID:</strong> {context.user?.fid || 'Not available'}</p>
                  <p><strong>Username:</strong> {context.user?.username || 'Not available'}</p>
                  <p><strong>Display Name:</strong> {context.user?.displayName || 'Not available'}</p>
                </div>
              </div>
            )}

            <div className="text-center bg-amber-50 border border-amber-200 rounded-lg p-6">
              <div className="text-4xl mb-2">🎫</div>
              <h3 className="text-xl font-semibold text-amber-800 mb-2">Like2Win</h3>
              <p className="text-amber-700">
                Follow @Like2Win + Like posts = Win $DEGEN!
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Debug Info</h3>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Client Side: {isClient ? 'Loaded' : 'Loading'}</li>
                <li>• Frame Ready: {isFrameReady ? 'Yes' : 'No'}</li>
                <li>• Context Available: {context ? 'Yes' : 'No'}</li>
                <li>• Environment: {process.env.NODE_ENV}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}