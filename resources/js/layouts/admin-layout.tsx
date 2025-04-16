"use client"

import { type ReactNode, useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

import { Head } from "@inertiajs/react"
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
        <Head title="Grafit: MP KP 2">
            <link rel="icon" type="image/png" href="/img/logo_grafit.png" sizes="16x32" />
        </Head>
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

