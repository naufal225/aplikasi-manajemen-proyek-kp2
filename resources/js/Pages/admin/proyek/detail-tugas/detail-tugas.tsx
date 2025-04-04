"use client"

import { useState, useEffect } from "react"
import { router, usePage } from "@inertiajs/react"
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  FileText,
  ListChecks,
  User,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AdminLayout } from "@/layouts/admin-layout"
import { format, isAfter } from "date-fns"
import axios from "axios"
import Swal from "sweetalert2"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { id } from "date-fns/locale";

import { Proyek, Karyawan, Tugas } from "@/models/Models"

// Schema validasi untuk form tugas
const tugasFormSchema = z
  .object({
    nama_tugas: z.string().min(2, {
      message: "Nama tugas harus minimal 2 karakter.",
    }),
    deskripsi: z.string().optional(),
    id_penanggung_jawab: z.number({
      required_error: "Silakan pilih penanggung jawab.",
    }),
    status: z.enum(["pending", "in-progress", "done"], {
      required_error: "Silakan pilih status tugas.",
    }),
    tanggal_mulai: z.date({
      required_error: "Tanggal mulai diperlukan.",
    }),
    tenggat_waktu: z.date({
      required_error: "Tanggal selesai diperlukan.",
    }),
  })
  .refine((data) => isAfter(data.tenggat_waktu, data.tanggal_mulai), {
    message: "Tanggal selesai harus setelah tanggal mulai",
    path: ["tenggat_waktu"],
  })

type FormValues = z.infer<typeof tugasFormSchema>

export default function DetailTugasProyek() {
  const {props} = usePage();
  const {id_proyek} = props

  const [proyek, setProyek] = useState<Proyek | null>(null)
  const [tugas, setTugas] = useState<Tugas[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEdit, setIsEdit] = useState(false)

  // Inisialisasi form dengan react-hook-form dan zod
  const form = useForm<FormValues>({
    resolver: zodResolver(tugasFormSchema),
    defaultValues: {
      nama_tugas: "",
      deskripsi: "",
      id_penanggung_jawab: undefined as unknown as number,
      status: "pending",
      tanggal_mulai: new Date(),
      tenggat_waktu: new Date(new Date().setDate(new Date().getDate() + 7)),
    },
  })

  // Fetch data proyek
  useEffect(() => {
    const getProyekById = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await axios.get<{ status: string; data: Proyek }>(`/api/admin/getProyekById/${id_proyek}`)
        if (response.data.status === "success") {
          setProyek(response.data.data)
        } else {
          setError("Gagal memuat data proyek")
        }
      } catch (err) {
        console.error("Error fetching project:", err)
        setError("Terjadi kesalahan saat memuat data proyek")
      } finally {
        setIsLoading(false)
      }
    }

    if (id_proyek) {
      getProyekById()
    }
  }, [id_proyek])

  // Fetch data tugas dan karyawan
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tugas
        const tugasResponse = await axios.get<{ status: string; data: Tugas[] }>(`/api/admin/getTugasByIdProyek/${id_proyek}`)
        if (tugasResponse.data.status === "success") {
          setTugas(tugasResponse.data.data)
        }

      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Terjadi kesalahan saat memuat data")
      }
    }

    if (id_proyek) {
      fetchData()
    }
  }, [id_proyek])

  const handleBack = () => {
    router.visit("/kelola-data-proyek")
  }

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            In Progress
          </Badge>
        )
      case "waiting_for_review":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Menunggu Review
          </Badge>
        )
      case "done":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Selesai
          </Badge>
        )
      default:
        return null
    }
  }

  // Render tugas status badge
  const renderTugasStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            In Progress
          </Badge>
        )
      case "done":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Selesai
          </Badge>
        )
      default:
        return null
    }
  }

  // Cek apakah tugas telat
  const isTugasTelat = (tugas: Tugas) => {
    if (tugas.status === "done") return false
    return isAfter(new Date(), new Date(tugas.tenggat_waktu))
  }

  // Render keterlambatan badge
  const renderTelatBadge = (tugas: Tugas) => {
    if (tugas.status === "done") return null

    return isTugasTelat(tugas) ? (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        <AlertCircle className="mr-1 h-3 w-3" /> Terlambat
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <Clock className="mr-1 h-3 w-3" /> Tepat Waktu
      </Badge>
    )
  }

  return (
    <AdminLayout>
      <div className="p-1 md:p-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold">Detail Tugas Proyek</h1>
          <p className="text-muted-foreground">Kelola tugas-tugas dalam proyek</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Memuat data proyek...</p>
          </div>
        ) : proyek ? (
          <div className="space-y-6">
            {/* Detail Proyek */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Detail Proyek
                </CardTitle>
                <CardDescription>Informasi lengkap mengenai proyek</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Nama Proyek</h3>
                    <p className="text-base">{proyek.nama_proyek}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Divisi</h3>
                    <p className="text-base">{proyek.divisi?.nama_divisi || "Tidak ada divisi"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <div className="mt-1">{renderStatusBadge(proyek.status)}</div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Progress</h3>
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span className="font-medium">{proyek.progress}%</span>
                      </div>
                      <Progress value={proyek.progress} className="h-2" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Tanggal Mulai</h3>
                    <p className="text-base">
                      {format(new Date(proyek.tanggal_mulai), "dd MMMM yyyy", { locale: id })}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Tanggal Selesai</h3>
                    <p className="text-base">
                      {format(new Date(proyek.tenggat_waktu), "dd MMMM yyyy", { locale: id })}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Deskripsi Proyek</h3>
                  <p className="text-sm">{proyek.deskripsi_proyek || "Tidak ada deskripsi"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Daftar Tugas */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ListChecks className="h-5 w-5" />
                    Daftar Tugas
                  </CardTitle>
                  <CardDescription>Tugas-tugas yang harus diselesaikan dalam proyek ini</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {tugas.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Belum ada tugas untuk proyek ini</p>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[60px]">No</TableHead>
                            <TableHead className="min-w-[200px]">Nama Tugas</TableHead>
                            <TableHead className="min-w-[150px]">Penanggung Jawab</TableHead>
                            <TableHead className="min-w-[120px]">Status</TableHead>
                            <TableHead className="min-w-[120px]">Keterangan</TableHead>
                            <TableHead className="min-w-[120px]">Tenggat Waktu</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tugas.map((item, index) => (
                            <TableRow key={item.id}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{item.nama_tugas}</p>
                                  <p className="text-sm text-muted-foreground line-clamp-1">{item.deskripsi}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span>{item.penanggung_jawab?.nama_lengkap || "Tidak ada"}</span>
                                </div>
                              </TableCell>
                              <TableCell>{renderTugasStatusBadge(item.status)}</TableCell>
                              <TableCell>{renderTelatBadge(item)}</TableCell>
                              <TableCell>
                                {format(new Date(item.tenggat_waktu), "dd MMM yyyy", { locale: id })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Proyek tidak ditemukan</AlertDescription>
          </Alert>
        )}

      </div>
    </AdminLayout>
  )
}

