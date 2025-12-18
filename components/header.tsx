"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./utils/theme-toggle";
import { SettingsProvider } from "./contexts/settingsContext";
import Image from "next/image";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="AuthentiText Logo"
              width={30}
              height={30}
              className="rounded-lg"
            />
            <span className="font-semibold">AuthentiText</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/">
            <Button variant="ghost" className="px-3">
              Home
            </Button>
          </Link>
          <Link href="/analysis">
            <Button variant="ghost" className="px-3">
              Analyzer
            </Button>
          </Link>
          <Link
            href="https://github.com/ambir513/authentiText"
            target="_blank"
            rel="noreferrer"
            className="px-3 text-sm text-muted-foreground hover:text-foreground"
          >
            GitHub
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <SettingsProvider>
            <ThemeToggle />
          </SettingsProvider>
        </div>
      </div>

      {/* Mobile sheet */}
      <div
        className={cn(
          "md:hidden transition-[max-height] overflow-hidden border-b",
          open ? "max-h-64" : "max-h-0"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 pb-4 pt-2 sm:px-6 lg:px-8">
          <div className="grid gap-2">
            <Link href="/" onClick={() => setOpen(false)}>
              <Card className="p-3">Home</Card>
            </Link>
            <Link href="/analysis" onClick={() => setOpen(false)}>
              <Card className="p-3">Analyzer</Card>
            </Link>
            <Link
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              className="p-3 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
