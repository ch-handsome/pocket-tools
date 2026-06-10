import { ArrowLeft, type LucideIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { getAccent } from "@/lib/tool-config"

interface ToolLayoutProps {
  icon: LucideIcon
  title: string
  description: string
  children: React.ReactNode
}

export function ToolLayout({ icon: Icon, title, description, children }: ToolLayoutProps) {
  const location = useLocation()
  const accent = getAccent(location.pathname)

  return (
    <div
      className="space-y-6 max-w-3xl mx-auto animate-fade-in-up"
      style={{
        "--accent-color": accent,
        "--accent-bg": `${accent} / 0.1`,
        "--accent-border": `${accent} / 0.2`,
        "--accent-ring": `${accent} / 0.3`,
      } as React.CSSProperties}
    >
      {/* Page Header */}
      <div className="flex items-center gap-2 pb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="p-3 rounded-xl shrink-0"
            style={{ backgroundColor: `hsl(${accent} / 0.1)` }}
          >
            <Icon
              className="h-5 w-5"
              style={{ color: `hsl(${accent})` }}
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight truncate">{title}</h1>
            <p
              className="text-sm mt-0.5 truncate"
              style={{ color: `hsl(${accent} / 0.8)` }}
            >
              {description}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild className="shrink-0">
          <Link to="/" className="flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span>返回</span>
          </Link>
        </Button>
      </div>

      {children}
    </div>
  )
}
