"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, FileText, Trophy, Users, Briefcase } from "lucide-react"
import { useEffect, useState } from "react"
import { Head } from "@inertiajs/react"
import { AdminLayout } from "@/layouts/admin-layout"
import axios from "axios"
import { AxiosResponse, AxiosError } from "axios"
import Swal from "sweetalert2"

// Mock data for the dashboard
const mockTeamMembers = [
  { id: 1, name: "Ahmad Rizki", role: "Project Manager", score: 95 },
  { id: 2, name: "Siti Aminah", role: "UI/UX Designer", score: 92 },
  { id: 3, name: "Budi Santoso", role: "Frontend Developer", score: 90 },
  { id: 4, name: "Dewi Lestari", role: "Backend Developer", score: 88 },
  { id: 5, name: "Eko Prasetyo", role: "QA Engineer", score: 85 },
]

const mockActivities = [
  { id: 1, user: "Ahmad Rizki", action: "Membuat project baru: E-Commerce App", time: "08:30", date: "Hari ini" },
  {
    id: 2,
    user: "Siti Aminah",
    action: "Mengupload desain UI untuk halaman produk",
    time: "09:15",
    date: "Hari ini",
  },
  { id: 3, user: "Budi Santoso", action: "Menyelesaikan fitur login dan register", time: "11:45", date: "Hari ini" },
  { id: 4, user: "Dewi Lestari", action: "Mengimplementasi API pembayaran", time: "14:20", date: "Kemarin" },
  { id: 5, user: "Eko Prasetyo", action: "Melakukan testing pada fitur checkout", time: "16:05", date: "Kemarin" },
]

// Mock data for project timelines
const mockProjects = [
  {
    id: 1,
    name: "E-Commerce Website",
    startMonth: 1, // January
    duration: 3, // 3 months
    progress: 100,
    status: "completed",
  },
  {
    id: 2,
    name: "Mobile App Development",
    startMonth: 2, // February
    duration: 4, // 4 months
    progress: 75,
    status: "in-progress",
  },
  {
    id: 3,
    name: "CRM Integration",
    startMonth: 4, // April
    duration: 2, // 2 months
    progress: 100,
    status: "completed",
  },
  {
    id: 4,
    name: "Payment Gateway",
    startMonth: 5, // May
    duration: 2, // 2 months
    progress: 50,
    status: "in-progress",
  },
  {
    id: 5,
    name: "Data Migration",
    startMonth: 7, // July
    duration: 1, // 1 month
    progress: 25,
    status: "in-progress",
  },
  {
    id: 6,
    name: "UI Redesign",
    startMonth: 8, // August
    duration: 3, // 3 months
    progress: 10,
    status: "in-progress",
  },
  {
    id: 7,
    name: "Security Audit",
    startMonth: 6, // June
    duration: 1, // 1 month
    progress: 0,
    status: "delayed",
  },
]

