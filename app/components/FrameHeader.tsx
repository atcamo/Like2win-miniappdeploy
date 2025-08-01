"use client";

import React from 'react';
import { useFarcasterFrame } from '@/app/hooks/useFarcasterFrame';
import { FrameStatusIndicator } from './FrameStatusIndicator';
import { FrameActions } from './FrameActions';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";

interface FrameHeaderProps {
  showLogo?: boolean;
  showStatus?: boolean;
  showActions?: boolean;
  showWallet?: boolean;
  className?: string;
  variant?: 'full' | 'minimal';
}

export function FrameHeader({
  showLogo = true,
  showStatus = true,
  showActions = true,
  showWallet = true,
  className = '',
  variant = 'full'
}: FrameHeaderProps) {
  const { frameInfo } = useFarcasterFrame();
  const { isReady, connectionStatus } = frameInfo;

  if (variant === 'minimal') {
    return (
      <header className={`flex items-center justify-between p-4 bg-[var(--app-card-bg)] backdrop-blur-md border-b border-[var(--app-card-border)] ${className}`}>
        {showLogo && (
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold text-[var(--app-accent)]">Like2Win</div>
            {showStatus && (
              <FrameStatusIndicator size="sm" />
            )}
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {showActions && (
            <FrameActions variant="compact" />
          )}
          
          {showWallet && (
            <Wallet className="z-10">
              <ConnectWallet className="px-3 py-1 text-sm">
                <Name className="text-inherit" />
              </ConnectWallet>
              <WalletDropdown>
                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                  <Avatar />
                  <Name />
                  <Address />
                  <EthBalance />
                </Identity>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className={`bg-[var(--app-card-bg)] backdrop-blur-md border-b border-[var(--app-card-border)] ${className}`}>
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Status */}
          <div className="flex items-center space-x-4">
            {showLogo && (
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-[var(--app-accent)]">Like2Win</div>
                {!isReady && (
                  <div className="text-xs text-[var(--app-foreground-muted)] animate-pulse">
                    Loading...
                  </div>
                )}
              </div>
            )}
            
            {showStatus && (
              <div className="flex items-center gap-2">
                <FrameStatusIndicator showText size="sm" />
                {connectionStatus === 'failed' && (
                  <button
                    onClick={() => window.location.reload()}
                    className="text-xs text-[var(--app-accent)] hover:underline"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Center - Navigation (optional) */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#projects" className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] transition-colors">
              Projects
            </a>
            <a href="#creators" className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] transition-colors">
              Creators
            </a>
            <a href="#about" className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] transition-colors">
              About
            </a>
          </nav>

          {/* Right side - Actions and Wallet */}
          <div className="flex items-center space-x-4">
            {showActions && (
              <FrameActions variant="compact" />
            )}
            
            {showWallet && (
              <Wallet className="z-10">
                <ConnectWallet className="px-4 py-2">
                  <Name className="text-inherit" />
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    <Avatar />
                    <Name />
                    <Address />
                    <EthBalance />
                  </Identity>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}