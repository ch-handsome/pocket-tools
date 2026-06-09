import { useState, useMemo, useCallback } from "react"
import { Type, Copy, Check } from "lucide-react"
import { ToolLayout } from "@/layout/tool-layout"
import { Textarea } from "@/components/ui/textarea"
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

      <div className="space-y-2">
        <label className="text-sm font-medium">输入文本</label>
        <Textarea
          placeholder="在此输入文本..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
        />
      </div>

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

      {output && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">输出结果</label>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 mr-1 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 mr-1" />
              )}
              {copied ? "已复制" : "复制"}
            </Button>
          </div>
          <Textarea
            value={output}
            readOnly
            rows={6}
            className="font-mono text-sm"
          />
        </div>
      )}
    </ToolLayout>
  )
}
