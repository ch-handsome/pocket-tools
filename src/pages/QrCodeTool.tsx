import { useState, useCallback, useEffect } from "react"
import { QrCode, Download } from "lucide-react"
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

export default function QrCodeTool() {
  const [text, setText] = useState("")
  const [size, setSize] = useState(256)
  const [qrDataUrl, setQrDataUrl] = useState("")
  const [error, setError] = useState("")

  const generateQR = useCallback(async () => {
    if (!text.trim()) {
      setError("请输入文本或URL")
      return
    }
    try {
      setError("")
      const url = await QRCode.toDataURL(text.trim(), {
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })
      setQrDataUrl(url)
    } catch (e) {
      setError("生成二维码失败")
    }
  }, [text, size])

  useEffect(() => {
    if (text.trim()) {
      generateQR()
    }
  }, [size, generateQR, text])

  const handleDownload = useCallback(() => {
    if (!qrDataUrl) return
    const link = document.createElement("a")
    link.download = `qrcode-${Date.now()}.png`
    link.href = qrDataUrl
    link.click()
  }, [qrDataUrl])

  return (
    <ToolLayout icon={QrCode} title="二维码生成器" description="输入文本或URL，生成并下载二维码">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">输入内容</CardTitle>
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
          <div className="space-y-1">
            <Label>二维码大小: {size}px</Label>
            <Input
              type="range"
              min={128}
              max={512}
              step={16}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
          </div>
          <Button onClick={generateQR}>生成二维码</Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {qrDataUrl && (
        <Card>
          <CardContent className="flex flex-col items-center py-6 space-y-4">
            <img
              src={qrDataUrl}
              alt="QR Code"
              className="border rounded-lg"
              style={{ width: size, height: size }}
            />
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              下载 PNG
            </Button>
          </CardContent>
        </Card>
      )}
    </ToolLayout>
  )
}
