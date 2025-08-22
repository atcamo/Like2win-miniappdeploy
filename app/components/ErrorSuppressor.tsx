'use client';

import { useEffect } from 'react';

export function ErrorSuppressor() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Store original console.error
    const originalError = console.error;

    // Override console.error to filter SVG attribute errors
    console.error = (...args) => {
      const message = args.join(' ');
      
      // Suppress specific SVG attribute errors
      if (
        message.includes('Expected length') ||
        message.includes('attribute width') ||
        message.includes('attribute height') ||
        (message.includes('<svg>') && message.includes('"small"'))
      ) {
        // Silently ignore these specific errors
        return;
      }
      
      // Let other errors through
      originalError.apply(console, args);
    };

    // Cleanup function to restore original console.error
    return () => {
      console.error = originalError;
    };
  }, []);

  return null; // This component doesn't render anything
}