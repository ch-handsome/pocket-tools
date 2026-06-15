import { useState, useCallback, useRef } from "react"
import { QrCode, Download, Copy, Check, Upload } from "lucide-react"
import { ToolLayout } from "@/layout/tool-layout"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import QRCode from "qrcode"

type ErrorLevel = "L" | "M" | "Q" | "H"

const ERROR_LEVELS: { key: ErrorLevel; label: string; tolerance: string }[] = [
  { key: "L", label: "L", tolerance: "7%" },
  { key: "M", label: "M", tolerance: "15%" },
  { key: "Q", label: "Q", tolerance: "25%" },
  { key: "H", label: "H", tolerance: "30%" },
]

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function compositeLogo(qrDataUrl: string, logoUrl: string, size: number): Promise<string> {
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")!
  const qrImg = await loadImage(qrDataUrl)
  ctx.drawImage(qrImg, 0, 0, size, size)
  const logoImg = await loadImage(logoUrl)
  const logoSize = Math.round(size * 0.24)
  const pad = 4
  const logoX = Math.round((size - logoSize) / 2)
  const logoY = Math.round((size - logoSize) / 2)
  // White background behind logo
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(logoX - pad, logoY - pad, logoSize + pad * 2, logoSize + pad * 2)
  ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
  return canvas.toDataURL("image/png")
}

export default function QrCodeTool() {
  const [text, setText] = useState("")
  const size = 300
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>("M")
  const [fgColor, setFgColor] = useState("#000000")
  const [bgColor, setBgColor] = useState("#ffffff")
  const [qrDataUrl, setQrDataUrl] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Logo
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateQR = useCallback(async () => {
    if (!text.trim()) {
      setError("请输入文本或URL")
      return
    }
    setGenerating(true)
    setError("")
    try {
      const url = await QRCode.toDataURL(text.trim(), {
        width: size,
        margin: 2,
        errorCorrectionLevel: errorLevel,
        color: { dark: fgColor, light: bgColor },
      })

      if (logoUrl) {
        const composited = await compositeLogo(url, logoUrl, size)
        setQrDataUrl(composited)
      } else {
        setQrDataUrl(url)
      }
    } catch {
      setError("生成二维码失败")
    } finally {
      setGenerating(false)
    }
  }, [text, size, errorLevel, fgColor, bgColor, logoUrl])

  const handleDownload = useCallback(() => {
    if (!qrDataUrl) return
    const link = document.createElement("a")
    link.download = `qrcode-${Date.now()}.png`
    link.href = qrDataUrl
    link.click()
  }, [qrDataUrl])

  const handleCopy = useCallback(async () => {
    if (!qrDataUrl) return
    try {
      const blob = await (await fetch(qrDataUrl)).blob()
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: copy as data URL text
      try {
        await navigator.clipboard.writeText(qrDataUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // ignore
      }
    }
  }, [qrDataUrl])

  const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) return
    const url = URL.createObjectURL(file)
    setLogoUrl(url)
  }, [])

  const handleRemoveLogo = useCallback(() => {
    if (logoUrl) URL.revokeObjectURL(logoUrl)
    setLogoUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [logoUrl])

  return (
    <ToolLayout icon={QrCode} title="二维码生成器" description="生成二维码·尺寸/颜色自定义·Logo嵌入">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>文本或URL</Label>
              <Input
                placeholder="https://example.com"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            {/* Error correction level */}
            <div className="space-y-1">
              <Label>容错级别</Label>
              <div className="flex gap-1 rounded-lg bg-muted p-1">
                {ERROR_LEVELS.map((el) => (
                  <button
                    key={el.key}
                    onClick={() => setErrorLevel(el.key)}
                    className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                      errorLevel === el.key
                        ? "bg-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {el.key}
                    <span className="block text-[10px] opacity-60">{el.tolerance}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>前景色</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-8 w-8 rounded cursor-pointer border bg-transparent"
                  />
                  <Input
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>背景色</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-8 w-8 rounded cursor-pointer border bg-transparent"
                  />
                  <Input
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Logo upload */}
            <div className="space-y-1">
              <Label>Logo（可选）</Label>
              {logoUrl ? (
                <div className="flex items-center gap-2 p-2 rounded-md border">
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="h-8 w-8 rounded object-contain border"
                  />
                  <span className="text-xs text-muted-foreground flex-1 truncate">
                    Logo 已添加
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleRemoveLogo}>
                    移除
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    上传 Logo 图片
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <Button onClick={generateQR} disabled={generating} className="w-full">
              {generating ? "生成中..." : "生成二维码"}
            </Button>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm">预览</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {qrDataUrl ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-4 h-full">
                <div
                  className="rounded-lg border overflow-hidden"
                  style={{ width: size > 400 ? 400 : size, height: size > 400 ? 400 : size }}
                >
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                    style={{ maxWidth: size, maxHeight: size }}
                  />
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-1.5" />
                    下载 PNG
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? (
                      <Check className="h-4 w-4 mr-1.5 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1.5" />
                    )}
                    {copied ? "已复制" : "复制图片"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-muted/30">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <QrCode className="h-16 w-16 opacity-20" />
                  <p className="text-sm">在左侧输入内容并生成二维码</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}
