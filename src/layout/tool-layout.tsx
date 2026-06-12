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
    <div className="w-full mx-auto animate-fade-in-up px-4 sm:px-6 py-6 sm:py-8 pt-0">
      {/* Accent Gradient Header */}
      <div
        className="relative -mx-4 sm:-mx-6 px-4 sm:px-6 py-6 mb-6 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, hsl(${accent}), hsl(${accent} / 0.6))`,
        }}
      >
        {/* Decorative blobs */}
        <div className="deco-blob top-0 right-0 w-64 h-64 bg-white/5 -translate-y-1/2 translate-x-1/4" />
        <div className="deco-blob bottom-0 left-1/4 w-32 h-32 bg-white/5" />
        <div className="deco-blob top-1/2 right-1/3 w-20 h-20 bg-white/5" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm shrink-0">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white truncate">{title}</h1>
            <p className="text-sm text-white/80 mt-0.5 truncate">{description}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="bg-white/90 hover:bg-white text-gray-800 rounded-full shrink-0"
          >
            <Link to="/" className="flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">返回</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Tool Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  )
}
