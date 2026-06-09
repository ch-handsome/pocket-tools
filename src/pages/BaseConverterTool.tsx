import { useState, useCallback } from "react"
import { Binary } from "lucide-react"
import { ToolLayout } from "@/layout/tool-layout"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type Base = 2 | 8 | 10 | 16

function convertTo(value: string, fromBase: Base): { [key: string]: string } {
  if (!value.trim()) {
    return { "2": "", "8": "", "10": "", "16": "" }
  }

  const decimal = parseInt(value.trim(), fromBase)
  if (isNaN(decimal)) {
    return { "2": "", "8": "", "10": "", "16": "" }
  }

  return {
    "2": decimal.toString(2),
    "8": decimal.toString(8),
    "10": decimal.toString(10),
    "16": decimal.toString(16).toUpperCase(),
  }
}

const LABELS: Record<string, string> = {
  "2": "二进制 (Binary)",
  "8": "八进制 (Octal)",
  "10": "十进制 (Decimal)",
  "16": "十六进制 (Hexadecimal)",
}

const PLACEHOLDERS: Record<string, string> = {
  "2": "0b1010",
  "8": "0o12",
  "10": "42",
  "16": "0xFF",
}

export default function BaseConverterTool() {
  const [values, setValues] = useState<Record<string, string>>({
    "2": "",
    "8": "",
    "10": "",
    "16": "",
  })

  const handleChange = useCallback((base: Base, input: string) => {
    // Only allow valid chars for this base
    const isValid = (() => {
      for (const ch of input) {
        if (base === 2 && !/^[01]$/.test(ch)) return false
        if (base === 8 && !/^[0-7]$/.test(ch)) return false
        if (base === 10 && !/^[0-9]$/.test(ch)) return false
        if (base === 16 && !/^[0-9a-fA-F]$/.test(ch)) return false
      }
      return true
    })()

    if (!isValid && input !== "") return

    const result = convertTo(input, base)
    setValues({
      "2": result["2"],
      "8": result["8"],
      "10": result["10"],
      "16": result["16"],
    })
  }, [])

  return (
    <ToolLayout icon={Binary} title="进制转换" description="二进制·八进制·十进制·十六进制相互转换">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            在任一输入框中输入，其他将自动更新
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(Object.keys(LABELS) as string[]).map((base) => (
            <div key={base} className="space-y-1">
              <Label>{LABELS[base]}</Label>
              <Input
                value={values[base]}
                onChange={(e) => handleChange(parseInt(base, 10) as Base, e.target.value)}
                placeholder={PLACEHOLDERS[base]}
                className="font-mono"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </ToolLayout>
  )
}
