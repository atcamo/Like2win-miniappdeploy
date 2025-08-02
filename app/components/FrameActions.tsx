"use client";

import React, { useState, useCallback } from 'react';
import { useFarcasterFrame } from '@/app/hooks/useFarcasterFrame';
import { Button } from '@/app/components/DemoComponents';
import { LandingIcon } from '@/app/components/LandingComponents';

interface FrameActionsProps {
  showAddFrame?: boolean;
  showNotification?: boolean;
  showProfile?: boolean;
  showClose?: boolean;
  className?: string;
  variant?: 'compact' | 'full';
}

export function FrameActions({
  showAddFrame = true,
  showNotification = true,
  showProfile = true,
  showClose = true,
  className = '',
  variant = 'full'
}: FrameActionsProps) {
  const { frameInfo, frameActions } = useFarcasterFrame();
  const { capabilities, frameAdded, userInfo } = frameInfo;
  const { addFrame, sendNotification, viewProfile, closeFrame } = frameActions;

  const [isAddingFrame, setIsAddingFrame] = useState(false);
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);

  const handleAddFrame = useCallback(async () => {
    if (isAddingFrame || !capabilities.canAddFrame) return;
    
    setIsAddingFrame(true);
    try {
      const result = await addFrame();
      if (result) {
        console.log('Frame added:', result);
      }
    } catch (error) {
      console.error('Failed to add frame:', error);
    }
    setIsAddingFrame(false);
  }, [isAddingFrame, capabilities.canAddFrame, addFrame]);

  const handleSendNotification = useCallback(async () => {
    if (isSendingNotification || !capabilities.canSendNotifications) return;
    
    setIsSendingNotification(true);
    try {
      await sendNotification({
        title: '🎉 Like2Win Notification',
        body: 'Your project is gaining momentum! Check out the latest updates.',
      });
      setNotificationSent(true);
      setTimeout(() => setNotificationSent(false), 3000);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
    setIsSendingNotification(false);
  }, [isSendingNotification, capabilities.canSendNotifications, sendNotification]);

  const handleViewProfile = useCallback(() => {
    if (!capabilities.canViewProfiles) return;
    viewProfile(userInfo?.fid);
  }, [capabilities.canViewProfiles, viewProfile, userInfo?.fid]);

  const handleClose = useCallback(() => {
    closeFrame();
  }, [closeFrame]);

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showAddFrame && capabilities.canAddFrame && !frameAdded && (
          <button
            onClick={handleAddFrame}
            disabled={isAddingFrame}
            className="text-[var(--app-accent)] hover:text-[var(--app-accent-hover)] text-sm font-medium disabled:opacity-50"
            title="Save Frame"
          >
            {isAddingFrame ? '...' : '+'}
          </button>
        )}
        
        {showNotification && capabilities.canSendNotifications && (
          <button
            onClick={handleSendNotification}
            disabled={isSendingNotification}
            className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] text-sm disabled:opacity-50"
            title="Send Notification"
          >
            {notificationSent ? '✓' : '📬'}
          </button>
        )}
        
        {showProfile && capabilities.canViewProfiles && (
          <button
            onClick={handleViewProfile}
            className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] text-sm"
            title="View Profile"
          >
            👤
          </button>
        )}
        
        {showClose && (
          <button
            onClick={handleClose}
            className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] text-sm"
            title="Close Frame"
          >
            ✕
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Add Frame Section */}
      {showAddFrame && capabilities.canAddFrame && !frameAdded && (
        <div className="bg-[var(--app-card-bg)] rounded-lg p-4 border border-[var(--app-card-border)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-[var(--app-foreground)]">
                Save Frame
              </h3>
              <p className="text-xs text-[var(--app-foreground-muted)]">
                Add Like2Win to your mini apps for quick access
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddFrame}
              disabled={isAddingFrame}
            >
              {isAddingFrame ? 'Adding...' : 'Save'}
            </Button>
          </div>
        </div>
      )}

      {/* Frame Added Confirmation */}
      {frameAdded && (
        <div className="bg-[var(--app-accent-light)] rounded-lg p-3 border border-[var(--app-accent)]">
          <div className="flex items-center gap-2">
            <LandingIcon name="sparkles" className="text-[var(--app-accent)]" size="sm" />
            <span className="text-sm text-[var(--app-accent)] font-medium">
              Frame saved! You can now receive notifications.
            </span>
          </div>
        </div>
      )}

      {/* Notification Section */}
      {showNotification && capabilities.canSendNotifications && (
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-[var(--app-foreground)]">
              Test Notifications
            </span>
            <p className="text-xs text-[var(--app-foreground-muted)]">
              Send yourself a test notification
            </p>
          </div>
          <div className="flex items-center gap-2">
            {notificationSent && (
              <span className="text-xs text-green-600">Sent!</span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendNotification}
              disabled={isSendingNotification}
            >
              {isSendingNotification ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      )}

      {/* Profile Section */}
      {showProfile && capabilities.canViewProfiles && userInfo && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {userInfo.pfpUrl && (
              <img
                src={userInfo.pfpUrl}
                alt={userInfo.displayName || userInfo.username}
                className="w-8 h-8 rounded-full"
              />
            )}
            <div>
              <span className="text-sm text-[var(--app-foreground)]">
                {userInfo.displayName || userInfo.username}
              </span>
              <p className="text-xs text-[var(--app-foreground-muted)]">
                FID: {userInfo.fid}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewProfile}
          >
            View Profile
          </Button>
        </div>
      )}

      {/* Close Section */}
      {showClose && (
        <div className="flex justify-center pt-2 border-t border-[var(--app-card-border)]">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-[var(--app-foreground-muted)]"
          >
            Close Frame
          </Button>
        </div>
      )}
    </div>
  );
}