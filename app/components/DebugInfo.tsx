'use client';

import { useState, useEffect } from 'react';

export function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const getDebugInfo = () => {
      const info = {
        // Viewport info
        windowInnerHeight: window.innerHeight,
        windowInnerWidth: window.innerWidth,
        documentHeight: document.documentElement.scrollHeight,
        documentClientHeight: document.documentElement.clientHeight,
        
        // Body info
        bodyHeight: document.body.scrollHeight,
        bodyClientHeight: document.body.clientHeight,
        
        // Scroll info
        scrollY: window.scrollY,
        scrollHeight: document.documentElement.scrollHeight - window.innerHeight,
        
        // User agent
        userAgent: navigator.userAgent,
        
        // CSS info
        bodyOverflow: window.getComputedStyle(document.body).overflow,
        htmlOverflow: window.getComputedStyle(document.documentElement).overflow,
        
        // Frame detection
        isInIframe: window !== window.top,
        frameHeight: window !== window.top ? 'In iframe' : 'Not in iframe',
        
        // Current URL
        currentURL: window.location.href,
        pathname: window.location.pathname,
        
        // Screen info
        screenHeight: window.screen.height,
        screenWidth: window.screen.width,
        
        // Additional checks
        timestamp: new Date().toISOString()
      };
      
      setDebugInfo(info);
    };

    getDebugInfo();
    
    // Update on scroll and resize
    const handleUpdate = () => getDebugInfo();
    window.addEventListener('scroll', handleUpdate);
    window.addEventListener('resize', handleUpdate);
    
    return () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    };
  }, []);

  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="fixed top-4 right-4 z-[9999]">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg"
      >
        DEBUG {isVisible ? '❌' : '🔍'}
      </button>
      
      {isVisible && (
        <div className="absolute top-12 right-0 bg-black text-green-400 p-4 rounded-lg max-w-sm max-h-96 overflow-auto text-xs font-mono shadow-2xl border border-green-500">
          <h3 className="text-yellow-400 font-bold mb-2">🐛 DEBUG INFO</h3>
          {Object.entries(debugInfo).map(([key, value]) => (
            <div key={key} className="mb-1">
              <span className="text-cyan-400">{key}:</span>{' '}
              <span className="text-white">{String(value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}