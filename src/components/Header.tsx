"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

const links = [
  { href: "/projects", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/lab", label: "Lab" },
  { href: "/lab/resume-match", label: "FitCheck" },
  { href: "/lab/reliability", label: "Reliability" },
];
export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return (
    <header
      className="site-header"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <nav className="shell header-inner" aria-label="Main navigation">
        <Link
          href="/"
          className="wordmark"
          onClick={() => setOpen(false)}
          aria-label="Lalu Kumar — home"
        >
          <span className="monogram">
            lk<span>.</span>
          </span>
          <span>
            Lalu Kumar
            <span className="wordmark-note">Applied AI & engineering</span>
          </span>
        </Link>
        <button
          ref={toggle}
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="main-links"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close −" : "Menu +"}
        </button>
        <div
          id="main-links"
          className={`header-links ${open ? "is-open" : ""}`}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href || (link.href !== "/lab" && pathname.startsWith(`${link.href}/`)) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#contact"
            className="header-contact"
            onClick={() => setOpen(false)}
          >
            Let’s talk <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
