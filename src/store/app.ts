import { createSlice } from "@reduxjs/toolkit"

export interface AppState {
  isMobile: boolean
  isDark: boolean
}

function getInitialDark(): boolean {
  try {
    const stored = localStorage.getItem("isDark")
    if (stored === "true") return true
    if (stored === "false") return false
  } catch {
    // localStorage unavailable
  }
  return false
}

const initialState: AppState = {
  isMobile: typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches,
  isDark: getInitialDark(),
}

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setMobile(state, action: { payload: boolean }) {
      state.isMobile = action.payload
    },
    setDark(state, action: { payload: boolean }) {
      state.isDark = action.payload
    },
  },
})

export const { setMobile, setDark } = appSlice.actions
export default appSlice.reducer
