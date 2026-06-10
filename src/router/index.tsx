import { createHashRouter } from "react-router-dom"
import { Layout } from "@/layout/index.tsx"
import Home from "@/pages/Home/index"
import ColorTool from "@/pages/ColorTool/index"
import TextTool from "@/pages/TextTool/index"
import TimeTool from "@/pages/TimeTool/index"
import QrCodeTool from "@/pages/QrCodeTool/index"
import JsonTool from "@/pages/JsonTool/index"
import ImageCompressTool from "@/pages/ImageCompressTool/index"
import PasswordTool from "@/pages/PasswordTool/index"
import BaseConverterTool from "@/pages/BaseConverterTool/index"

const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/color", element: <ColorTool /> },
      { path: "/text", element: <TextTool /> },
      { path: "/time", element: <TimeTool /> },
      { path: "/qrcode", element: <QrCodeTool /> },
      { path: "/json", element: <JsonTool /> },
      { path: "/image-compress", element: <ImageCompressTool /> },
      { path: "/password", element: <PasswordTool /> },
      { path: "/base-converter", element: <BaseConverterTool /> },
    ],
  },
])

export default router
