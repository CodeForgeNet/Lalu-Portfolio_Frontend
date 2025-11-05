"use client";

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/about', label: 'About' },
    { href: '/projects', label: 'Projects' },
    { href: '/growth', label: 'Growth' },
  ];

  return (
    <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center">
          <Link href="/">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
              <Image
                src="/profile.jpg"
                alt="Lalu Kumar"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </Link>
        </div>
        <div className="hidden sm:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors ${
                  isActive
                    ? 'text-green-300'
                    : 'text-slate-300 hover:text-green-300'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="sm:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white focus:outline-none"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white/10 backdrop-blur-lg py-4">
          <div className="container mx-auto px-4 flex flex-col items-center space-y-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xl transition-colors ${
                    isActive
                      ? 'text-green-300'
                      : 'text-slate-300 hover:text-green-300'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)} // Close menu on link click
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
