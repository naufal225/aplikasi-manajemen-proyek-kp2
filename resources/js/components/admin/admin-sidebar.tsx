"use client"

import { Briefcase, Home, LogOut, Users, Building2 } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { router } from "@inertiajs/react"

export function AdminSidebar() {
    const [currentPath, setCurrentPath] = useState("/")

    useEffect(() => {
      setCurrentPath(window.location.pathname)
    }, [])

    const isPathActive = (path: string) => {
      return currentPath === path || currentPath.startsWith(`${path}/`)
    }

  // Admin menu items - added divisions and employees
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
    { id: "divisions", label: "Divisi", icon: Building2, href: "/kelola-data-divisi" },
    { id: "employees", label: "Karyawan", icon: Users, href: "/kelola-data-karyawan" },
    { id: "projects", label: "Proyek", icon: Briefcase, href: "/kelola-data-proyek" },
  ]

  const onLogout = () => {
    router.visit('/logout')
  }

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <div className="p-4">
          <div className="flex items-center">
            <div className="w-30 h-20 bg-white rounded-md flex items-center justify-center text-primary-foreground font-bold text-lg">
              <img src="img/logo_grafit.png" alt="" />
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton asChild isActive={isPathActive(item.href)}>
                <a href={item.href}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onLogout}>
              <LogOut className="w-5 h-5" />
              <span>Keluar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

