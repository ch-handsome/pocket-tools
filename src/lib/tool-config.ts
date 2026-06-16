import {
  Palette,
  Type,
  Clock,
  QrCode,
  FileJson,
  Image,
  Lock,
  Binary,
  type LucideIcon,
} from "lucide-react"

export interface ToolConfig {
  path: string
  title: string
  description: string
  icon: LucideIcon
  /** HSL hue value for the accent color */
  hue: number
  /** HSL saturation percentage */
  sat: number
  /** HSL lightness percentage */
  light: number
}

export const TOOL_ACCENTS: Record<string, ToolConfig> = {
  "/color": {
    path: "/color",
    title: "颜色工具",
    description: "颜色选择器、HEX/RGB互转、对比度检测",
    icon: Palette,
    hue: 199, sat: 89, light: 48, // sky-500
  },
  "/text": {
    path: "/text",
    title: "文本工具",
    description: "大小写转换、字符计数、重复行去重",
    icon: Type,
    hue: 239, sat: 84, light: 67, // indigo-500
  },
  "/time": {
    path: "/time",
    title: "时间工具",
    description: "时间戳转日期、倒计时器、世界时钟",
    icon: Clock,
    hue: 160, sat: 84, light: 39, // emerald-500
  },
  "/qrcode": {
    path: "/qrcode",
    title: "二维码生成器",
    description: "输入文本或URL，生成并下载二维码",
    icon: QrCode,
    hue: 38, sat: 92, light: 50, // amber-500
  },
  "/json": {
    path: "/json",
    title: "JSON工具",
    description: "格式化、压缩JSON，语法错误提示",
    icon: FileJson,
    hue: 271, sat: 91, light: 65, // violet-500
  },
  "/image": {
    path: "/image",
    title: "图片工具",
    description: "图片压缩与裁剪，质量调节，比例裁切",
    icon: Image,
    hue: 330, sat: 81, light: 60, // pink-500
  },
  "/password": {
    path: "/password",
    title: "密码生成器",
    description: "自定义密码长度和字符类型，强度检测",
    icon: Lock,
    hue: 173, sat: 80, light: 40, // teal-500
  },
  "/base-converter": {
    path: "/base-converter",
    title: "进制转换",
    description: "二进制/八进制/十进制/十六进制互转",
    icon: Binary,
    hue: 24, sat: 95, light: 53, // orange-500
  },
}

/** Get accent HSL string for a given tool path */
export function getAccent(path: string): string {
  const tool = TOOL_ACCENTS[path]
  if (!tool) return "199 89% 48%"
  return `${tool.hue} ${tool.sat}% ${tool.light}%`
}

/** Get the tool config for a given path, or fallback to first tool */
export function getToolConfig(path: string): ToolConfig {
  return TOOL_ACCENTS[path] || Object.values(TOOL_ACCENTS)[0]
}

/** All tools as an array, useful for the Home page */
export const ALL_TOOLS = Object.values(TOOL_ACCENTS)
