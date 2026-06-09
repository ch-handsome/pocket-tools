import { Link, useLocation, Outlet } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import moonSvg from "@/assets/svg/moon.svg";
import sunSvg from "@/assets/svg/sun.svg";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { getToolConfig } from "@/lib/tool-config";

export function Layout() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [spinning, setSpinning] = useState(false);

  // Get tool config for current page (if not home)
  const toolConfig = !isHome ? getToolConfig(location.pathname) : null;

  const toggleTheme = useCallback(() => {
    setSpinning(true);
    setTheme(theme === "dark" ? "light" : "dark");
    setTimeout(() => setSpinning(false), 500);
  }, [theme, setTheme]);

  return (
    <div className="min-h-screen bg-background">
      {/* Glass Header */}
      <header className="glass-header sticky top-0 z-50">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Left: Back button + Logo */}
          <div className="flex items-center gap-2">
            {!isHome && (
              <Button variant="ghost" size="icon" asChild className="shrink-0">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <Link to="/" className="flex items-center gap-2.5 group">
              {/* Gradient logo icon */}
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow -rotate-[15deg]">
                <span className="text-white text-sm font-bold">P</span>
              </div>
              <span className="font-semibold text-lg hidden sm:block">
                {import.meta.env.VITE_APP_TITLE || "Pocket Tools"}
              </span>
            </Link>
          </div>

          {/* Center/Right: Page indicator + Theme toggle */}
          <div className="flex items-center gap-3">
            {toolConfig && (
              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `hsl(${toolConfig.hue} ${toolConfig.sat}% ${toolConfig.light}% / 0.1)`,
                  color: `hsl(${toolConfig.hue} ${toolConfig.sat}% ${toolConfig.light}%)`,
                }}
              >
                <toolConfig.icon className="h-3.5 w-3.5" />
                {toolConfig.title}
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={`h-10 w-10 rounded-full hover:scale-110 active:scale-95 transition-all duration-300 ease-out ${spinning ? "animate-spin-once" : ""}`}
              aria-label="切换主题"
            >
              <img
                src={theme === "dark" ? sunSvg : moonSvg}
                alt=""
                className="h-8 w-8 select-none pointer-events-none"
                aria-hidden="true"
              />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
