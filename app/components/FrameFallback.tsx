"use client";

import React from 'react';
import { Button } from '@/app/components/DemoComponents';
import { LandingIcon } from '@/app/components/LandingComponents';
import { isFrameEnvironment } from '@/app/lib/minikit-config';

interface FrameFallbackProps {
  children: React.ReactNode;
  fallbackContent?: React.ReactNode;
  showFramePrompt?: boolean;
}

/**
 * Component that provides fallback content for non-frame environments
 */
export function FrameFallback({ 
  children, 
  fallbackContent,
  showFramePrompt = true 
}: FrameFallbackProps) {
  const isFrame = isFrameEnvironment();

  // If in frame environment, render children normally
  if (isFrame) {
    return <>{children}</>;
  }

  // If custom fallback provided, use it
  if (fallbackContent) {
    return <>{fallbackContent}</>;
  }

  // Default fallback UI for non-frame environments
  return (
    <div className="min-h-screen bg-[var(--app-background)] flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-8 border border-[var(--app-card-border)]">
          <div className="mb-6">
            <div className="w-20 h-20 bg-[var(--app-accent-light)] rounded-full flex items-center justify-center mx-auto mb-4">
              <LandingIcon name="sparkles" className="text-[var(--app-accent)]" size="xl" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--app-foreground)] mb-2">
              Like2Win Mini App
            </h2>
            <p className="text-[var(--app-foreground-muted)] leading-relaxed">
              This is a Farcaster Mini App designed to run within the Farcaster ecosystem. 
              To experience the full functionality, please access this app through Farcaster.
            </p>
          </div>

          {showFramePrompt && (
            <div className="space-y-4">
              <div className="bg-[var(--app-accent-light)] rounded-lg p-4 border border-[var(--app-accent)]">
                <h3 className="font-semibold text-[var(--app-accent)] mb-2">
                  How to access Like2Win:
                </h3>
                <ol className="text-sm text-[var(--app-accent)] text-left space-y-1">
                  <li>1. Open the Farcaster app</li>
                  <li>2. Search for &quot;Like2Win&quot; or find our frame</li>
                  <li>3. Tap to launch the mini app</li>
                  <li>4. Enjoy the full experience!</li>
                </ol>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="primary"
                  onClick={() => window.open('https://farcaster.xyz', '_blank')}
                  className="flex-1"
                >
                  <LandingIcon name="external-link" size="sm" className="mr-2" />
                  Open Farcaster
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="flex-1"
                >
                  View Landing Page
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-[var(--app-card-border)]">
            <p className="text-xs text-[var(--app-foreground-muted)]">
              Built on Base with MiniKit • A Web3 community platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Specialized fallback for connection issues
 */
interface ConnectionFallbackProps {
  onRetry?: () => void;
  error?: string;
}

export function ConnectionFallback({ onRetry, error }: ConnectionFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LandingIcon name="zap" className="text-yellow-600" size="lg" />
          </div>
          
          <h3 className="text-lg font-semibold text-[var(--app-foreground)] mb-2">
            Connection Issue
          </h3>
          
          <p className="text-[var(--app-foreground-muted)] mb-4">
            {error || "We're having trouble connecting to the Farcaster frame. Please check your connection and try again."}
          </p>

          <div className="space-y-3">
            {onRetry && (
              <Button
                variant="primary"
                onClick={onRetry}
                size="sm"
              >
                Try Again
              </Button>
            )}
            
            <Button
              variant="ghost"
              onClick={() => window.location.reload()}
              size="sm"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading fallback component
 */
export function LoadingFallback() {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[var(--app-accent-light)] border-t-[var(--app-accent)] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[var(--app-foreground-muted)]">
          Initializing frame...
        </p>
      </div>
    </div>
  );
}