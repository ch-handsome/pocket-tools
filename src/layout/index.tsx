import { Link, Outlet } from "react-router-dom";
import moonImg from "@/assets/images/moon.png";
import sunImg from "@/assets/images/sun.png";
import logoImg from "@/assets/images/logo.png";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";

export function Layout() {
  const { theme, setTheme } = useTheme();
  const [spinning, setSpinning] = useState(false);

  const toggleTheme = useCallback(() => {
    setSpinning(true);
    setTheme(theme === "dark" ? "light" : "dark");
    setTimeout(() => setSpinning(false), 500);
  }, [theme, setTheme]);

  return (
    <div className="flex h-screen flex-col">
      {/* Glass Header */}
      <header className="glass-header sticky top-0 z-50">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src={logoImg} className="h-6 w-auto" />
            </Link>
          </div>

          {/* Right: Theme toggle */}
          <div className="ml-auto flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={`h-10 w-10 rounded-full hover:scale-110 active:scale-95 transition-all duration-300 ease-out ${spinning ? "animate-spin-once" : ""}`}
              aria-label="切换主题"
            >
              <img
                src={theme === "dark" ? sunImg : moonImg}
                alt=""
                className="h-5 w-5 select-none pointer-events-none"
                aria-hidden="true"
              />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
