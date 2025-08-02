"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useFarcasterFrame } from '@/app/hooks/useFarcasterFrame';
import { FrameHeader } from '@/app/components/FrameHeader';
import { FrameStatusIndicator } from '@/app/components/FrameStatusIndicator';
import { Button } from '@/app/components/DemoComponents';
import type { FrameEvent } from '@/app/types/minikit';

export default function AdvancedMiniKitExample() {
  const { frameInfo, frameActions, addEventListener } = useFarcasterFrame();
  const { capabilities, userInfo, frameAdded } = frameInfo;
  
  const [events, setEvents] = useState<FrameEvent[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<string[]>([]);
  const [primaryButtonText, setPrimaryButtonText] = useState('Default Action');

  // Event listener example
  useEffect(() => {
    const unsubscribeCallbacks = [
      addEventListener('frame_added', (event) => {
        setEvents(prev => [...prev, event]);
        console.log('Frame added event:', event);
      }),
      
      addEventListener('frame_removed', (event) => {
        setEvents(prev => [...prev, event]);
        console.log('Frame removed event:', event);
      }),
      
      addEventListener('connection_restored', (event) => {
        setEvents(prev => [...prev, event]);
        console.log('Connection restored event:', event);
      }),
      
      addEventListener('error', (event) => {
        setEvents(prev => [...prev, event]);
        console.error('Frame error event:', event);
      }),
    ];

    // Cleanup function
    return () => {
      unsubscribeCallbacks.forEach(cleanup => cleanup());
    };
  }, [addEventListener]);

  // Primary button example
  useEffect(() => {
    if (capabilities.supportsPrimaryButton) {
      frameActions.setPrimaryButton(
        { text: primaryButtonText },
        () => {
          alert(`Primary button "${primaryButtonText}" was clicked!`);
          setPrimaryButtonText(prev => 
            prev === 'Default Action' ? 'Action Clicked!' : 'Default Action'
          );
        }
      );
    }
  }, [primaryButtonText, capabilities.supportsPrimaryButton, frameActions]);

  // Advanced notification example
  const sendAdvancedNotification = useCallback(async () => {
    if (!capabilities.canSendNotifications) {
      alert('Notifications not available - please add the frame first');
      return;
    }

    try {
      const timestamp = new Date().toLocaleTimeString();
      await frameActions.sendNotification({
        title: `🚀 Like2Win Update ${timestamp}`,
        body: `Hey ${userInfo?.displayName || 'there'}! Check out what's new in your favorite projects.`,
      });
      
      setNotificationHistory(prev => [
        ...prev,
        `Notification sent at ${timestamp}`
      ]);
    } catch (error) {
      console.error('Failed to send notification:', error);
      alert('Failed to send notification');
    }
  }, [capabilities.canSendNotifications, frameActions, userInfo]);

  // URL opening example
  const openExternalUrl = useCallback((url: string) => {
    if (!capabilities.canOpenUrls) {
      alert('URL opening not available');
      return;
    }

    frameActions.openUrl(url);
  }, [capabilities.canOpenUrls, frameActions]);

  // Profile viewing example
  const viewUserProfile = useCallback(() => {
    if (!capabilities.canViewProfiles) {
      alert('Profile viewing not available');
      return;
    }

    frameActions.viewProfile(userInfo?.fid);
  }, [capabilities.canViewProfiles, frameActions, userInfo?.fid]);

  return (
    <div className="min-h-screen bg-[var(--app-background)] text-[var(--app-foreground)]">
      <FrameHeader variant="minimal" />
      
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[var(--app-foreground)] mb-2">
              Advanced MiniKit Features
            </h1>
            <p className="text-[var(--app-foreground-muted)]">
              Comprehensive example of MiniKit capabilities
            </p>
            <FrameStatusIndicator showText className="justify-center mt-3" />
          </div>

          {/* User Information */}
          {userInfo && (
            <div className="bg-[var(--app-card-bg)] rounded-lg p-4 border border-[var(--app-card-border)]">
              <h2 className="text-lg font-semibold text-[var(--app-foreground)] mb-3">
                User Information
              </h2>
              <div className="flex items-center gap-3">
                {userInfo.pfpUrl && (
                  <img
                    src={userInfo.pfpUrl}
                    alt={userInfo.displayName || userInfo.username}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium text-[var(--app-foreground)]">
                    {userInfo.displayName || userInfo.username}
                  </p>
                  <p className="text-sm text-[var(--app-foreground-muted)]">
                    FID: {userInfo.fid}
                  </p>
                </div>
                <div className="ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={viewUserProfile}
                    disabled={!capabilities.canViewProfiles}
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Frame Actions */}
          <div className="bg-[var(--app-card-bg)] rounded-lg p-4 border border-[var(--app-card-border)]">
            <h2 className="text-lg font-semibold text-[var(--app-foreground)] mb-3">
              Frame Actions
            </h2>
            
            <div className="grid gap-3">
              {/* Add Frame */}
              {!frameAdded && (
                <div className="flex items-center justify-between p-3 bg-[var(--app-accent-light)] rounded-lg border border-[var(--app-accent)]">
                  <div>
                    <p className="font-medium text-[var(--app-accent)]">Save Frame</p>
                    <p className="text-sm text-[var(--app-accent)]">Add to your mini apps</p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={frameActions.addFrame}
                    disabled={!capabilities.canAddFrame}
                  >
                    Add Frame
                  </Button>
                </div>
              )}

              {/* Notifications */}
              <div className="flex items-center justify-between p-3 bg-[var(--app-gray)] rounded-lg">
                <div>
                  <p className="font-medium text-[var(--app-foreground)]">Notifications</p>
                  <p className="text-sm text-[var(--app-foreground-muted)]">
                    {capabilities.canSendNotifications ? 'Available' : 'Requires frame to be added'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={sendAdvancedNotification}
                  disabled={!capabilities.canSendNotifications}
                >
                  Send Test
                </Button>
              </div>

              {/* External URLs */}
              <div className="flex items-center justify-between p-3 bg-[var(--app-gray)] rounded-lg">
                <div>
                  <p className="font-medium text-[var(--app-foreground)]">External Links</p>
                  <p className="text-sm text-[var(--app-foreground-muted)]">Open external URLs</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openExternalUrl('https://base.org')}
                    disabled={!capabilities.canOpenUrls}
                  >
                    Base
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openExternalUrl('https://farcaster.xyz')}
                    disabled={!capabilities.canOpenUrls}
                  >
                    Farcaster
                  </Button>
                </div>
              </div>

              {/* Primary Button Control */}
              <div className="p-3 bg-[var(--app-gray)] rounded-lg">
                <p className="font-medium text-[var(--app-foreground)] mb-2">Primary Button</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={primaryButtonText}
                    onChange={(e) => setPrimaryButtonText(e.target.value)}
                    className="flex-1 px-3 py-1 text-sm border border-[var(--app-card-border)] rounded bg-[var(--app-background)] text-[var(--app-foreground)]"
                    placeholder="Button text"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => frameActions.clearPrimaryButton()}
                    disabled={!capabilities.supportsPrimaryButton}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Notification History */}
          {notificationHistory.length > 0 && (
            <div className="bg-[var(--app-card-bg)] rounded-lg p-4 border border-[var(--app-card-border)]">
              <h2 className="text-lg font-semibold text-[var(--app-foreground)] mb-3">
                Notification History
              </h2>
              <div className="space-y-2">
                {notificationHistory.map((notification, index) => (
                  <div key={index} className="text-sm text-[var(--app-foreground-muted)] p-2 bg-[var(--app-gray)] rounded">
                    {notification}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Event Log */}
          {events.length > 0 && (
            <div className="bg-[var(--app-card-bg)] rounded-lg p-4 border border-[var(--app-card-border)]">
              <h2 className="text-lg font-semibold text-[var(--app-foreground)] mb-3">
                Frame Events ({events.length})
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {events.slice(-10).map((event, index) => (
                  <div key={index} className="text-xs bg-[var(--app-gray)] p-2 rounded">
                    <div className="font-mono text-[var(--app-accent)]">
                      {event.type}
                    </div>
                    <div className="text-[var(--app-foreground-muted)]">
                      {event.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Close Frame */}
          <div className="text-center pt-4">
            <Button
              variant="ghost"
              onClick={frameActions.closeFrame}
              className="text-[var(--app-foreground-muted)]"
            >
              Close Frame
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}