import { Link, Outlet } from "react-router-dom";
import moonImg from "@/assets/images/moon.png";
import sunImg from "@/assets/images/sun.png";
import logoImg from "@/assets/images/logo.png";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { useAppDispatch } from "@/store";
import { setDark } from "@/store/app";

export function Layout() {
  const { theme, setTheme } = useTheme();
  const [spinning, setSpinning] = useState(false);
  const dispatch = useAppDispatch();

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setSpinning(true);
    setTheme(next);
    const isDark = next === "dark";
    localStorage.setItem("isDark", JSON.stringify(isDark));
    dispatch(setDark(isDark));
    setTimeout(() => setSpinning(false), 500);
  }, [theme, setTheme, dispatch]);

  return (
    <div className="flex h-screen flex-col">
      {/* Light Glass Header */}
      <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50">
        <div className="mx-auto flex h-14 max-w-full items-center justify-between px-4 sm:px-6 gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <img src={logoImg} className="h-6 w-auto" alt="Pocket Tools" />
          </Link>

          {/* Spacer on mobile */}
          <div className="flex-1 sm:hidden" />

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={`h-9 w-9 rounded-full hover:scale-110 active:scale-95 transition-all duration-300 ease-out shrink-0 ${
              spinning ? "animate-spin-once" : ""
            }`}
            aria-label="切换主题"
          >
            <img
              src={theme === "dark" ? sunImg : moonImg}
              alt=""
              className="h-4 w-4 select-none pointer-events-none"
              aria-hidden="true"
            />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
        <div className="mx-auto max-w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
