"use client"

import { use, useEffect, useState } from "react"
import axios from "axios"
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
import { AvatarImage } from "@radix-ui/react-avatar"

import { UserProfile } from "@/models/Models"

export function AdminHeader() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    axios.get("/api/admin/getUserLogedIn")
      .then((response) => {
        if(response.data.status == 'success') {
            setUser(response.data.data)
            setLoading(false)
        }
      })
      .catch((error) => {
        setError("Gagal mengambil data pengguna")
        setLoading(false)
      })
  }, [])

  const pathname = document.location.href;

  // Function to get the page title based on the current path
  const getPageTitle = () => {
    return "Manajemen Proyek"
  }

  const handleLogout = () => {
    alert("Logout functionality would be implemented here")
  }

  const getInitials = (name: string | null | undefined) => {
    if(name === null || name === undefined) {
        return 'AB'
    }
    return name
      .split(" ") // Pisahkan berdasarkan spasi
      .map((word) => word.charAt(0).toUpperCase()) // Ambil huruf pertama setiap kata
      .join("") // Gabungkan huruf-huruf tersebut
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
                  {/* Foto profil tampil di sini jika ada */}
                  {user?.foto_profil && !loading && (
                    <AvatarImage
                      src={`/storage/${user.foto_profil}`}
                      alt={user.nama_lengkap || "User"}
                    />
                  )             }

                  {/* Fallback: tampilkan inisial jika belum ada foto atau masih loading */}
                  <AvatarFallback>
                    {getInitials(user?.nama_lengkap) || "AB"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {loading ? (
                <DropdownMenuLabel className="text-center">Loading...</DropdownMenuLabel>
              ) : error ? (
                <DropdownMenuLabel className="text-red-500">{error}</DropdownMenuLabel>
              ) : (
                <>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.nama_lengkap ? user.nama_lengkap : "Amir Budiono"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <a href="/profil">
                    <DropdownMenuItem>Profil</DropdownMenuItem>
                  </a>
                  {/* <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                    Keluar
                  </DropdownMenuItem> */}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
