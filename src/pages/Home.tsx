import { Link } from "react-router-dom"
import { ALL_TOOLS } from "@/lib/tool-config"

export default function Home() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Hero Section */}
      <div className="hero-gradient rounded-2xl px-6 py-10 sm:py-14 sm:px-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-md -rotate-[15deg] shrink-0">
            <span className="text-white text-lg sm:text-xl font-bold">P</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {import.meta.env.VITE_APP_TITLE || "Pocket Tools"}
          </h1>
        </div>
        <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
          {import.meta.env.VITE_APP_DESCRIPTION || "精选开发工具集合，快速完成日常任务"}
        </p>
      </div>

      {/* Tool Cards Grid */}
      <div className="card-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4">
        {ALL_TOOLS.map((tool) => {
          const Icon = tool.icon
          const accent = `${tool.hue} ${tool.sat}% ${tool.light}%`

          return (
            <Link
              key={tool.path}
              to={tool.path}
              className="card-hover group rounded-xl border bg-card text-card-foreground p-4 block"
            >
              <div className="flex items-start gap-3">
                {/* Icon with accent background */}
                <div
                  className="p-2.5 rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-110"
                  style={{ backgroundColor: `hsl(${accent} / 0.1)` }}
                >
                  <Icon
                    className="h-5 w-5 transition-colors duration-200"
                    style={{ color: `hsl(${accent})` }}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base truncate">
                    {tool.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
