import { createBrowserRouter } from "react-router-dom"
import { Layout } from "@/layout/index.tsx"
import Home from "@/pages/Home"
import ColorTool from "@/pages/ColorTool"
import TextTool from "@/pages/TextTool"
import TimeTool from "@/pages/TimeTool"
import QrCodeTool from "@/pages/QrCodeTool"
import JsonTool from "@/pages/JsonTool"
import ImageCompressTool from "@/pages/ImageCompressTool"
import PasswordTool from "@/pages/PasswordTool"
import BaseConverterTool from "@/pages/BaseConverterTool"

const router = createBrowserRouter([
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
