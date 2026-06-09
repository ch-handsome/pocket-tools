import { Clock } from "lucide-react"
import { ToolLayout } from "@/layout/tool-layout"
import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X, Plus } from "lucide-react"

const DEFAULT_CITIES = [
  { name: "北京", tz: "Asia/Shanghai" },
  { name: "东京", tz: "Asia/Tokyo" },
  { name: "纽约", tz: "America/New_York" },
  { name: "伦敦", tz: "Europe/London" },
  { name: "巴黎", tz: "Europe/Paris" },
  { name: "迪拜", tz: "Asia/Dubai" },
  { name: "悉尼", tz: "Australia/Sydney" },
  { name: "旧金山", tz: "America/Los_Angeles" },
]

function formatDate(ts: number, isMs: boolean): string {
  const d = new Date(isMs ? ts : ts * 1000)
  if (isNaN(d.getTime())) return "无效时间戳"
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

export default function TimeTool() {
  // Timestamp to Date
  const [tsInput, setTsInput] = useState("")
  const [tsMode, setTsMode] = useState("seconds")
  const [tsDate, setTsDate] = useState("")

  // Date to Timestamp
  const [dateInput, setDateInput] = useState("")
  const [dateOutput, setDateOutput] = useState("")

  // Countdown
  const [targetDate, setTargetDate] = useState("")
  const [targetTime, setTargetTime] = useState("")
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [countdownRunning, setCountdownRunning] = useState(false)
  const [countdownTarget, setCountdownTarget] = useState<number | null>(null)

  // World Clock
  const [cities, setCities] = useState(DEFAULT_CITIES)
  const [newCityName, setNewCityName] = useState("")
  const [newCityTz, setNewCityTz] = useState("")
  const [now, setNow] = useState(Date.now())

  // Tick world clock
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-convert date to timestamp
  useEffect(() => {
    if (!dateInput) {
      setDateOutput("")
      return
    }
    const d = new Date(dateInput)
    if (isNaN(d.getTime())) {
      setDateOutput("无效日期")
      return
    }
    setDateOutput(`秒: ${Math.floor(d.getTime() / 1000)}\n毫秒: ${d.getTime()}`)
  }, [dateInput])

  // Countdown logic
  useEffect(() => {
    if (!countdownRunning || countdownTarget === null) return
    const timer = setInterval(() => {
      const diff = countdownTarget - Date.now()
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        setCountdownRunning(false)
        clearInterval(timer)
      } else {
        setCountdown({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        })
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [countdownRunning, countdownTarget])

  const handleTsConvert = useCallback(() => {
    const v = parseInt(tsInput, 10)
    if (isNaN(v)) {
      setTsDate("请输入有效数字")
      return
    }
    setTsDate(formatDate(v, tsMode === "milliseconds"))
  }, [tsInput, tsMode])

  const handleStartCountdown = useCallback(() => {
    if (!targetDate) return
    const dt = new Date(`${targetDate}T${targetTime || "00:00"}`)
    if (isNaN(dt.getTime())) return
    const target = dt.getTime()
    if (target <= Date.now()) return
    setCountdownTarget(target)
    setCountdownRunning(true)
  }, [targetDate, targetTime])

  const handleStopCountdown = useCallback(() => {
    setCountdownRunning(false)
    setCountdownTarget(null)
  }, [])

  const handleAddCity = useCallback(() => {
    if (!newCityName.trim() || !newCityTz) return
    if (cities.some((c) => c.name === newCityName.trim())) return
    setCities((prev) => [...prev, { name: newCityName.trim(), tz: newCityTz }])
    setNewCityName("")
    setNewCityTz("")
  }, [newCityName, newCityTz, cities])

  const handleRemoveCity = useCallback((name: string) => {
    setCities((prev) => prev.filter((c) => c.name !== name))
  }, [])

  return (
    <ToolLayout icon={Clock} title="时间工具" description="时间戳转换 · 倒计时器 · 世界时钟">
      <Tabs defaultValue="timestamp">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timestamp">时间戳转换</TabsTrigger>
          <TabsTrigger value="countdown">倒计时器</TabsTrigger>
          <TabsTrigger value="worldclock">世界时钟</TabsTrigger>
        </TabsList>

        {/* Timestamp */}
        <TabsContent value="timestamp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">时间戳 → 日期</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="输入时间戳"
                  value={tsInput}
                  onChange={(e) => setTsInput(e.target.value)}
                />
                <Select value={tsMode} onValueChange={setTsMode}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seconds">秒</SelectItem>
                    <SelectItem value="milliseconds">毫秒</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleTsConvert}>转换</Button>
              </div>
              {tsDate && (
                <div className="p-3 rounded-md bg-muted font-mono text-sm">
                  {tsDate}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">日期 → 时间戳</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="datetime-local"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
              />
              {dateOutput && (
                <div className="p-3 rounded-md bg-muted font-mono text-sm whitespace-pre-line">
                  {dateOutput}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Countdown */}
        <TabsContent value="countdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">设置倒计时目标</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>日期</Label>
                  <Input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>时间</Label>
                  <Input
                    type="time"
                    value={targetTime}
                    onChange={(e) => setTargetTime(e.target.value)}
                  />
                </div>
              </div>
              {countdownRunning ? (
                <Button variant="destructive" onClick={handleStopCountdown}>
                  停止倒计时
                </Button>
              ) : (
                <Button onClick={handleStartCountdown}>开始倒计时</Button>
              )}
            </CardContent>
          </Card>

          {countdownRunning && (
            <Card>
              <CardContent className="py-8">
                <div className="grid grid-cols-4 gap-4 text-center">
                  {[
                    { label: "天", value: countdown.days },
                    { label: "时", value: countdown.hours },
                    { label: "分", value: countdown.minutes },
                    { label: "秒", value: countdown.seconds },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="text-4xl font-bold tabular-nums">
                        {String(item.value).padStart(2, "0")}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* World Clock */}
        <TabsContent value="worldclock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">世界时钟</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {cities.map((city) => {
                  const time = new Intl.DateTimeFormat("zh-CN", {
                    timeZone: city.tz,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }).format(now)
                  const [datePart, timePart] = time.split(" ")
                  return (
                    <div
                      key={city.name}
                      className="relative p-3 rounded-lg border"
                    >
                      <button
                        onClick={() => handleRemoveCity(city.name)}
                        className="absolute top-1 right-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <p className="font-medium text-sm">{city.name}</p>
                      <p className="text-lg font-bold tabular-nums">
                        {timePart || time}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {datePart || ""}
                      </p>
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">城市名称</Label>
                  <Input
                    placeholder="如: 首尔"
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">时区</Label>
                  <Select value={newCityTz} onValueChange={setNewCityTz}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择时区" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Asia/Seoul",
                        "Asia/Bangkok",
                        "Asia/Singapore",
                        "Asia/Hong_Kong",
                        "Asia/Kolkata",
                        "Asia/Taipei",
                        "Europe/Berlin",
                        "Europe/Moscow",
                        "Europe/Stockholm",
                        "America/Chicago",
                        "America/Vancouver",
                        "America/Sao_Paulo",
                        "Africa/Cairo",
                        "Pacific/Auckland",
                      ].map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button size="icon" onClick={handleAddCity}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ToolLayout>
  )
}
