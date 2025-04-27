"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, FileText, Trophy, Users, Briefcase, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { TopKaryawan, type DashboardAdminStats, type MockProjects } from "@/models/Models"

import { AdminLayout } from "@/layouts/admin-layout"

import axios from "axios"

// Month names for the Gantt chart
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export default function DashboardPage() {
  return <DashboardContent />
}

function DashboardContent() {
  // State for stats with loading and error handling
  const [stats, setStats] = useState<DashboardAdminStats | null>(null)
  const [mockProjects, setMockProjects] = useState<MockProjects[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [greeting, setGreeting] = useState("")
  const [userName, setUserName] = useState("Admin")

  const [mockTeamMembers, setMockTeamMembers] = useState<TopKaryawan[]>([])

  // Function to fetch stats data
  const fetchStats = async () => {
    setLoading(true)
    setError(null)

    try {
      axios
        .get<{ status: string; data: DashboardAdminStats }>("/api/admin/getDashboardStats")
        .then((response) => {
          setStats(response.data.data)
          setLoading(false)
        })
        .catch((err) => {
          console.error(err)
          setError(err)
          setLoading(false)
        })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching stats")
      setLoading(false)
    }
  }

  // Function to fetch user name
  const fetchUserName = async () => {
    try {
      axios
        .get<{ status: string; data: { nama_lengkap: string } }>("/api/admin/getUserNamaLengkap")
        .then((response) => {
          if (response.data.status == "success") {
            setUserName(response.data.data.nama_lengkap)
          }
        })
        .catch((err) => {
          console.error(err)
        })
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMockProject = async () => {
    try {
      axios
        .get<{ status: string; data: MockProjects[] }>("/api/admin/getTimeLineProyek")
        .then((response) => {
          if (response.data.status == "success") {
            setMockProjects(response.data.data)
          }
        })
        .catch((err) => {
          console.error(err)
        })
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMockTeamMembers = async () => {
    try {
      axios
        .get<{ status: string; data: TopKaryawan[] }>("/api/admin/getTopPerformers")
        .then((response) => {
          if (response.data.status == "success") {
            setMockTeamMembers(response.data.data)
          }
        })
        .catch((err) => {
          console.error(err)
        })
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Selamat Pagi")
    else if (hour < 15) setGreeting("Selamat Siang")
    else if (hour < 19) setGreeting("Selamat Sore")
    else setGreeting("Selamat Malam")

    // Fetch data
    fetchStats()
    fetchUserName()
    fetchMockProject()
    fetchMockTeamMembers()
  }, [])

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 overflow-x-hidden w-full">
        {/* Welcome section */}
        <div className="flex flex-col gap-2 w-full">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {greeting}, {userName}!
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Selamat datang di dashboard Manajemen Proyek. Berikut adalah ringkasan data terkini.
          </p>
        </div>

        {/* Error message if stats fetch failed */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Gagal memuat data statistik: {error}</AlertDescription>
          </Alert>
        )}

        {/* Stats cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
          {/* Total Projects Card */}
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Proyek</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16 mb-1" />
              ) : (
                <div className="text-2xl font-bold">{stats?.total_proyek || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">Proyek</p>
            </CardContent>
          </Card>

          {/* Divisions & Employees Card */}
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Divisi & Karyawan</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Divisi</p>
                    <Skeleton className="h-5 w-24" />
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.total_divisi || 0}</div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Divisi</p>
                    <Badge variant="outline" className="ml-2">
                      {stats?.total_karyawan || 0} Karyawan
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Pending Approval Card */}
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menunggu Persetujuan</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16 mb-1" />
              ) : (
                <div className="text-2xl font-bold">{stats?.total_proyek_menunggu_persetujuan || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">Proyek perlu persetujuan</p>
            </CardContent>
          </Card>

          {/* Late Projects Card */}
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
              {loading ? (
                <Skeleton className="h-8 w-16 mb-1" />
              ) : (
                <div className="text-2xl font-bold text-destructive">{stats?.total_proyek_terlambat || 0}</div>
              )}
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
            <CardDescription>Timeline pengerjaan proyek per tahun 2025</CardDescription>
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
                    <div className="font-medium truncate pr-4">{project.nama_proyek}</div>
                    {months.map((_, monthIndex) => {
                      const isProjectMonth =
                        monthIndex + 1 >= project.bulan_mulai && monthIndex + 1 < project.bulan_mulai + project.durasi
                      const isStartMonth = monthIndex + 1 === project.bulan_mulai
                      const isEndMonth = monthIndex + 1 === project.bulan_mulai + Math.round(project.durasi) - 1

                      let bgColor = ""
                      if (isProjectMonth) {
                        if (project.status === "done") bgColor = "bg-green-500"
                        else if (project.status === "in-progress") bgColor = "bg-blue-500"
                        else if (project.status === "pending") bgColor = "bg-red-500"
                        else if (project.status === "waiting_for_review") bgColor = "bg-purple-700"
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

                      // Format dates for tooltip
                      const formatDate = (date: Date) => {
                        return new Date(date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      }

                      const startDate = formatDate(project.tanggal_mulai)
                      const endDate = formatDate(project.tenggat_waktu)

                      return (
                        <div key={monthIndex} className="h-6 px-0.5">
                          {isProjectMonth && (
                            <div
                              className={`h-full w-full ${bgColor} ${borderRadius} relative group`}
                              // style={{
                              //   opacity: project.progress / 100,
                              // }}
                            >
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 text-white text-xs">
                                {project.progress}%
                              </div>

                              {/* Tooltip for date information */}
                              <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/80 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="font-medium">{project.nama_proyek}</div>
                                <div className="flex flex-col gap-1 mt-1">
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium">Mulai:</span> {startDate}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium">Deadline:</span> {endDate}
                                  </div>
                                </div>
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-black/80"></div>
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
                  <div className="w-3 h-3 bg-green-500 rounded-sm mr-1"></div>
                  <span>Selesai</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-sm mr-1"></div>
                  <span>Dalam Pengerjaan</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-700 rounded-sm mr-1"></div>
                  <span>Menunggu Review</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-sm mr-1"></div>
                  <span>Terlambat</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard and Activity */}
        {/* <div className="grid gap-4 grid-cols-1 md:grid-cols-1 w-full"> */}
          {/* Leaderboard */}
          {/* <Card className="col-span-1 w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Performers
              </CardTitle>
              <CardDescription>Karyawan dengan performa terbaik</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 w-full">
                {mockTeamMembers?.length > 0 ? (mockTeamMembers.map((member, index) => (
                  <div key={member.id} className="flex items-center gap-2 md:gap-4 w-full">
                    <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-muted">
                      <span className="text-xs md:text-sm font-medium">{index + 1}</span>
                    </div>
                    <Avatar className="h-8 w-8 md:h-9 md:w-9">
                      <AvatarFallback>{member.nama_lengkap.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">{member.nama_lengkap}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.divisi}</p>
                    </div>
                    <div className="flex items-center">
                      <Badge variant="secondary">{member.skor_kinerja}</Badge>
                    </div>
                  </div>
                ))) : (
                    <div>
                        <p>ga ada</p>
                    </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </AdminLayout>
  )
}

