"use client";

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

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
      </nav>
    </header>
  );
}
