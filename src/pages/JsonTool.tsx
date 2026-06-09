import { useState, useCallback } from "react"
import { FileJson, Copy, Check, Trash2 } from "lucide-react"
import { ToolLayout } from "@/layout/tool-layout"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function JsonTool() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const processJSON = useCallback(
    (mode: "format" | "compress") => {
      if (!input.trim()) {
        setError("请输入 JSON")
        setOutput("")
        return
      }
      try {
        const parsed = JSON.parse(input)
        setOutput(
          mode === "format"
            ? JSON.stringify(parsed, null, 2)
            : JSON.stringify(parsed)
        )
        setError("")
      } catch (e) {
        setError((e as Error).message)
        setOutput("")
      }
    },
    [input]
  )

  const handleCopy = useCallback(async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [output])

  const handleClear = useCallback(() => {
    setInput("")
    setOutput("")
    setError("")
  }, [])

  const lineCount = input ? input.split("\n").length : 0

  return (
    <ToolLayout icon={FileJson} title="JSON 格式化" description="格式化美化·压缩去空格·语法错误提示">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">输入 JSON</label>
          <span className="text-xs text-muted-foreground">{lineCount} 行</span>
        </div>
        <Textarea
          placeholder='{"key": "value"}'
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setError("")
            setOutput("")
          }}
          rows={8}
          className="font-mono text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => processJSON("format")}>格式化</Button>
        <Button variant="outline" onClick={() => processJSON("compress")}>
          压缩
        </Button>
        <Button variant="ghost" size="icon" onClick={handleClear}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive font-mono whitespace-pre-wrap">
          {error}
        </div>
      )}

      {output && !error && (
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
            rows={8}
            className="font-mono text-sm"
          />
        </div>
      )}
    </ToolLayout>
  )
}
