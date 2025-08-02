"use client";

import { useState, useEffect } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';

export default function SimpleMiniAppTest() {
  const [isClient, setIsClient] = useState(false);
  const { setFrameReady, isFrameReady, context } = useMiniKit();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isFrameReady && isClient) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady, isClient]);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h1 className="text-2xl font-bold text-amber-600 mb-4">Like2Win MiniApp</h1>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Frame Status</h2>
              <p>Frame Ready: {isFrameReady ? '✅ Yes' : '❌ No'}</p>
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

            <div className="text-center">
              <div className="text-4xl mb-2">🎫</div>
              <p className="text-gray-600">
                ¡Bienvenido a Like2Win! Sigue @Like2Win y dale like a posts oficiales para participar en sorteos de $DEGEN.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}