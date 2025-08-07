'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAccount } from 'wagmi';
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
    <header className="sticky top-0 z-50 bg-amber-800 border-b border-amber-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img 
              src="/logo.png" 
              alt="Like2Win Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-semibold text-white">Like2Win</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-amber-200'
                      : 'text-gray-200 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center">
            <Wallet>
              <ConnectWallet className="!px-3 !py-2 !text-sm !font-medium !bg-[var(--app-accent)] !text-white !border-none !rounded-lg hover:!bg-[var(--app-accent-hover)] !transition-colors">
                <Avatar className="h-6 w-6" />
                <Name className="!text-sm !font-medium !max-w-[100px] !truncate" />
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
          </div>

          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-button"
            name="mobile-menu-toggle"
            aria-label="Toggle mobile menu"
            type="button"
            className="md:hidden p-2 rounded-md text-gray-200 hover:text-white hover:bg-amber-700"
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
                      ? 'bg-amber-600 text-white'
                      : 'text-gray-200 hover:text-white hover:bg-amber-700'
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
          
          {/* Mobile Wallet Info */}
          {isConnected && address && (
            <div className="px-3 py-2 border-t border-amber-700">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-200">
                  Conectado: {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}