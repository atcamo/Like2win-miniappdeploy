"use client";

import { useState, useEffect } from 'react';
import { 
  MainTitle, 
  Like2WinCard, 
  Like2WinButton, 
  Like2WinLogo
} from '@/app/components/Like2WinComponents';
import { EngagementTracker } from '@/app/components/EngagementTracker';

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
  
  // Mock FID for testing when no Farcaster context is available
  const mockFid = 546204; // Changed to FID with 11 tickets for testing
  const effectiveFid = userContext?.user?.fid || mockFid;

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
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6 pt-8">
        
        {/* Hero Section */}
        <Like2WinCard variant="gradient" className="text-center">
          <div className="space-y-4">
            <MainTitle className="text-3xl">
              ¡Gana $DEGEN con tus Likes!
            </MainTitle>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto">
              La forma más simple de ganar crypto: Follow @Like2Win y participa según tu tipo.<br/>
              • <strong>Con 🎩 DEGEN:</strong> solo like<br/>
              • <strong>Sin 🎩:</strong> like + recast + comment<br/>
              Sorteos bi-semanales de $DEGEN.
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
                <li>• User FID: {userContext?.user?.fid || 'None'}</li>
                <li>• Effective FID (with mock): {effectiveFid}</li>
                <li>• Environment: {process.env.NODE_ENV}</li>
                <li>• Window SDK: {typeof window !== 'undefined' && (window as FarcasterSDKWindow).sdk ? 'Present' : 'Missing'}</li>
                <li>• Is in Frame: {typeof window !== 'undefined' && window.parent !== window ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          </div>
        </Like2WinCard>

        {/* Engagement Tracker with Mock FID */}
        <div className="space-y-6">
          <Like2WinCard variant="info">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">
              🎫 Sistema de Tickets
            </h2>
            <p className="text-blue-700 mb-4">
              Usando FID: {effectiveFid} {!userContext?.user?.fid && '(Mock para testing)'}
            </p>
          </Like2WinCard>

          <EngagementTracker userFid={effectiveFid} />
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-12 bg-amber-400 border-t border-amber-500 py-6 shadow-md">
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