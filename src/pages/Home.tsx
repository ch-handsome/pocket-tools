import { Link } from "react-router-dom"
import { ALL_TOOLS } from "@/lib/tool-config"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

function getGreeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 9) return "早上好"
  if (h >= 9 && h < 12) return "上午好"
  if (h >= 12 && h < 14) return "中午好"
  if (h >= 14 && h < 18) return "下午好"
  return "晚上好"
}

export default function Home() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Hero Carousel */}
      <Carousel
        className="hero-gradient rounded-2xl px-6 py-10 sm:py-14 sm:px-10 text-center"
      >
        <CarouselContent>
          <CarouselItem>
            <div className="flex flex-col items-center">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
                {getGreeting()}，今天用什么工具？
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
                {import.meta.env.VITE_APP_DESCRIPTION || "精选开发工具集合，快速完成日常任务"}
              </p>
            </div>
          </CarouselItem>
        </CarouselContent>

      </Carousel>

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
