import { Link, useNavigate } from "react-router-dom"
import { ALL_TOOLS } from "@/lib/tool-config"
import { useState, useCallback, useEffect, useRef } from "react"
import { Sparkles } from "lucide-react"

function getGreeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 9) return "早上好"
  if (h >= 9 && h < 12) return "上午好"
  if (h >= 12 && h < 14) return "中午好"
  if (h >= 14 && h < 18) return "下午好"
  return "晚上好"
}

function getRandomTool() {
  return ALL_TOOLS[Math.floor(Math.random() * ALL_TOOLS.length)]
}

export default function Home() {
  const navigate = useNavigate()
  const [recommended] = useState(getRandomTool)
  const fullText = `${getGreeting()}，今天用什么工具？`

  const [displayText, setDisplayText] = useState("")
  const charIdxRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    function typeNext() {
      if (charIdxRef.current < fullText.length) {
        charIdxRef.current++
        setDisplayText(fullText.substring(0, charIdxRef.current))
        timerRef.current = setTimeout(typeNext, 80 + Math.random() * 40)
      } else {
        timerRef.current = setTimeout(() => {
          charIdxRef.current = 0
          setDisplayText("")
          timerRef.current = setTimeout(typeNext, 300)
        }, 2000)
      }
    }

    typeNext()

    return () => clearTimeout(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isTypingDone = displayText.length === fullText.length

  const handleRecommend = useCallback(() => {
    navigate(getRandomTool().path)
  }, [navigate])

  return (
    <div className="space-y-8 animate-fade-in-up px-4 sm:px-6 py-6 sm:py-8">
      {/* Abstract Geometric Hero */}
      <div className="hero-section rounded-2xl px-6 py-12 sm:py-16 sm:px-10 text-center relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: '#2e1065' }}>
            {displayText}
            <span
              className={`typewriter-cursor ${isTypingDone ? 'blink' : ''}`}
            />
          </h2>
          <p className="max-w-md mx-auto text-sm sm:text-base mb-6 mt-3" style={{ color: '#a78bfa' }}>
            {import.meta.env.VITE_APP_DESCRIPTION}
          </p>
          <button
            onClick={handleRecommend}
            className="inline-flex items-center gap-2 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 border-0"
            style={{ background: '#2e1065', boxShadow: '0 2px 12px rgba(167,139,250,0.15)' }}
          >
            <Sparkles className="h-4 w-4" />
            试试：{recommended.title}
          </button>
        </div>
      </div>

      {/* Tool Cards Grid */}
      <div className="card-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5">
        {ALL_TOOLS.map((tool) => {
          const Icon = tool.icon
          const accent = `${tool.hue} ${tool.sat}% ${tool.light}%`

          return (
            <Link
              key={tool.path}
              to={tool.path}
              className="card-hover group rounded-xl border bg-card text-card-foreground block overflow-hidden"
            >
              {/* Top accent bar */}
              <div
                className="h-1 w-full"
                style={{ background: `hsl(${accent})` }}
              />
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-3.5">
                  {/* Gradient icon */}
                  <div
                    className="p-3 rounded-xl shrink-0 transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, hsl(${accent} / 0.85), hsl(${accent}))`,
                    }}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base truncate">
                      {tool.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
