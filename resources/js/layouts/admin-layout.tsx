"use client"

import { type ReactNode, useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [defaultOpen, setDefaultOpen] = useState(true)

  useEffect(() => {
    // Check localStorage for sidebar state
    const sidebarState = localStorage.getItem("sidebar:state")
    if (sidebarState) {
      setDefaultOpen(sidebarState === "true")
    }
  }, [])

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex min-h-screen bg-muted/40 overflow-x-hidden w-full">
        <AdminSidebar />
        <div className="flex-1 overflow-x-hidden w-full">
          <AdminHeader />
          <main className="p-4 md:p-6 overflow-x-hidden w-full">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}

