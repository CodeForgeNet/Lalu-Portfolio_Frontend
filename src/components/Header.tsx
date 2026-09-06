"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/projects', label: 'Work' },
    { href: '/about', label: 'About' },
    { href: '/lab', label: 'Lab' },
    { href: 'mailto:connect.lalukumar@gmail.com', label: 'Contact', external: true },
  ];

  return (
    <header className={`sticky top-0 z-50 bg-bg/80 backdrop-blur-md transition-colors duration-300 ${scrolled ? 'border-b border-border' : ''}`}>
      <nav className="max-w-[1200px] mx-auto px-6 md:px-12 flex items-center justify-between h-16">
        <div className="flex items-center">
          <Link href="/" className="group flex items-center gap-2">
            <span className="font-mono font-medium text-text group-hover:text-accent transition-colors">LK·</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : "_self"}
                rel={link.external ? "noopener noreferrer" : ""}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-accent'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          
          <a 
            href="/docs/Lalu_FullStack-AI-Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-mono text-accent border border-accent/30 rounded px-4 py-2 hover:bg-accent/10 transition-colors"
          >
            Download CV ↓
          </a>
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-text hover:text-accent transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-surface border-b border-border shadow-2xl">
          <div className="flex flex-col px-6 py-6 space-y-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  target={link.external ? "_blank" : "_self"}
                  rel={link.external ? "noopener noreferrer" : ""}
                  className={`text-lg font-medium transition-colors ${
                    isActive
                      ? 'text-accent'
                      : 'text-text-muted hover:text-text'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <a 
              href="/docs/Lalu_FullStack-AI-Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center font-mono text-accent border border-accent/30 rounded px-4 py-3 hover:bg-accent/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Download CV ↓
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
