import { useState, useCallback, useMemo } from "react"
import { FileJson, Shrink, Trash2, Copy, Download, ChevronsUpDown, ChevronsDownUp } from "lucide-react"
import ReactJson from "@microlink/react-json-view"
import { ToolLayout } from "@/layout/tool-layout"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { useAppSelector } from "@/store"

const VIEWER_STYLE = {
  fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, Consolas, monospace',
  fontSize: "13px",
  lineHeight: "1.6",
} as React.CSSProperties

export default function JsonTool() {
  const isMobile = useAppSelector((s) => s.app.isMobile)
  const isDark = useAppSelector((s) => s.app.isDark)
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [rawMode, setRawMode] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const handleEdit = useCallback(
    (edit: { updated_src: object }) => {
      setOutput(JSON.stringify(edit.updated_src, null, 2))
      return true
    },
    [],
  )

  const handleAdd = useCallback(
    (add: { updated_src: object }) => {
      setOutput(JSON.stringify(add.updated_src, null, 2))
      return true
    },
    [],
  )

  const handleDelete = useCallback(
    (del: { updated_src: object }) => {
      setOutput(JSON.stringify(del.updated_src, null, 2))
      return true
    },
    [],
  )

  const parsed = useMemo(() => {
    if (!output) return null
    try {
      return JSON.parse(output)
    } catch {
      return null
    }
  }, [output])

  const formatJSON = useCallback((value: string) => {
    setRawMode(false)
    if (!value.trim()) {
      setError("")
      setOutput("")
      return
    }
    try {
      const parsed = JSON.parse(value)
      setOutput(JSON.stringify(parsed, null, 2))
      setError("")
    } catch (e) {
      setOutput("")
      setError((e as Error).message)
    }
  }, [])

  const handleToggleView = useCallback(() => {
    if (!output) return
    try {
      const parsed = JSON.parse(output)
      if (rawMode) {
        setOutput(JSON.stringify(parsed, null, 2))
        setRawMode(false)
      } else {
        setOutput(JSON.stringify(parsed))
        setRawMode(true)
      }
      setError("")
    } catch {
      // noop
    }
  }, [output, rawMode])

  // Memoize the output panel to avoid re-rendering ReactJson on unrelated state changes
  const outputPanel = useMemo(() => {
    const content = error ? (
      <div className="flex-1 min-h-0 overflow-auto p-4">
        <div className="text-sm text-destructive font-mono whitespace-pre-wrap">
          {error}
        </div>
      </div>
    ) : rawMode ? (
      <div className="flex-1 min-h-0 overflow-auto p-4">
        <pre className="text-sm font-mono whitespace-pre-wrap break-all">
          {output}
        </pre>
      </div>
    ) : parsed ? (
      <div className="flex-1 min-h-0 overflow-auto bg-card no-theme-transition" style={VIEWER_STYLE}>
        <div className="p-4">
          <ReactJson
            key={collapsed ? "collapsed" : "expanded"}
            src={parsed}
            name={false}
            collapsed={collapsed ? true : 3}
            displayObjectSize={true}
            displayDataTypes={false}
            iconStyle="triangle"
            theme={isDark ? "google" : "rjv-default"}
            onEdit={handleEdit}
            onAdd={handleAdd}
            onDelete={handleDelete}
          />
        </div>
      </div>
    ) : (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-2 text-muted-foreground bg-muted/30">
        <FileJson className="h-8 w-8 opacity-40" />
        <p className="text-sm">输入 JSON 后自动格式化并查看树形结构</p>
      </div>
    )
    return content
  }, [error, rawMode, output, parsed, collapsed, isDark, handleEdit, handleAdd, handleDelete])

  const handleToggleCollapse = useCallback(() => {
    if (rawMode) return
    setCollapsed((prev) => !prev)
  }, [rawMode])

  const handleClear = useCallback(() => {
    setInput("")
    setOutput("")
    setError("")
  }, [])

  const handleCopy = useCallback(async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
  }, [output])

  const handleSave = useCallback(() => {
    if (!output) return
    const blob = new Blob([output], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "formatted.json"
    a.click()
    URL.revokeObjectURL(url)
  }, [output])

  return (
    <ToolLayout icon={FileJson} title="JSON 格式化" description="格式化美化 · 树形查看 · 语法错误提示">
      <div className="rounded-lg border overflow-hidden h-[calc(100vh-240px)]">
        <ResizablePanelGroup orientation={isMobile ? "vertical" : "horizontal"} className="h-full">
          {/* ===== Left/Top Panel: Input ===== */}
          <ResizablePanel defaultSize={40} minSize={20}>
            <Textarea
              placeholder='{"key": "value"}'
              value={input}
              onChange={(e) => {
                const value = e.target.value
                setInput(value)
                formatJSON(value)
              }}
              className="font-mono text-sm resize-none border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 h-full p-4"
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* ===== Right/Bottom Panel: Output ===== */}
          <ResizablePanel defaultSize={60} minSize={20}>
            <div className="flex flex-col h-full">
              {/* Toolbar */}
              <TooltipProvider>
                <div className="h-[50px] shrink-0 border-b border-t lg:border-t-0 border-border flex items-center gap-1 px-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleToggleView}>
                        {rawMode ? <FileJson className="h-4 w-4" /> : <Shrink className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{rawMode ? "格式化" : "压缩"}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleToggleCollapse}>
                        {collapsed ? <ChevronsDownUp className="h-4 w-4" /> : <ChevronsUpDown className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{collapsed ? "展开" : "折叠"}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleClear}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">清空</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleCopy}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">复制</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleSave}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">保存</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
              {/* Content */}
              {outputPanel}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </ToolLayout>
  )
}
