"use client";

import { useState, useEffect } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';

// Type for MiniKit hook return value
interface MiniKitHookResult {
  setFrameReady: () => void;
  isFrameReady: boolean;
  context: {
    user?: {
      fid?: number;
      username?: string;
      displayName?: string;
    };
  } | null;
}

// Componente simple de debug para la miniapp
export default function MiniAppDebug() {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initStep, setInitStep] = useState('mounting');

  // Always call useMiniKit at the top level
  const miniKitHook = useMiniKit() as MiniKitHookResult;

  useEffect(() => {
    setMounted(true);
    setInitStep('mounted');
  }, []);

  useEffect(() => {
    if (mounted) {
      try {
        setInitStep('minikit-initialized');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize MiniKit');
        setInitStep('minikit-error');
      }
    }
  }, [mounted]);

  useEffect(() => {
    if (mounted && miniKitHook && !miniKitHook.isFrameReady) {
      try {
        setInitStep('setting-frame-ready');
        miniKitHook.setFrameReady();
        setInitStep('frame-ready-set');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to set frame ready');
        setInitStep('frame-ready-error');
      }
    }
  }, [mounted, miniKitHook]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Initializing MiniApp...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="max-w-md bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-4">❌ Error</h2>
          <div className="space-y-2">
            <p className="text-red-700 font-medium">Initialization failed at step: {initStep}</p>
            <div className="bg-red-100 border border-red-200 rounded p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { isFrameReady, context } = miniKitHook || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
          <h1 className="text-2xl font-bold text-amber-600 mb-4">🎫 Like2Win MiniApp</h1>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-green-800 mb-2">✅ Success!</h3>
            <p className="text-green-600">MiniApp loaded successfully!</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700">Mounted</p>
                <p className="text-lg">{mounted ? '✅' : '❌'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700">Frame Ready</p>
                <p className="text-lg">{isFrameReady ? '✅' : '⏳'}</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Debug Steps</h3>
              <p className="text-sm text-blue-600">Current step: <code>{initStep}</code></p>
            </div>

            {context && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-800 mb-2">👤 User Context</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>FID:</strong> {context.user?.fid || 'Not available'}</p>
                  <p><strong>Username:</strong> {context.user?.username || 'Not available'}</p>
                  <p><strong>Display Name:</strong> {context.user?.displayName || 'Not available'}</p>
                </div>
              </div>
            )}

            <div className="text-center bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg p-6">
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="text-xl font-semibold text-amber-800 mb-2">Like2Win</h3>
              <p className="text-amber-700">
                Follow @Like2Win + Like posts = Win $DEGEN!
              </p>
              <p className="text-sm text-amber-600 mt-2">
                Zero friction, maximum fun 🚀
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}