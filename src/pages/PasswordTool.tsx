import { useState, useCallback, useMemo } from "react"
import { Lock, Copy, Check, RefreshCw } from "lucide-react"
import { ToolLayout } from "@/layout/tool-layout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const LOWER = "abcdefghijklmnopqrstuvwxyz"
const DIGITS = "0123456789"
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?"

function generatePassword(
  length: number,
  opts: { upper: boolean; lower: boolean; digits: boolean; symbols: boolean }
): string {
  let chars = ""
  if (opts.upper) chars += UPPER
  if (opts.lower) chars += LOWER
  if (opts.digits) chars += DIGITS
  if (opts.symbols) chars += SYMBOLS

  if (!chars) return ""

  // Ensure at least one character from each selected set
  let password = ""
  const sets: string[] = []
  if (opts.upper) sets.push(UPPER)
  if (opts.lower) sets.push(LOWER)
  if (opts.digits) sets.push(DIGITS)
  if (opts.symbols) sets.push(SYMBOLS)

  for (let i = 0; i < length; i++) {
    const set = sets[i % sets.length]
    password += set.charAt(Math.floor(Math.random() * set.length))
  }
  // Shuffle
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}

function getStrength(password: string): { label: string; score: number; color: string } {
  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1

  if (score <= 2) return { label: "弱", score: 20, color: "bg-red-500" }
  if (score <= 3) return { label: "中", score: 40, color: "bg-yellow-500" }
  if (score <= 5) return { label: "强", score: 70, color: "bg-green-500" }
  return { label: "非常强", score: 100, color: "bg-green-600" }
}

export default function PasswordTool() {
  const [length, setLength] = useState(12)
  const [opts, setOpts] = useState({
    upper: true,
    lower: true,
    digits: true,
    symbols: false,
  })
  const [password, setPassword] = useState("")
  const [copied, setCopied] = useState(false)

  const strength = useMemo(() => getStrength(password), [password])

  const handleGenerate = useCallback(() => {
    setPassword(generatePassword(length, opts))
  }, [length, opts])

  const handleCopy = useCallback(async () => {
    if (!password) return
    await navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [password])

  const handleOptChange = useCallback(
    (key: keyof typeof opts) => {
      setOpts((prev) => {
        const next = { ...prev, [key]: !prev[key] }
        // Ensure at least one is selected
        if (!next.upper && !next.lower && !next.digits && !next.symbols) {
          return prev
        }
        return next
      })
    },
    []
  )

  return (
    <ToolLayout icon={Lock} title="密码生成器" description="自定义长度和字符类型·强度检测·一键复制">

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">生成选项</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Length */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>密码长度</Label>
              <span className="text-sm font-mono">{length}</span>
            </div>
            <Input
              type="range"
              min={4}
              max={32}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>4</span>
              <span>32</span>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label>包含字符</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "upper" as const, label: "大写字母 (A-Z)" },
                { key: "lower" as const, label: "小写字母 (a-z)" },
                { key: "digits" as const, label: "数字 (0-9)" },
                { key: "symbols" as const, label: "符号 (!@#$%...)" },
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-2">
                  <Checkbox
                    id={item.key}
                    checked={opts[item.key]}
                    onCheckedChange={() => handleOptChange(item.key)}
                  />
                  <Label htmlFor={item.key} className="text-sm cursor-pointer">
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleGenerate} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            生成密码
          </Button>
        </CardContent>
      </Card>

      {password && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">生成的密码</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={password}
                readOnly
                className="font-mono text-lg"
              />
              <Button variant="outline" size="icon" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button variant="outline" size="icon" onClick={handleGenerate}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Strength bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>密码强度</span>
                <span className="font-medium">{strength.label}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full transition-all ${strength.color}`}
                  style={{ width: `${strength.score}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </ToolLayout>
  )
}
