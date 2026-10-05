"use client";

import { LogOut, Sun, Moon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { logout } = useAuth();
  const [isDark, setIsDark] = useState(true);

  const handleThemeToggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("light", !next);
      return next;
    });
  };

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <h1 className="text-sm font-semibold text-foreground">{title ?? "Ideas Portal"}</h1>

      <div className="flex items-center gap-2">
        <button
          onClick={handleThemeToggle}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => void logout()}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </Button>
      </div>
    </header>
  );
}
