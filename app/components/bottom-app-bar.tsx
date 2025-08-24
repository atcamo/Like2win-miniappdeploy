'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function BottomAppBar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      href: '/miniapp',
      label: 'Like2Win',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-amber-600 to-orange-500 border-t border-amber-400 md:hidden z-50 shadow-xl backdrop-blur-sm">
      <div className="flex justify-center items-center h-16 gap-4 px-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center px-6 py-2 rounded-lg transition-all duration-200 min-w-[120px] ${
                isActive
                  ? 'text-yellow-100 bg-white/20 scale-105 shadow-lg'
                  : 'text-orange-100 hover:text-white hover:bg-white/10 hover:scale-105'
              }`}
            >
              <div className="mb-1">{item.icon}</div>
              <span className="text-xs font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}