import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { Type, Copy, Check, AlertCircle } from "lucide-react"
import { ToolLayout } from "@/layout/tool-layout"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (word) =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  )
}

function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\s_-]/g, "")
    .split(/[\s_-]+/)
    .map((word, i) =>
      i === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join("")
}

function toSnakeCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase())
    .join("_")
}

function toConstantCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toUpperCase())
    .join("_")
}

function removeDuplicateLines(str: string): string {
  return [...new Set(str.split("\n"))].join("\n")
}

export default function TextTool() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [copied, setCopied] = useState(false)

  // Regex tester state
  const [regexPattern, setRegexPattern] = useState("")
  const [regexFlags, setRegexFlags] = useState("gi")
  const [regexError, setRegexError] = useState<string | null>(null)

  const regexResult = useMemo(() => {
    if (!regexPattern.trim()) {
      return { matches: [], count: 0, error: null, segments: [{ text: input, highlighted: false }] }
    }
    try {
      const re = new RegExp(regexPattern, regexFlags)
      const matches: { text: string; index: number }[] = []
      let m: RegExpExecArray | null
      const segments: { text: string; highlighted: boolean }[] = []
      let lastIndex = 0

      if (re.global) {
        while ((m = re.exec(input)) !== null) {
          matches.push({ text: m[0], index: m.index })
          if (m.index > lastIndex) {
            segments.push({ text: input.slice(lastIndex, m.index), highlighted: false })
          }
          segments.push({ text: m[0], highlighted: true })
          lastIndex = m.index + m[0].length
          if (m.index === re.lastIndex) re.lastIndex++
        }
      } else {
        m = re.exec(input)
        if (m) {
          matches.push({ text: m[0], index: m.index })
          if (m.index > 0) {
            segments.push({ text: input.slice(0, m.index), highlighted: false })
          }
          segments.push({ text: m[0], highlighted: true })
          lastIndex = m.index + m[0].length
        }
      }
      if (lastIndex < input.length) {
        segments.push({ text: input.slice(lastIndex), highlighted: false })
      }

      return {
        matches,
        count: matches.length,
        error: null,
        segments: segments.length ? segments : [{ text: input, highlighted: false }],
      }
    } catch (e) {
      return {
        matches: [],
        count: 0,
        error: e instanceof Error ? e.message : "无效的正则表达式",
        segments: [{ text: input, highlighted: false }],
      }
    }
  }, [regexPattern, regexFlags, input])

  // Sync regex error to state
  const prevRegexErrorRef = useRef<string | null>(null)
  useEffect(() => {
    if (regexResult.error !== prevRegexErrorRef.current) {
      prevRegexErrorRef.current = regexResult.error
      setRegexError(regexResult.error)
    }
  }, [regexResult.error])

  const counts = useMemo(() => {
    return {
      charsWithSpace: input.length,
      charsWithoutSpace: input.replace(/\s/g, "").length,
      words: input.trim() ? input.trim().split(/\s+/).length : 0,
      lines: input ? input.split("\n").length : 0,
    }
  }, [input])

  const handleTransform = useCallback((fn: (s: string) => string) => {
    setOutput(fn(input))
  }, [input])

  const handleCopy = useCallback(async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [output])

  return (
    <ToolLayout icon={Type} title="文本工具" description="大小写转换·字符计数·重复行去重">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">文本处理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: "字符（含空格）", value: counts.charsWithSpace },
              { label: "字符（不含空格）", value: counts.charsWithoutSpace },
              { label: "单词数", value: counts.words },
              { label: "行数", value: counts.lines },
            ].map((s) => (
              <Card key={s.label}>
                <CardHeader className="py-3">
                  <CardTitle className="text-xs text-muted-foreground font-normal">
                    {s.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3 pt-0">
                  <p className="text-2xl font-bold">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Textarea
            placeholder="在此输入文本..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTransform((s) => s.toLowerCase())}
            >
              小写
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTransform((s) => s.toUpperCase())}
            >
              大写
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTransform(toTitleCase)}
            >
              首字母大写
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTransform(toCamelCase)}
            >
              驼峰
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTransform(toSnakeCase)}
            >
              下划线
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTransform(toConstantCase)}
            >
              常量式
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleTransform(removeDuplicateLines)}
            >
              去重行
            </Button>
          </div>
        </CardContent>
      </Card>

      {output && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">输出结果</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4 mr-1 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 mr-1" />
                )}
                {copied ? "已复制" : "复制"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={output}
              readOnly
              rows={6}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}

      {/* Regex Tester */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            正则表达式测试器
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={regexPattern}
                onChange={(e) => setRegexPattern(e.target.value)}
                placeholder="输入正则表达式，例如 \d+"
                className="font-mono text-sm pr-12"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 bg-muted rounded border text-xs font-mono">
                {["g", "i", "m", "s"].map((flag) => (
                  <button
                    key={flag}
                    onClick={() => {
                      const next = regexFlags.includes(flag)
                        ? regexFlags.replace(flag, "")
                        : (regexFlags + flag)
                      setRegexFlags(next)
                    }}
                    className={`w-6 h-6 flex items-center justify-center transition-colors ${
                      regexFlags.includes(flag)
                        ? "bg-primary text-primary-foreground font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {flag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error */}
          {regexError && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {regexError}
            </p>
          )}

          {/* Match count */}
          {regexPattern.trim() && !regexError && (
            <p className="text-xs text-muted-foreground">
              找到 <span className="font-semibold text-foreground">{regexResult.count}</span> 个匹配
            </p>
          )}

          {/* Highlighted preview */}
          {input && regexPattern.trim() && !regexError && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">匹配预览</label>
              <div className="rounded-lg border p-3 bg-card text-sm font-mono whitespace-pre-wrap break-all leading-relaxed max-h-48 overflow-y-auto">
                {regexResult.segments.map((seg, i) =>
                  seg.highlighted ? (
                    <mark
                      key={i}
                      className="bg-yellow-200 dark:bg-yellow-800 text-foreground rounded-sm px-0.5"
                    >
                      {seg.text}
                    </mark>
                  ) : (
                    <span key={i}>{seg.text}</span>
                  )
                )}
              </div>
            </div>
          )}

          {/* Match details */}
          {regexResult.count > 0 && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">匹配详情</label>
              <div className="rounded-lg border text-xs font-mono divide-y max-h-40 overflow-y-auto">
                {regexResult.matches.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-1.5 hover:bg-muted/50">
                    <span className="text-muted-foreground w-6 shrink-0">#{i + 1}</span>
                    <span className="flex-1 truncate">{m.text}</span>
                    <span className="text-muted-foreground shrink-0">
                      位置 {m.index}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  )
}
