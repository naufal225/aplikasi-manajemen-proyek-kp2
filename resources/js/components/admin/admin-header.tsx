"use client"

import { BellRing } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AdminHeader() {
  const pathname = document.location.href;

  // Function to get the page title based on the current path
  const getPageTitle = () => {
    if (pathname?.startsWith("/dashboard")) return "Dashboard"
    if (pathname?.startsWith("/divisions")) return "Manajemen Divisi"
    if (pathname?.startsWith("/employees")) return "Manajemen Karyawan"
    if (pathname?.startsWith("/projects")) return "Manajemen Proyek"
    if (pathname?.startsWith("/profile")) return "Profil Pengguna"
    return "Manajemen Proyek"
  }

  const handleLogout = () => {
    // In a real app, you would implement logout logic here
    alert("Logout functionality would be implemented here")
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center border-b bg-background px-4 md:px-6">
      <SidebarTrigger className="mr-2" />
      <div className="flex flex-1 items-center justify-between">
        <div className="font-medium">{getPageTitle()}</div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Admin</p>
                  <p className="text-xs leading-none text-muted-foreground">admin@manajemen-proyek.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <a href="/profile">
                <DropdownMenuItem>Profil</DropdownMenuItem>
              </a>
              <DropdownMenuItem>Pengaturan</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

