import { Palette } from "lucide-react"
import { ToolLayout } from "@/layout/tool-layout"
import { useState, useCallback, useEffect } from "react"
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

export default function ColorTool() {
  const [hex, setHex] = useState("#3498DB")
  const [r, setR] = useState("52")
  const [g, setG] = useState("152")
  const [b, setB] = useState("219")
  const [error, setError] = useState("")

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

  // Keep in sync when r/g/b all valid
  useEffect(() => {
    const rn = parseInt(r, 10)
    const gn = parseInt(g, 10)
    const bn = parseInt(b, 10)
    if (!isNaN(rn) && !isNaN(gn) && !isNaN(bn)) {
      const cr = clamp(rn, 0, 255)
      const cg = clamp(gn, 0, 255)
      const cb = clamp(bn, 0, 255)
      setHex(rgbToHex(cr, cg, cb))
    }
  }, [r, g, b])

  const currentRgb = hexToRgb(hex)
  const lum = currentRgb
    ? getLuminance(currentRgb.r, currentRgb.g, currentRgb.b)
    : 0
  const whiteContrast = currentRgb ? getContrastRatio(1.0, lum) : 0
  const blackContrast = currentRgb ? getContrastRatio(lum, 0) : 0
  const whiteLevel = getContrastLevel(whiteContrast)
  const blackLevel = getContrastLevel(blackContrast)
  const bestText = whiteContrast > blackContrast ? "白色 (#FFFFFF)" : "黑色 (#000000)"

  return (
    <ToolLayout icon={Palette} title="颜色工具" description="颜色选择器 · HEX/RGB互转 · 对比度检测">
      {/* Color Preview */}
      <div
        className="h-32 rounded-xl border flex items-center justify-center text-2xl font-bold transition-colors"
        style={{ backgroundColor: hex }}
      >
        <span
          style={{
            color:
              whiteContrast > blackContrast ? "#FFFFFF" : "#000000",
          }}
        >
          {hex}
        </span>
      </div>

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
    </ToolLayout>
  )
}
