"use client";

import React, { useState } from 'react';
import { useFarcasterFrame } from '@/app/hooks/useFarcasterFrame';
import { FrameActions } from '@/app/components/FrameActions';
import { FrameStatusIndicator } from '@/app/components/FrameStatusIndicator';
import { Button } from '@/app/components/DemoComponents';
import { Home } from '@/app/components/DemoComponents';
import { Features } from '@/app/components/DemoComponents';

export default function EnhancedStarterApp() {
  const { frameInfo, frameActions } = useFarcasterFrame();
  const { isReady, connectionStatus, context, capabilities } = frameInfo;
  const [activeTab, setActiveTab] = useState("home");

  // Primary button example
  React.useEffect(() => {
    if (capabilities.supportsPrimaryButton) {
      frameActions.setPrimaryButton(
        { text: activeTab === "home" ? "Go to Features" : "Go to Home" },
        () => {
          setActiveTab(activeTab === "home" ? "features" : "home");
        }
      );
    }
  }, [activeTab, capabilities.supportsPrimaryButton, frameActions]);

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme">
      <div className="w-full max-w-md mx-auto">
        {/* Enhanced Header with Frame Status */}
        <header className="flex justify-between items-center mb-3 h-16 px-4 bg-[var(--app-card-bg)] border-b border-[var(--app-card-border)]">
          <div className="flex items-center space-x-3">
            <div className="text-lg font-bold text-[var(--app-accent)]">Like2Win</div>
            <FrameStatusIndicator size="sm" />
          </div>
          
          <div className="flex items-center space-x-2">
            <FrameActions variant="compact" />
          </div>
        </header>

        {/* Connection Status Alert */}
        {!isReady && (
          <div className="mx-4 mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
              <span className="text-sm text-yellow-800 dark:text-yellow-200">
                Initializing frame connection...
              </span>
            </div>
          </div>
        )}

        <main className="flex-1 px-4">
          {activeTab === "home" && <Home setActiveTab={setActiveTab} />}
          {activeTab === "features" && <Features setActiveTab={setActiveTab} />}

          {/* Enhanced Frame Info Section */}
          <div className="mt-6 space-y-4">
            <div className="bg-[var(--app-card-bg)] rounded-xl p-4 border border-[var(--app-card-border)]">
              <h3 className="text-lg font-medium text-[var(--app-foreground)] mb-3">
                Frame Information
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--app-foreground-muted)]">Status:</span>
                  <div className="flex items-center gap-2">
                    <FrameStatusIndicator size="sm" />
                    <span className="text-[var(--app-foreground)]">{connectionStatus}</span>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-[var(--app-foreground-muted)]">Frame Ready:</span>
                  <span className="text-[var(--app-foreground)]">
                    {isReady ? 'Yes' : 'No'}
                  </span>
                </div>
                
                {context?.user && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[var(--app-foreground-muted)]">User:</span>
                      <span className="text-[var(--app-foreground)]">
                        {context.user.displayName || context.user.username}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--app-foreground-muted)]">FID:</span>
                      <span className="text-[var(--app-foreground)]">
                        {context.user.fid}
                      </span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between">
                  <span className="text-[var(--app-foreground-muted)]">Frame Added:</span>
                  <span className="text-[var(--app-foreground)]">
                    {frameInfo.frameAdded ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Capabilities Section */}
            <div className="bg-[var(--app-card-bg)] rounded-xl p-4 border border-[var(--app-card-border)]">
              <h3 className="text-lg font-medium text-[var(--app-foreground)] mb-3">
                Available Features
              </h3>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${capabilities.canSendNotifications ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-[var(--app-foreground-muted)]">Notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${capabilities.canOpenUrls ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-[var(--app-foreground-muted)]">Open URLs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${capabilities.canViewProfiles ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-[var(--app-foreground-muted)]">View Profiles</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${capabilities.canAddFrame ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-[var(--app-foreground-muted)]">Add Frame</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${capabilities.hasWalletAccess ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-[var(--app-foreground-muted)]">Wallet Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${capabilities.supportsPrimaryButton ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-[var(--app-foreground-muted)]">Primary Button</span>
                </div>
              </div>
            </div>

            {/* Enhanced Frame Actions */}
            <FrameActions variant="full" />
          </div>
        </main>

        <footer className="mt-6 pt-4 flex justify-center px-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-[var(--ock-text-foreground-muted)] text-xs"
            onClick={() => frameActions.openUrl("https://base.org/builders/minikit")}
          >
            Built on Base with MiniKit
          </Button>
        </footer>
      </div>
    </div>
  );
}