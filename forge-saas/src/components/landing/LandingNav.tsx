"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-[family-name:var(--font-display)] text-xl font-extrabold">
          <Image src="/logo-mark.png" alt="" width={28} height={28} className="h-7 w-7" priority />
          FORGE
        </Link>
        <div className="hidden items-center gap-7 text-sm text-[var(--text-dim)] sm:flex">
          <a href="#features" className="hover:text-[var(--text)]">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-[var(--text)]">
            How it works
          </a>
          <Link href="/pricing" className="hover:text-[var(--text)]">
            Pricing
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm text-[var(--text-dim)] hover:text-[var(--text)] sm:inline">
            Log in
          </Link>
          <Link href="/signup">
            <Button variant="primary" className="px-4 py-2 text-sm">
              Get started
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
