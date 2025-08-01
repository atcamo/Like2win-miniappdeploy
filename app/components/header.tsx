'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';

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
    <header className="sticky top-0 z-50 bg-[var(--app-background)] border-b border-[var(--app-card-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-[var(--app-accent)]">🎫</span>
            <span className="text-xl font-semibold text-[var(--app-foreground)]">Like2Win</span>
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
                      ? 'text-[var(--app-accent)]'
                      : 'text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center">
            <ConnectWallet />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] hover:bg-[var(--app-card-bg)]"
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
                      ? 'bg-[var(--app-accent)] text-white'
                      : 'text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] hover:bg-[var(--app-card-bg)]'
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
            <div className="px-3 py-2 border-t border-[var(--app-card-border)]">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-[var(--app-foreground-muted)]">
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