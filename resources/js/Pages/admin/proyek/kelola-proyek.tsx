"use client"

import { useState, useEffect } from "react"
import {
  Edit,
  Plus,
  Search,
  Trash2,
  Clock,
  AlertCircle,
  MoreVertical,
  Eye,
  CheckSquare,
  ListChecks,
  Download,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format, isAfter } from "date-fns"
import { id } from "date-fns/locale"
import { DatePicker } from "@/components/ui/date-picker"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { AdminLayout } from "@/layouts/admin-layout"
import axios from "axios"
import Swal from "sweetalert2"
import {router} from "@inertiajs/react"
import { format as formatDate } from "date-fns"
import { Label } from "@/components/ui/label"

// Schema validasi untuk form proyek
const proyekFormSchema = z
  .object({
    nama_proyek: z.string().min(2, {
      message: "Nama proyek harus minimal 2 karakter.",
    }),
    deskripsi: z.string().optional(),
    id_divisi: z.number({
      required_error: "Silakan pilih divisi.",
    }),
    status: z.enum(["pending", "in-progress", "waiting_for_review", "done"], {
      required_error: "Silakan pilih status proyek.",
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

type FormValues = z.infer<typeof proyekFormSchema>

// Interface untuk data proyek
interface Proyek {
  id: number
  nama_proyek: string
  deskripsi: string | null
  id_divisi: number
  divisi?: {
    id: number
    nama_divisi: string
  } | null
  status: "pending" | "in-progress" | "waiting_for_review" | "done"
  progress: number
  tanggal_mulai: string
  tenggat_waktu: string
}

// Interface untuk data divisi
interface Divisi {
  id: number
  nama_divisi: string
}

export default function KelolaProyek() {

  // State untuk data proyek dan divisi
  const [proyek, setProyek] = useState<Proyek[]>([])
  const [divisi, setDivisi] = useState<Divisi[]>([])

  // State untuk pagination dan search
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProyek, setFilteredProyek] = useState<Proyek[]>([])
  const [totalPages, setTotalPages] = useState(1)

  // State untuk dialog dan form
  const [isEdit, setIsEdit] = useState(false)
  const [currentId, setCurrentId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedProyek, setSelectedProyek] = useState<Proyek | undefined>()
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [exportDateRange, setExportDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
  })

  // Inisialisasi form dengan react-hook-form dan zod
  const form = useForm<FormValues>({
    resolver: zodResolver(proyekFormSchema),
    defaultValues: {
      nama_proyek: "",
      deskripsi: "",
      id_divisi: undefined as unknown as number,
      status: "pending",
      tanggal_mulai: new Date(),
      tenggat_waktu: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  })

  // Function untuk fetch data proyek dan divisi
  const getAllDataProyek = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.get<{ status: string; data: Proyek[] }>("/api/admin/getAllDataProyek")
      if (response.data.status === "success") {
        setProyek(response.data.data)
      } else {
        setError("Gagal memuat data proyek")
      }
    } catch (err) {
      console.error("Error fetching projects:", err)
      setError("Terjadi kesalahan saat memuat data proyek")
    } finally {
      setIsLoading(false)
    }
  }

  const getAllDataDivisi = async () => {
    try {
      const response = await axios.get<{ status: string; data: Divisi[] }>("/api/admin/getAllDataDivisi")
      if (response.data.status === "success") {
        setDivisi(response.data.data)
      }
    } catch (err) {
      console.error("Error fetching divisions:", err)
    }
  }

  // Fetch data when component mounts
  useEffect(() => {
    getAllDataDivisi()
    getAllDataProyek()
  }, [])

  // Filter dan pagination data
  useEffect(() => {
    // Filter data berdasarkan search term dan tab aktif
    const filtered = proyek.filter(
      (item) =>
        (item.nama_proyek.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.deskripsi && item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.divisi?.nama_divisi || "").toLowerCase().includes(searchTerm.toLowerCase())) &&
        (activeTab === "all" || item.status === activeTab),
    )

    setFilteredProyek(filtered)
    setTotalPages(Math.ceil(filtered.length / rowsPerPage))

    // Reset ke halaman pertama jika search term atau tab berubah
    if (currentPage > Math.ceil(filtered.length / rowsPerPage)) {
      setCurrentPage(1)
    }
  }, [proyek, searchTerm, rowsPerPage, currentPage, activeTab])

  // Mendapatkan data untuk halaman saat ini
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return filteredProyek.slice(startIndex, endIndex)
  }

  const navigateToTambahProyek = () => {
    router.visit("/kelola-data-proyek/tambah")
  }

  const navigateToKelolaPersetujuan = (id: number) => {
    router.visit(`/kelola-data-proyek/persetujuan/${id}`)
  }

  const navigateToDetailTugas = (id: number) => {
    router.visit(`/kelola-data-proyek/detail-tugas/${id}`)
  }

  const resetForm = () => {
    form.reset({
      nama_proyek: "",
      deskripsi: "",
      id_divisi: undefined as unknown as number,
      status: "pending",
      tanggal_mulai: new Date(),
      tenggat_waktu: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    })
    setIsEdit(false)
    setCurrentId(null)
  }

  const handleEditProyek = (id: number) => {
    const proyekToEdit = proyek.find((p) => p.id === id)
    if (proyekToEdit) {
      form.reset({
        nama_proyek: proyekToEdit.nama_proyek,
        deskripsi: proyekToEdit.deskripsi || "",
        id_divisi: proyekToEdit.id_divisi,
        status: proyekToEdit.status,
        tanggal_mulai: new Date(proyekToEdit.tanggal_mulai),
        tenggat_waktu: new Date(proyekToEdit.tenggat_waktu),
      })
      setIsEdit(true)
      setCurrentId(id)
      setDialogOpen(true)
    }
  }

  const handleDetailProyek = (id: number) => {
    const proyekToView = proyek.find((p) => p.id === id)
    if (proyekToView) {
      setSelectedProyek(proyekToView)
      setDetailDialogOpen(true)
    }
  }

  const handleHapusProyek = (id: number) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Proyek yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`/api/admin/deleteProyek`, { data: { id_proyek: id } })
          .then((response) => {
            getAllDataProyek()
            Swal.fire("Terhapus!", "Proyek telah berhasil dihapus.", "success")
          })
          .catch((error) => {
            Swal.fire("Gagal!", error.response?.data?.message || "Terjadi kesalahan saat menghapus proyek.", "error")
          })
      }
    })
  }

  // Tambahkan fungsi untuk menghitung progress otomatis berdasarkan status
  const getProgressByStatus = (status: string) => {
    switch (status) {
      case "pending":
        return 0
      case "in-progress":
        return 50
      case "waiting_for_review":
        return 75
      case "done":
        return 100
      default:
        return 0
    }
  }

  const onSubmit = async (data: FormValues) => {
    try {
      setError(null)

      // Hitung progress berdasarkan status
      const progress = getProgressByStatus(data.status)
      const submitData = {
        ...data,
        progress,
        tanggal_mulai: format(data.tanggal_mulai, "yyyy-MM-dd"),
        tenggat_waktu: format(data.tenggat_waktu, "yyyy-MM-dd"),
      }

      if (isEdit && currentId) {
        // SweetAlert konfirmasi sebelum update
        setDialogOpen(false)

        const result = await Swal.fire({
          title: "Apakah Anda yakin?",
          text: "Apakah Anda yakin untuk memperbarui data proyek?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Ya, Perbarui!",
          cancelButtonText: "Batal",
        })

        if (result.isConfirmed) {
          // Kirim permintaan update setelah konfirmasi
          const response = await axios.put(`/api/admin/updateProyek/${currentId}`, submitData)

          if (response.data.status === "success") {
            // Perbarui data proyek
            getAllDataProyek()

            // Tampilkan notifikasi sukses
            Swal.fire("Berhasil!", "Data proyek berhasil diperbarui.", "success")
            setDialogOpen(false)

            // Reset form setelah berhasil
            resetForm()
          }
        } else {
          setDialogOpen(true)
        }
      } else {
        // Tambah proyek baru
        const response = await axios.post("/api/admin/tambahProyek", submitData)

        if (response.data.status === "success") {
          // Refresh data setelah berhasil menambahkan
          getAllDataProyek()
          resetForm()
          setDialogOpen(false)

          Swal.fire("Berhasil!", "Proyek baru berhasil ditambahkan.", "success")
        }
      }
    } catch (err: any) {
      console.error("Error saving project:", err)

      // Handle validation errors from the API
      if (err.response?.status === 422 && err.response?.data?.errors) {
        // Set form errors based on API response
        const apiErrors = err.response.data.errors

        Object.keys(apiErrors).forEach((key) => {
          form.setError(key as any, {
            type: "server",
            message: Array.isArray(apiErrors[key]) ? apiErrors[key][0] : apiErrors[key],
          })
        })
      } else {
        // Set general error message
        setError(err.response?.data?.message || "Terjadi kesalahan saat menyimpan data proyek.")
        Swal.fire("Gagal!", err.response?.data?.message || "Terjadi kesalahan saat menyimpan data proyek.", "error")
      }
    }
  }

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = []
    const maxPagesToShow = 5 // Show at most 5 page numbers

    if (totalPages <= maxPagesToShow) {
      // If we have fewer pages than maxPagesToShow, show all pages
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink isActive={i === currentPage} onClick={() => handlePageChange(i)}>
              {i}
            </PaginationLink>
          </PaginationItem>,
        )
      }
    } else {
      // Always show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink isActive={1 === currentPage} onClick={() => handlePageChange(1)}>
            1
          </PaginationLink>
        </PaginationItem>,
      )

      // Calculate start and end of pagination range
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        endPage = Math.min(4, totalPages - 1)
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3)
      }

      // Show ellipsis if needed before middle pages
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }

      // Show middle pages
      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink isActive={i === currentPage} onClick={() => handlePageChange(i)}>
              {i}
            </PaginationLink>
          </PaginationItem>,
        )
      }

      // Show ellipsis if needed after middle pages
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }

      // Always show last page
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink isActive={totalPages === currentPage} onClick={() => handlePageChange(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    return items
  }

  // Calculate indices for displaying "Showing X to Y of Z entries"
  const indexOfFirstItem = filteredProyek.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
  const indexOfLastItem = Math.min(currentPage * rowsPerPage, filteredProyek.length)

  // Cek apakah proyek telat
  const isTelat = (proyek: Proyek) => {
    if (proyek.status === "done") return false
    return isAfter(new Date(), new Date(proyek.tenggat_waktu))
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

  // Render keterlambatan badge
  const renderTelatBadge = (proyek: Proyek) => {

    return isTelat(proyek) ? (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        <AlertCircle className="mr-1 h-3 w-3" /> Terlambat
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <Clock className="mr-1 h-3 w-3" /> Tepat Waktu
      </Badge>
    )
  }

  const handleExportData = async () => {
    try {
      const formattedStartDate = formatDate(exportDateRange.startDate, "yyyy-MM-dd")
      const formattedEndDate = formatDate(exportDateRange.endDate, "yyyy-MM-dd")

      // Show loading indicator
      Swal.fire({
        title: "Mengekspor data...",
        text: "Mohon tunggu sebentar",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      setExportDialogOpen(false)


      // Make API request to export data
      const response = await axios.get(`/api/admin/exportDataProyek`, {
        params: {
          tanggal_awal: formattedStartDate,
          tanggal_akhir: formattedEndDate,
        },
        responseType: "blob", // Important for file downloads
      })

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `proyek_${formattedStartDate}_${formattedEndDate}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      // Close loading indicator and dialog
      Swal.close()

      // Show success message
      Swal.fire({
        title: "Berhasil!",
        text: "Data proyek berhasil diekspor.",
        icon: "success",
        timer: 2000,
      })
    } catch (err) {
      console.error("Error exporting data:", err)
      Swal.fire({
        title: "Gagal!",
        text: "Terjadi kesalahan saat mengekspor data proyek.",
        icon: "error",
      }).then(() => {
        setExportDialogOpen(true)
      })

    }
  }

  return (
    <AdminLayout>
      <div className="p-1 md:p-6">
        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between">
          <h1 className="text-2xl font-bold md:mb-0 mb-3">Kelola Proyek</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setExportDialogOpen(true)}>
              <Download className="mr-2 h-4 w-4" /> Export Data
            </Button>
            <Button onClick={navigateToTambahProyek}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Proyek
            </Button>
          </div>
        </div>

        <div className="mb-4 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari proyek..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="waiting_for_review">Review</TabsTrigger>
              <TabsTrigger value="done">Selesai</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Proyek</CardTitle>
            <CardDescription>Daftar semua proyek dalam perusahaan</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Rows per page control */}
            <div className="flex justify-end mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Baris per halaman:</span>
                <Select
                  value={rowsPerPage.toString()}
                  onValueChange={(value) => setRowsPerPage(Number.parseInt(value))}
                >
                  <SelectTrigger className="w-16">
                    <SelectValue placeholder={rowsPerPage} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">No</TableHead>
                      <TableHead className="min-w-[200px]">Nama Proyek</TableHead>
                      <TableHead className="min-w-[150px]">Divisi</TableHead>
                      <TableHead className="min-w-[120px]">Status</TableHead>
                      <TableHead className="min-w-[120px]">Keterlambatan</TableHead>
                      <TableHead className="min-w-[150px]">Progress</TableHead>
                      <TableHead className="min-w-[120px]">Tanggal Mulai</TableHead>
                      <TableHead className="min-w-[120px]">Tanggal Selesai</TableHead>
                      <TableHead className="w-[100px] text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-6">
                          Memuat data proyek...
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-6 text-destructive">
                          {error}
                        </TableCell>
                      </TableRow>
                    ) : getCurrentPageData().length > 0 ? (
                      getCurrentPageData().map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.nama_proyek}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">{item.deskripsi}</p>
                            </div>
                          </TableCell>
                          <TableCell>{item.divisi?.nama_divisi || "Tidak ada divisi"}</TableCell>
                          <TableCell>{renderStatusBadge(item.status)}</TableCell>
                          <TableCell>{renderTelatBadge(item)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between text-xs">
                                <span>Progress</span>
                                <span className="font-medium">{item.progress}%</span>
                              </div>
                              <Progress value={item.progress} className="h-2" />
                            </div>
                          </TableCell>
                          <TableCell>{format(new Date(item.tanggal_mulai), "dd MMM yyyy", { locale: id })}</TableCell>
                          <TableCell>{format(new Date(item.tenggat_waktu), "dd MMM yyyy", { locale: id })}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Buka menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDetailProyek(item.id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>Detail</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigateToDetailTugas(item.id)}>
                                  <ListChecks className="mr-2 h-4 w-4" />
                                  <span>Detail Tugas</span>
                                </DropdownMenuItem>
                                {item.status === "waiting_for_review" && (
                                  <DropdownMenuItem onClick={() => navigateToKelolaPersetujuan(item.id)}>
                                    <CheckSquare className="mr-2 h-4 w-4" />
                                    <span>Kelola Persetujuan</span>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleEditProyek(item.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleHapusProyek(item.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Hapus</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-6">
                          {searchTerm || activeTab !== "all"
                            ? "Tidak ada proyek yang sesuai dengan filter"
                            : "Tidak ada data proyek"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>

          {/* Pagination */}
          {filteredProyek.length > 0 && (
            <CardFooter className="flex flex-col md:flex-row gap-2 border-t px-6 py-4">
              <div className="text-xs text-muted-foreground text-center">
                Menampilkan {indexOfFirstItem}-{indexOfLastItem} dari {filteredProyek.length} proyek
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {renderPaginationItems()}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          )}
        </Card>

        {/* Dialog Edit Proyek */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isEdit ? "Edit Proyek" : "Tambah Proyek Baru"}</DialogTitle>
              <DialogDescription>
                {isEdit ? "Ubah informasi proyek yang ada" : "Isi detail untuk menambahkan proyek baru"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <FormField
                  control={form.control}
                  name="nama_proyek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Proyek</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama proyek" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deskripsi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan deskripsi proyek" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="id_divisi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Divisi</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          defaultValue={field.value ? String(field.value) : undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih divisi" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {divisi.map((d) => (
                              <SelectItem key={d.id} value={String(d.id)}>
                                {d.nama_divisi}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="waiting_for_review">Menunggu Review</SelectItem>
                            <SelectItem value="done">Selesai</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Progress akan dihitung otomatis berdasarkan status</FormDescription>
                        <div className="text-xs text-muted-foreground mt-1">
                          <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></span>
                            <span>Pending: 0%</span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
                            <span>In Progress: 50%</span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></span>
                            <span>Menunggu Review: 75%</span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
                            <span>Selesai: 100%</span>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tanggal_mulai"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Tanggal Mulai</FormLabel>
                        <DatePicker selected={field.value} onSelect={field.onChange} className="" disabled={false} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tenggat_waktu"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Tanggal Selesai</FormLabel>
                        <DatePicker selected={field.value} onSelect={field.onChange} className="" disabled={false} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter className="pt-4">
                  <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit">{isEdit ? "Simpan Perubahan" : "Tambah Proyek"}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Dialog Detail Proyek */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Detail Proyek</DialogTitle>
              <DialogDescription>Informasi lengkap mengenai proyek</DialogDescription>
            </DialogHeader>
            {selectedProyek && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="font-medium">ID:</div>
                  <div>{selectedProyek.id}</div>

                  <div className="font-medium">Nama Proyek:</div>
                  <div>{selectedProyek.nama_proyek}</div>

                  <div className="font-medium">Deskripsi:</div>
                  <div>{selectedProyek.deskripsi || "Tidak ada deskripsi"}</div>

                  <div className="font-medium">Divisi:</div>
                  <div>{selectedProyek.divisi?.nama_divisi || "Tidak ada divisi"}</div>

                  <div className="font-medium">Status:</div>
                  <div>{renderStatusBadge(selectedProyek.status)}</div>

                  <div className="font-medium">Progress:</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{selectedProyek.progress}%</span>
                      <Progress value={selectedProyek.progress} className="h-2 w-20" />
                    </div>
                  </div>

                  <div className="font-medium">Tanggal Mulai:</div>
                  <div>{format(new Date(selectedProyek.tanggal_mulai), "dd MMMM yyyy", { locale: id })}</div>

                  <div className="font-medium">Tanggal Selesai:</div>
                  <div>{format(new Date(selectedProyek.tenggat_waktu), "dd MMMM yyyy", { locale: id })}</div>

                  <div className="font-medium">Status Keterlambatan:</div>
                  <div>{renderTelatBadge(selectedProyek)}</div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setDetailDialogOpen(false)}>Tutup</Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog Export Data */}
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Export Data Proyek</DialogTitle>
              <DialogDescription>Pilih rentang tanggal untuk mengekspor data proyek</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Tanggal Mulai</Label>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <DatePicker
                      selected={exportDateRange.startDate}
                      onSelect={(date) => setExportDateRange({ ...exportDateRange, startDate: date || new Date() })}
                      className="w-full"
                      disabled={false}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pilih tanggal awal untuk rentang data yang akan diekspor
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Tanggal Akhir</Label>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <DatePicker
                      selected={exportDateRange.endDate}
                      onSelect={(date) => setExportDateRange({ ...exportDateRange, endDate: date || new Date() })}
                      className="w-full"
                      disabled={false}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pilih tanggal akhir untuk rentang data yang akan diekspor
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                Batal
              </Button>
              <Button
                onClick={handleExportData}
                disabled={
                  !exportDateRange.startDate ||
                  !exportDateRange.endDate ||
                  isAfter(exportDateRange.startDate, exportDateRange.endDate)
                }
              >
                <Download className="mr-2 h-4 w-4" /> Export Data
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

