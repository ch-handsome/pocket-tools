import { useEffect } from "react"
import { RouterProvider } from "react-router-dom"
import { Provider } from "react-redux"
import { ThemeProvider } from "@/context/theme-provider"
import { store, useAppDispatch } from "@/store"
import { setMobile } from "@/store/app"
import router from "@/router/index.tsx"

function MobileWatcher() {
  const dispatch = useAppDispatch()
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)")
    const handler = (e: MediaQueryListEvent) => dispatch(setMobile(e.matches))
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [dispatch])
  return null
}

export default function App() {
  useEffect(() => {
    // Enable smooth theme transitions after initial paint
    requestAnimationFrame(() => {
      document.body.classList.add("theme-transition")
    })
  }, [])

  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <MobileWatcher />
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  )
}
