import { create } from 'zustand'

export interface ToastNotice {
  id: string
  variant: 'info' | 'success' | 'warning' | 'error'
  message: string
}

interface UiState {
  sidebarOpen: boolean
  notices: ToastNotice[]
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  pushNotice: (notice: Omit<ToastNotice, 'id'>) => void
  dismissNotice: (id: string) => void
  clearNotices: () => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  notices: [],
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  pushNotice: (notice) =>
    set((state) => ({
      notices: [
        ...state.notices,
        { ...notice, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` },
      ],
    })),
  dismissNotice: (id) =>
    set((state) => ({
      notices: state.notices.filter((item) => item.id !== id),
    })),
  clearNotices: () => set({ notices: [] }),
}))
