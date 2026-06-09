import { useEffect } from "react"
import { RouterProvider } from "react-router-dom"
import { ThemeProvider } from "@/context/theme-provider"
import router from "@/router/index.tsx"

export default function App() {
  useEffect(() => {
    // Enable smooth theme transitions after initial paint
    requestAnimationFrame(() => {
      document.body.classList.add("theme-transition")
    })
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