// Month names for the Gantt chart
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export default function DashboardPage() {
  // Update the stats state to include the new information
  const [stats, setStats] = useState({
    totalProjects: 12,
    divisions: 5,
    employees: 42,
    pendingApproval: 8,
    lateProjects: 3,
  })

  const [nama, setNama] = useState("Budi");

  const getNama = async () => {
    axios.get('/api/admin/getUserNamaLengkap')
        .then(response => {
            setNama(response.data.data.nama_lengkap)
        })
        .catch(err => {
            Swal.fire({
                title: 'Error!',
                text: err,
                icon: 'error',
                confirmButtonText: 'Cool'
              })
        })
  }

  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Selamat Pagi")
    else if (hour < 15) setGreeting("Selamat Siang")
    else if (hour < 19) setGreeting("Selamat Sore")
    else setGreeting("Selamat Malam")

    getNama();
  }, [])

  return (
    <AdminLayout>
      <Head title="Dashboard"/>
      <div className="flex flex-col gap-6 overflow-x-hidden w-full">
        {/* Welcome section */}
        <div className="flex flex-col gap-2 w-full">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{greeting}, {nama}</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Selamat datang di dashboard Manajemen Proyek. Berikut adalah ringkasan data terkini.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Proyek</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">Proyek aktif</p>
            </CardContent>
          </Card>
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Divisi & Karyawan</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.divisions}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Divisi</p>
                <Badge variant="outline" className="ml-2">
                  {stats.employees} Karyawan
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menunggu Persetujuan</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApproval}</div>
              <p className="text-xs text-muted-foreground">Proyek perlu persetujuan</p>
            </CardContent>
          </Card>
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proyek Terlambat</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-destructive"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.lateProjects}</div>
              <p className="text-xs text-muted-foreground">Proyek melewati deadline</p>
            </CardContent>
          </Card>
        </div>

        {/* Gantt Chart */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Timeline Proyek
            </CardTitle>
            <CardDescription>Gantt chart timeline pengerjaan proyek dalam bulan</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Gantt Chart Header */}
              <div className="grid grid-cols-[200px_repeat(12,1fr)] mb-2 border-b pb-2">
                <div className="font-medium">Nama Proyek</div>
                {months.map((month, index) => (
                  <div key={index} className="text-center text-sm font-medium">
                    {month}
                  </div>
                ))}
              </div>

              {/* Gantt Chart Rows */}
              <div className="space-y-2">
                {mockProjects.map((project) => (
                  <div key={project.id} className="grid grid-cols-[200px_repeat(12,1fr)] items-center h-10">
                    <div className="font-medium truncate pr-4">{project.name}</div>
                    {months.map((_, monthIndex) => {
                      const isProjectMonth =
                        monthIndex + 1 >= project.startMonth && monthIndex + 1 < project.startMonth + project.duration
                      const isStartMonth = monthIndex + 1 === project.startMonth
                      const isEndMonth = monthIndex + 1 === project.startMonth + project.duration - 1

                      let bgColor = ""
                      if (isProjectMonth) {
                        if (project.status === "completed") bgColor = "bg-gray-900 dark:bg-gray-100"
                        else if (project.status === "in-progress") bgColor = "bg-gray-600 dark:bg-gray-400"
                        else if (project.status === "delayed") bgColor = "bg-gray-300 dark:bg-gray-700"
                      }

                      const borderRadius = isProjectMonth
                        ? isStartMonth && isEndMonth
                          ? "rounded-md"
                          : isStartMonth
                            ? "rounded-l-md"
                            : isEndMonth
                              ? "rounded-r-md"
                              : ""
                        : ""

                      return (
                        <div key={monthIndex} className="h-6">
                          {isProjectMonth && (
                            <div
                              className={`h-full w-full ${bgColor} ${borderRadius} relative group`}
                              style={{
                                opacity: project.progress / 100,
                              }}
                            >
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 text-white text-xs">
                                {project.progress}%
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex gap-4 mt-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-900 dark:bg-gray-100 rounded-sm mr-1"></div>
                  <span>Selesai</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-600 dark:bg-gray-400 rounded-sm mr-1"></div>
                  <span>Dalam Pengerjaan</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded-sm mr-1"></div>
                  <span>Terlambat</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard and Activity */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 w-full">
          {/* Leaderboard */}
          <Card className="col-span-1 w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Performers
              </CardTitle>
              <CardDescription>Tim dengan performa terbaik</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 w-full">
                {mockTeamMembers.map((member, index) => (
                  <div key={member.id} className="flex items-center gap-2 md:gap-4 w-full">
                    <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-muted">
                      <span className="text-xs md:text-sm font-medium">{index + 1}</span>
                    </div>
                    <Avatar className="h-8 w-8 md:h-9 md:w-9">
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                    </div>
                    <div className="flex items-center">
                      <Badge variant="secondary">{member.score}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card className="col-span-1 w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <FileText className="h-5 w-5" />
                Aktivitas Terbaru
              </CardTitle>
              <CardDescription>Aktivitas tim dalam sistem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 w-full">
                {mockActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-2 md:gap-4 w-full">
                    <Avatar className="mt-1 h-7 w-7 md:h-8 md:w-8">
                      <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2">
                        <p className="text-sm font-medium leading-none truncate">{activity.user}</p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {activity.time} • {activity.date}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm truncate">{activity.action}</p>
                    </div>
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

