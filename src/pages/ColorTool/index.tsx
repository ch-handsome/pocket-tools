import { Palette, Sparkles, Dice1, ImageIcon, Link2, Upload, Copy, RefreshCw } from "lucide-react"
import { ToolLayout } from "@/layout/tool-layout"
import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`
}

function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]
}

function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function getContrastLevel(ratio: number): {
  aa: boolean
  aaa: boolean
  aaLarge: boolean
} {
  return {
    aa: ratio >= 4.5,
    aaa: ratio >= 7,
    aaLarge: ratio >= 3,
  }
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100
  l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  }
}

function generateRandomColors(hue: number, count: number): string[] {
  return Array.from({ length: count }, () => {
    const h = hue + (Math.random() - 0.5) * 10
    const s = 60 + Math.random() * 40
    const l = 40 + Math.random() * 50
    const rgb = hslToRgb(h, s, l)
    return rgbToHex(rgb.r, rgb.g, rgb.b)
  })
}

function extractPalette(imageData: ImageData, colorCount: number): string[] {
  const { data } = imageData
  const colorMap = new Map<string, { count: number; rSum: number; gSum: number; bSum: number }>()

  const step = 4
  for (let i = 0; i < data.length; i += step * 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const key = `${r >> 3},${g >> 3},${b >> 3}`
    const entry = colorMap.get(key)
    if (entry) {
      entry.count++
      entry.rSum += r
      entry.gSum += g
      entry.bSum += b
    } else {
      colorMap.set(key, { count: 1, rSum: r, gSum: g, bSum: b })
    }
  }

  const sorted = [...colorMap.entries()]
    .sort((a, b) => b[1].count - a[1].count)

  return sorted.slice(0, colorCount).map(([, v]) => {
    const r = Math.round(v.rSum / v.count)
    const g = Math.round(v.gSum / v.count)
    const b = Math.round(v.bSum / v.count)
    return rgbToHex(r, g, b)
  })
}

function loadImageToCanvas(src: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const maxW = 200
      const scale = Math.min(1, maxW / img.width, maxW / img.height)
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext("2d")
      if (!ctx) { reject(new Error("Canvas 2D context not available")); return }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(ctx.getImageData(0, 0, canvas.width, canvas.height))
    }
    img.onerror = () => reject(new Error("图片加载失败，请检查 URL 是否正确"))
    img.src = src
  })
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const el = document.createElement("textarea")
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand("copy")
    document.body.removeChild(el)
  }
}

export default function ColorTool() {
  const [hex, setHex] = useState("#3498DB")
  const [r, setR] = useState("52")
  const [g, setG] = useState("152")
  const [b, setB] = useState("219")
  const [error, setError] = useState("")

  // Random color generator state
  const [lockedHue, setLockedHue] = useState(210)
  const [randomColors, setRandomColors] = useState<string[]>(() =>
    generateRandomColors(210, 5)
  )

  // Palette extractor state
  const [extractTab, setExtractTab] = useState<"url" | "upload">("url")
  const [imageUrl, setImageUrl] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [extractedColors, setExtractedColors] = useState<string[]>([])
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)

  const syncFromHex = useCallback((h: string) => {
    const rgb = hexToRgb(h)
    if (rgb) {
      setR(String(rgb.r))
      setG(String(rgb.g))
      setB(String(rgb.b))
      setError("")
    } else if (h.length >= 4) {
      setError("无效的 HEX 颜色值")
    }
  }, [])

  const handleHexChange = (value: string) => {
    let h = value
    if (!h.startsWith("#")) h = "#" + h
    if (/^#[0-9a-fA-F]{0,6}$/.test(h)) {
      setHex(h.toUpperCase())
      if (h.length === 7) syncFromHex(h)
    }
  }

  const currentRgb = hexToRgb(hex)
  const lum = currentRgb
    ? getLuminance(currentRgb.r, currentRgb.g, currentRgb.b)
    : 0
  const whiteContrast = currentRgb ? getContrastRatio(1.0, lum) : 0
  const blackContrast = currentRgb ? getContrastRatio(lum, 0) : 0
  const whiteLevel = getContrastLevel(whiteContrast)
  const blackLevel = getContrastLevel(blackContrast)
  const bestText = whiteContrast > blackContrast ? "白色 (#FFFFFF)" : "黑色 (#000000)"

  // Palette extractor handlers
  const handleUrlExtract = useCallback(async () => {
    if (!imageUrl.trim()) {
      setExtractError("请输入图片 URL")
      return
    }
    setExtracting(true)
    setExtractError(null)
    setPreviewUrl(null)
    try {
      const data = await loadImageToCanvas(imageUrl.trim())
      const colors = extractPalette(data, 5)
      setExtractedColors(colors)
      setPreviewUrl(imageUrl.trim())
    } catch (err) {
      if (err instanceof Error && err.message.includes("tainted")) {
        setExtractError("该图片不支持跨域提取，请下载后使用本地上传")
      } else {
        setExtractError(err instanceof Error ? err.message : "提取失败")
      }
      setExtractedColors([])
    } finally {
      setExtracting(false)
    }
  }, [imageUrl])

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setExtractError("请上传图片文件")
      return
    }
    setExtracting(true)
    setExtractError(null)
    setImageUrl("")

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    try {
      const data = await loadImageToCanvas(url)
      const colors = extractPalette(data, 5)
      setExtractedColors(colors)
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : "提取失败")
      setExtractedColors([])
    } finally {
      setExtracting(false)
    }
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
  }, [handleFileUpload])

  return (
    <ToolLayout icon={Palette} title="颜色工具" description="颜色选择器 · HEX/RGB互转 · 对比度检测">
      <div className="grid gap-6 md:grid-cols-2">
        {/* HEX Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">HEX</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={hex}
                onChange={(e) => {
                  const v = e.target.value
                  setHex(v.toUpperCase())
                  syncFromHex(v)
                }}
                className="h-9 w-9 rounded cursor-pointer border bg-transparent"
              />
              <Input
                value={hex}
                onChange={(e) => handleHexChange(e.target.value)}
                placeholder="#FFFFFF"
                className="font-mono"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </CardContent>
        </Card>

        {/* RGB Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">RGB</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "R", value: r, set: setR, cls: "text-red-500" },
              { label: "G", value: g, set: setG, cls: "text-green-500" },
              { label: "B", value: b, set: setB, cls: "text-blue-500" },
            ].map((ch) => (
              <div key={ch.label} className="flex items-center gap-2">
                <span className={`w-4 font-bold ${ch.cls}`}>{ch.label}</span>
                <Input
                  type="number"
                  min={0}
                  max={255}
                  value={ch.value}
                  onChange={(e) => {
                    const v = e.target.value
                    ch.set(v)
                    const num = parseInt(v, 10)
                    if (!isNaN(num) && v !== "") {
                      const cr = ch.label === "R" ? clamp(num, 0, 255) : clamp(parseInt(r, 10) || 0, 0, 255)
                      const cg = ch.label === "G" ? clamp(num, 0, 255) : clamp(parseInt(g, 10) || 0, 0, 255)
                      const cb = ch.label === "B" ? clamp(num, 0, 255) : clamp(parseInt(b, 10) || 0, 0, 255)
                      setHex(rgbToHex(cr, cg, cb))
                      setError("")
                    }
                  }}
                  className="font-mono"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

            {/* Contrast Check */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">对比度检测</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            建议文字颜色：<span className="font-semibold text-foreground">{bestText}</span>
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* White text preview */}
            <div
              className="rounded-lg p-4 space-y-2"
              style={{ backgroundColor: hex, color: "#FFFFFF" }}
            >
              <p className="text-sm font-medium">白色文字</p>
              <p className="text-2xl font-bold">Aa</p>
              <p className="text-xs opacity-80">
                对比度: {whiteContrast.toFixed(2)}:1
              </p>
              <div className="flex gap-2 text-xs">
                <span
                  className={
                    whiteLevel.aaa
                      ? "text-green-400"
                      : whiteLevel.aa
                        ? "text-yellow-400"
                        : "text-red-400"
                  }
                >
                  AAA{whiteLevel.aaa ? " ✓" : ""}
                </span>
                <span
                  className={
                    whiteLevel.aa
                      ? "text-green-400"
                      : whiteLevel.aaLarge
                        ? "text-yellow-400"
                        : "text-red-400"
                  }
                >
                  AA{whiteLevel.aa ? " ✓" : " (大文字可)"}
                </span>
              </div>
            </div>

            {/* Black text preview */}
            <div
              className="rounded-lg p-4 space-y-2"
              style={{ backgroundColor: hex, color: "#000000" }}
            >
              <p className="text-sm font-medium">黑色文字</p>
              <p className="text-2xl font-bold">Aa</p>
              <p className="text-xs opacity-60">
                对比度: {blackContrast.toFixed(2)}:1
              </p>
              <div className="flex gap-2 text-xs">
                <span
                  className={
                    blackLevel.aaa
                      ? "text-green-600"
                      : blackLevel.aa
                        ? "text-yellow-600"
                        : "text-red-600"
                  }
                >
                  AAA{blackLevel.aaa ? " ✓" : ""}
                </span>
                <span
                  className={
                    blackLevel.aa
                      ? "text-green-600"
                      : blackLevel.aaLarge
                        ? "text-yellow-600"
                        : "text-red-600"
                  }
                >
                  AA{blackLevel.aa ? " ✓" : " (大文字可)"}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>WCAG AA 标准：普通文字 ≥ 4.5:1，大文字 ≥ 3:1</p>
            <p>WCAG AAA 标准：普通文字 ≥ 7:1，大文字 ≥ 4.5:1</p>
          </div>
        </CardContent>
      </Card>

      {/* Random Color Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            随机颜色生成器
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">锁定色相</span>
              <span className="text-xs font-mono font-bold">{lockedHue}°</span>
            </div>
            {/* Hue slider with gradient background */}
            <div
              className="relative h-6 rounded-full"
              style={{
                background: `linear-gradient(to right,
                  hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%),
                  hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))`,
              }}
            >
              <input
                type="range"
                min={0}
                max={360}
                value={lockedHue}
                onChange={(e) => {
                  const h = Number(e.target.value)
                  setLockedHue(h)
                  setRandomColors(generateRandomColors(h, 5))
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white shadow-md pointer-events-none transition-all"
                style={{
                  left: `${(lockedHue / 360) * 100}%`,
                  marginLeft: "-10px",
                  backgroundColor: `hsl(${lockedHue}, 100%, 50%)`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setRandomColors(generateRandomColors(lockedHue, 5))}
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Dice1 className="h-4 w-4" />
              随机生成
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {randomColors.map((color, i) => (
              <button
                key={i}
                onClick={() => copyToClipboard(color)}
                title={`点击复制 ${color}`}
                className="relative flex flex-col items-center gap-2"
              >
                <div
                  className="w-full aspect-square rounded-lg border shadow-sm transition-transform"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                  {color}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Palette Extractor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            调色板提取器
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tab switcher */}
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            <button
              onClick={() => { setExtractTab("url"); setExtractError(null) }}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                extractTab === "url" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Link2 className="h-3.5 w-3.5" />
              URL
            </button>
            <button
              onClick={() => { setExtractTab("upload"); setExtractError(null) }}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                extractTab === "upload" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              本地上传
            </button>
          </div>

          {extractTab === "url" ? (
            <div className="flex gap-2">
              <Input
                value={imageUrl}
                onChange={(e) => { setImageUrl(e.target.value); setExtractError(null) }}
                placeholder="粘贴图片 URL，例如 https://...jpg"
                className="flex-1 font-mono text-xs"
                onKeyDown={(e) => e.key === "Enter" && handleUrlExtract()}
              />
              <button
                onClick={handleUrlExtract}
                disabled={extracting || !imageUrl.trim()}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors shrink-0"
              >
                {extracting ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                提取
              </button>
            </div>
          ) : (
            <div>
              <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  点击选择图片或拖拽上传
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Error message */}
          {extractError && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <span>⚠</span> {extractError}
            </p>
          )}

          {/* Image preview */}
          {previewUrl && (
            <div className="relative rounded-lg overflow-hidden border">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-40 object-contain bg-black/5"
                onError={() => setExtractError("图片加载失败")}
              />
            </div>
          )}

          {/* Loading state */}
          {extracting && (
            <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              正在提取颜色...
            </div>
          )}

          {/* Extracted colors */}
          {extractedColors.length > 0 && !extracting && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">主色调（点击复制）</p>
              <div className="grid grid-cols-5 gap-2">
                {extractedColors.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => copyToClipboard(color)}
                    title={`点击复制 ${color}`}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-full aspect-square rounded-lg border shadow-sm transition-transform"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                      {color}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  )
}
