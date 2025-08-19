'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { 
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
} from '@coinbase/onchainkit/identity';

export function Header() {
  const pathname = usePathname();
  const { isConnected, address } = useAccount();
  
  // Get MiniKit context for Farcaster user info
  const miniKit = useMiniKit();
  const farcasterUser = miniKit?.context?.user;

  const navItems = [
    {
      href: '/',
      label: 'Inicio',
    },
    {
      href: '/miniapp',
      label: 'Participar',
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 to-amber-500 border-b border-amber-600 shadow-lg backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Like2Win Logo" 
              className="w-12 h-12 object-contain drop-shadow-lg"
            />
            <span className="text-2xl font-bold text-white drop-shadow-sm">Like2Win</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors drop-shadow-sm ${
                    isActive
                      ? 'text-yellow-100 font-semibold'
                      : 'text-orange-100 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Profile - Farcaster or Wallet */}
          <div className="flex items-center">
            {farcasterUser ? (
              /* Show Farcaster user info in MiniApp context */
              <div className="flex items-center space-x-3 px-4 py-2 bg-white/15 rounded-xl border border-white/20 backdrop-blur-sm">
                <img 
                  src={farcasterUser.pfpUrl || '/logo.png'} 
                  alt={farcasterUser.displayName || 'User'} 
                  className="w-12 h-12 rounded-full object-cover border-3 border-white/30 shadow-lg ring-2 ring-white/20"
                />
                <div className="hidden sm:block">
                  <p className="text-base font-semibold text-white truncate max-w-[140px] drop-shadow-sm">
                    {farcasterUser.displayName || farcasterUser.username || 'Farcaster User'}
                  </p>
                  <p className="text-sm text-orange-100 font-medium">
                    @{farcasterUser.username || 'user'}
                  </p>
                </div>
              </div>
            ) : (
              /* Fallback to wallet connection for web context */
              <Wallet>
                <ConnectWallet className="!px-4 !py-3 !text-base !font-semibold !bg-white/15 !text-white !border !border-white/20 !rounded-xl hover:!bg-white/25 !transition-all !backdrop-blur-sm">
                  <Avatar className="h-8 w-8" />
                  <Name className="!text-base !font-semibold !max-w-[120px] !truncate" />
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    <Avatar />
                    <Name />
                    <Address className="!text-xs !text-gray-500" />
                  </Identity>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-button"
            name="mobile-menu-toggle"
            aria-label="Toggle mobile menu"
            type="button"
            className="md:hidden p-2 rounded-md text-orange-100 hover:text-white hover:bg-orange-600/50"
            onClick={() => {
              // Toggle mobile menu
              const mobileMenu = document.getElementById('mobile-menu');
              if (mobileMenu) {
                mobileMenu.classList.toggle('hidden');
              }
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div id="mobile-menu" className="hidden md:hidden pb-4">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-orange-600 text-white'
                      : 'text-orange-100 hover:text-white hover:bg-orange-600/50'
                  }`}
                  onClick={() => {
                    // Close mobile menu after clicking
                    const mobileMenu = document.getElementById('mobile-menu');
                    if (mobileMenu) {
                      mobileMenu.classList.add('hidden');
                    }
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          
          {/* Mobile User Info */}
          {(farcasterUser || (isConnected && address)) && (
            <div className="px-3 py-2 border-t border-orange-600/50">
              {farcasterUser ? (
                <div className="flex items-center space-x-4 py-1">
                  <img 
                    src={farcasterUser.pfpUrl || '/logo.png'} 
                    alt={farcasterUser.displayName || 'User'} 
                    className="w-10 h-10 rounded-full object-cover border-2 border-white/30 shadow-md"
                  />
                  <div>
                    <p className="text-base font-semibold text-white">
                      {farcasterUser.displayName || farcasterUser.username || 'Farcaster User'}
                    </p>
                    <p className="text-sm text-orange-100 font-medium">
                      @{farcasterUser.username || 'user'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-orange-100">
                    Conectado: {address!.slice(0, 6)}...{address!.slice(-4)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}