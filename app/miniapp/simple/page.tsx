"use client";

import { useState, useEffect } from 'react';
import { 
  MainTitle, 
  Like2WinCard, 
  Like2WinButton, 
  Like2WinLogo
} from '@/app/components/Like2WinComponents';

// Types for Farcaster context
interface FarcasterUser {
  fid?: number;
  username?: string;
  displayName?: string;
}

interface FarcasterContext {
  user?: FarcasterUser;
}

interface FarcasterSDKWindow extends Window {
  sdk?: {
    actions?: {
      ready?: () => void;
    };
  };
}

interface WindowWithGlobalSDK extends Window {
  sdk?: {
    actions?: {
      ready?: () => void;
    };
  };
}

export default function SimpleLike2WinApp() {
  const [mounted, setMounted] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [userContext, setUserContext] = useState<FarcasterContext | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let retryCount = 0;
    const maxRetries = 50; // 10 seconds max
    let intervalId: NodeJS.Timeout;

    // More aggressive SDK initialization
    const initFarcasterSDK = () => {
      console.log('Initializing Farcaster SDK, attempt:', retryCount + 1);
      
      if (typeof window !== 'undefined') {
        // Try multiple approaches to call ready()
        const sdkWindow = window as FarcasterSDKWindow;
        
        // Method 1: Direct SDK call
        if (sdkWindow.sdk?.actions?.ready) {
          console.log('✅ SDK found via window.sdk');
          sdkWindow.sdk.actions.ready();
          setSdkReady(true);
          if (intervalId) clearInterval(intervalId);
          return true;
        }

        // Method 2: Check for global sdk
        const globalWindow = window as WindowWithGlobalSDK;
        if (globalWindow.sdk?.actions?.ready) {
          console.log('✅ SDK found via global sdk');
          globalWindow.sdk.actions.ready();
          setSdkReady(true);
          if (intervalId) clearInterval(intervalId);
          return true;
        }

        // Method 3: Try parent frame communication
        try {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'FRAME_READY' }, '*');
            console.log('📤 Sent FRAME_READY to parent');
          }
        } catch (error) {
          console.log('No parent frame access:', error);
        }

        // Method 4: Direct call to parent's SDK
        try {
          if (window.parent && window.parent !== window) {
            const parentWindow = window.parent as WindowWithGlobalSDK;
            if (parentWindow.sdk?.actions?.ready) {
              console.log('✅ SDK found in parent frame');
              parentWindow.sdk.actions.ready();
              setSdkReady(true);
              if (intervalId) clearInterval(intervalId);
              return true;
            }
          }
        } catch (error) {
          console.log('Cannot access parent SDK:', error);
        }

        return false;
      }
      return false;
    };

    // Try immediately
    if (!initFarcasterSDK()) {
      // Setup retry interval
      intervalId = setInterval(() => {
        retryCount++;
        console.log(`🔄 Retry ${retryCount}/${maxRetries} - Looking for Farcaster SDK...`);
        
        if (initFarcasterSDK() || retryCount >= maxRetries) {
          clearInterval(intervalId);
          if (retryCount >= maxRetries) {
            console.warn('⚠️ Max retries reached, SDK may not be available');
            // Force ready state to avoid infinite splash
            setSdkReady(true);
          }
        }
      }, 200);
    }

    // Listen for messages from parent frame
    const handleMessage = (event: MessageEvent) => {
      console.log('📨 Received message:', event.data);
      
      if (event.data?.type === 'FARCASTER_USER_CONTEXT') {
        setUserContext(event.data.context);
        console.log('👤 Received user context:', event.data.context);
      }
      
      // Handle SDK ready confirmation
      if (event.data?.type === 'SDK_READY' || event.data?.type === 'FRAME_READY_ACK') {
        console.log('✅ SDK ready confirmed by parent');
        setSdkReady(true);
        if (intervalId) clearInterval(intervalId);
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup
    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('message', handleMessage);
    };
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-amber-700">Loading Like2Win...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 relative overflow-hidden">
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6 pt-20">
        
        {/* Hero Section */}
        <Like2WinCard variant="gradient" className="text-center">
          <div className="space-y-4">
            <div className="text-6xl animate-pulse">🎫</div>
            <MainTitle className="text-3xl">
              ¡Gana $DEGEN con tus Likes!
            </MainTitle>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto">
              La forma más simple de ganar crypto: Follow @Like2Win + Like posts oficiales = 
              participar en sorteos bi-semanales de $DEGEN.
            </p>
            
            <div className="bg-amber-100 border border-amber-300 rounded-lg p-4">
              <p className="text-amber-800 font-semibold mb-3">
                🚀 ¡Bienvenido a Like2Win!
              </p>
              <Like2WinButton 
                variant="gradient" 
                size="lg"
                id="follow-like2win-button"
                name="followLike2Win"
                onClick={() => {
                  window.open('https://warpcast.com/like2win', '_blank');
                }}
              >
                Follow @Like2Win
              </Like2WinButton>
              <p className="text-xs text-amber-700 mt-2">
                Se abrirá en Farcaster para seguir
              </p>
            </div>

            {/* Debug Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-blue-800 mb-2">Debug Info</h3>
              <ul className="text-sm text-blue-600 space-y-1 text-left">
                <li>• Mounted: {mounted ? 'Yes' : 'No'}</li>
                <li>• SDK Ready: {sdkReady ? 'Yes' : 'No'}</li>
                <li>• User Context: {userContext ? 'Available' : 'None'}</li>
                <li>• Environment: {process.env.NODE_ENV}</li>
                <li>• Window SDK: {typeof window !== 'undefined' && (window as FarcasterSDKWindow).sdk ? 'Present' : 'Missing'}</li>
                <li>• Window SDK Actions: {typeof window !== 'undefined' && (window as FarcasterSDKWindow).sdk?.actions ? 'Present' : 'Missing'}</li>
                <li>• Window SDK Ready Fn: {typeof window !== 'undefined' && (window as FarcasterSDKWindow).sdk?.actions?.ready ? 'Present' : 'Missing'}</li>
                <li>• Is in Frame: {typeof window !== 'undefined' && window.parent !== window ? 'Yes' : 'No'}</li>
                <li>• Parent SDK: {typeof window !== 'undefined' && window.parent !== window ? 'Checking...' : 'N/A'}</li>
              </ul>
            </div>
          </div>
        </Like2WinCard>

        {/* How It Works */}
        <Like2WinCard title="🎯 Cómo Funciona" variant="glassmorphism">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-amber-600 flex items-center gap-2">
                <span className="text-2xl">💰</span>
                CON Tip Allowance
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>Follow @Like2Win</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">❤️</span>
                  <span>Like post oficial = +1 ticket automático</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-amber-600 flex items-center gap-2">
                <span className="text-2xl">📢</span>
                SIN Tip Allowance
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>Follow @Like2Win</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-500">❤️💬🔄</span>
                  <span>Like + Comment + Recast = +1 ticket</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg p-4">
            <div className="text-center space-y-2">
              <p><strong>Sorteos:</strong> Miércoles y Domingo 8PM UTC</p>
              <p><strong>Premios:</strong> 60% / 30% / 10% del pool</p>
              <p><strong>Sistema:</strong> Sin wallet connection requerida</p>
            </div>
          </div>
        </Like2WinCard>

      </main>

      {/* Footer */}
      <footer className="mt-12 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 backdrop-blur-lg border-t border-amber-200/30 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Like2WinLogo size="sm" animated={false} />
            <span className="font-semibold text-amber-700">Like2Win</span>
          </div>
          <p className="text-sm text-amber-600 mb-2">
            Donde cada like se convierte en una oportunidad real ✨
          </p>
          <div className="flex justify-center items-center gap-2 text-xs text-amber-600">
            <span>Built on Base</span>
            <span>•</span>
            <span>Powered by Farcaster</span>
            <span>•</span>
            <span>Open Source</span>
          </div>
        </div>
      </footer>
    </div>
  );
}