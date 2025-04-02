"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Edit,
  Plus,
  Trash2,
  Search,
  MoreVertical,
  Eye,
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import axios from "axios"
import { AdminLayout } from "@/layouts/admin-layout"
import type { Karyawan, Divisi } from "@/models/Models"
import Swal from "sweetalert2"

// Schema validasi untuk form karyawan
const karyawanFormSchema = z
  .object({
    id: z.number().nullable(),
    nama_lengkap: z.string().min(3, "Nama lengkap minimal 3 karakter"),
    id_divisi: z.number().nullable(),
    email: z.string().email("Format email tidak valid"),
    alamat: z.string().min(5, "Alamat minimal 5 karakter"),
    jenis_kelamin: z.enum(["LAKI-LAKI", "PEREMPUAN"], {
      errorMap: () => ({ message: "Jenis kelamin harus 'LAKI-LAKI' atau 'PEREMPUAN'" }),
    }),
    nomor_telepon: z.string().min(10, "Nomor telepon tidak valid"),
    username: z.string().min(3, "Username minimal 3 karakter"),
    tanggal_lahir: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal lahir harus YYYY-MM-DD"),
    password: z.string().min(8, "Password minimal 8 karakter").optional(),
    password_confirmation: z.string().optional(),
  })
  .refine(
    (data) => {
      // Only validate if password is provided (for editing)
      if (data.password && data.password.length > 0) {
        return data.password === data.password_confirmation
      }
      return true
    },
    {
      message: "Password dan konfirmasi password tidak cocok",
      path: ["password_confirmation"],
    },
  )

type FormValues = z.infer<typeof karyawanFormSchema>

export default function KelolaKaryawan() {
  // State untuk data karyawan dan divisi
  const [karyawan, setKaryawan] = useState<Karyawan[]>([])
  const [divisi, setDivisi] = useState<Divisi[]>([])

  // State untuk pagination dan search
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredKaryawan, setFilteredKaryawan] = useState<Karyawan[]>([])
  const [totalPages, setTotalPages] = useState(1)

  // State untuk dialog dan form
  const [isEdit, setIsEdit] = useState(false)
  const [currentId, setCurrentId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedKaryawan, setSelectedKaryawan] = useState<Karyawan | undefined>()

  // State untuk import data
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importStatus, setImportStatus] = useState({ show: false, success: false, message: "" })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Inisialisasi form dengan react-hook-form dan zod
  const form = useForm<FormValues>({
    resolver: zodResolver(karyawanFormSchema),
    defaultValues: {
      id: null,
      nama_lengkap: "",
      id_divisi: null,
      email: "",
      alamat: "",
      jenis_kelamin: "LAKI-LAKI",
      nomor_telepon: "",
      username: "",
      tanggal_lahir: "",
      password: "",
      password_confirmation: "",
    },
  })

  // Function untuk fetch data karyawan dan divisi
  const getAllDataKaryawan = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.get<{ status: string; data: Karyawan[] }>("/api/admin/getAllDataKaryawan")
      if (response.data.status === "success") {
        setKaryawan(response.data.data)
      } else {
        setError("Gagal memuat data karyawan")
      }
    } catch (err) {
      console.error("Error fetching employees:", err)
      setError("Terjadi kesalahan saat memuat data karyawan")
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
    getAllDataKaryawan()
  }, [])

  // Filter dan pagination data
  useEffect(() => {
    // Filter data berdasarkan search term
    const filtered = karyawan.filter(
      (item) =>
        item.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nomor_telepon.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.divisi?.nama_divisi || "").toLowerCase().includes(searchTerm.toLowerCase()),
    )

    setFilteredKaryawan(filtered)
    setTotalPages(Math.ceil(filtered.length / rowsPerPage))

    // Reset ke halaman pertama jika search term berubah
    if (currentPage > Math.ceil(filtered.length / rowsPerPage)) {
      setCurrentPage(1)
    }
  }, [karyawan, searchTerm, rowsPerPage, currentPage])

  // Mendapatkan data untuk halaman saat ini
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return filteredKaryawan.slice(startIndex, endIndex)
  }

  const navigateToTambahKaryawan = () => {
    window.location.href = "/karyawan/tambah"
  }

  // Update the resetForm function to include password
  const resetForm = () => {
    form.reset({
      id: null,
      nama_lengkap: "",
      id_divisi: null,
      email: "",
      alamat: "",
      jenis_kelamin: "LAKI-LAKI",
      nomor_telepon: "",
      username: "",
      tanggal_lahir: "",
      password: "",
      password_confirmation: "",
    })
    setIsEdit(false)
    setCurrentId(null)
  }

  const handleEditKaryawan = (id: number | null) => {
    if (id === null) return

    const karyawanToEdit = karyawan.find((k) => k.id === id)
    if (karyawanToEdit) {
      form.reset({
        id: karyawanToEdit.id,
        nama_lengkap: karyawanToEdit.nama_lengkap,
        id_divisi: karyawanToEdit.divisi?.id || null,
        email: karyawanToEdit.email,
        alamat: karyawanToEdit.alamat,
        jenis_kelamin: karyawanToEdit.jenis_kelamin as "LAKI-LAKI" | "PEREMPUAN",
        nomor_telepon: karyawanToEdit.nomor_telepon,
        username: karyawanToEdit.username,
        tanggal_lahir: karyawanToEdit.tanggal_lahir,
        password: "", // Reset password field when editing
        password_confirmation: "", // Reset password confirmation field when editing
      })
      setIsEdit(true)
      setCurrentId(id)
      setDialogOpen(true)
    }
  }

  const handleDetailKaryawan = (id: number | null) => {
    if (id === null) return

    const karyawanToView = karyawan.find((k) => k.id === id)
    if (karyawanToView) {
      setSelectedKaryawan(karyawanToView)
      setDetailDialogOpen(true)
    }
  }

  const handleHapusKaryawan = (id: number | null) => {
    if (id === null) return

    setCurrentId(id)
    setDeleteDialogOpen(true)
  }

  const konfirmasiHapusKaryawan = async () => {
    if (currentId === null) return

    try {
      // Implementasi API call untuk menghapus karyawan
      const response = await axios.delete(`/api/admin/deleteKaryawan/${currentId}`)

      if (response.data.status === "success") {
        // Update state setelah berhasil menghapus
        setKaryawan((prev) => prev.filter((k) => k.id !== currentId))
        setDeleteDialogOpen(false)
        setCurrentId(null)
      } else {
        // Handle error
        console.error("Failed to delete employee:", response.data.message)
      }
    } catch (err) {
      console.error("Error deleting employee:", err)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setImportStatus({ show: false, success: false, message: "" })
    }
  }

  // Update the handleImportData function to properly handle the file upload and check for empty files
  const handleImportData = () => {
    if (!selectedFile) {
      setImportStatus({
        show: true,
        success: false,
        message: "Silakan pilih file Excel terlebih dahulu.",
      })
      return
    }

    // Check if file is empty (this is a basic check, the server will do more thorough validation)
    if (selectedFile.size === 0) {
      setImportStatus({
        show: true,
        success: false,
        message: "File Excel kosong. Silakan pilih file yang berisi data.",
      })
      return
    }

    // Create FormData for file upload
    const formData = new FormData()
    formData.append("file", selectedFile)

    // Set loading state
    setImportStatus({
      show: true,
      success: true,
      message: "Sedang mengimpor data...",
    })

    // Close the dialog and show confirmation
    setImportDialogOpen(false)

    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Apakah Anda yakin data karyawan sudah benar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Simpan!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        // Show loading indicator
        Swal.fire({
          title: "Mengimpor data...",
          text: "Mohon tunggu sebentar",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading()
          },
        })

        axios
          .post(`/api/admin/importDataKaryawan`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((response) => {
            if (response.data.status === "success") {
              getAllDataKaryawan()
              Swal.fire("Berhasil!", "Data karyawan telah berhasil diimpor.", "success")
              setImportStatus({
                show: false,
                success: true,
                message: "Berhasil Import Data",
              })
              setSelectedFile(null)
            } else {
              Swal.fire("Gagal!", response?.data?.message || "Terjadi kesalahan saat import data karyawan.", "error")
              setImportStatus({
                show: false,
                success: false,
                message: "Gagal Import Data",
              })
            }
          })
          .catch((error) => {
            console.error("Import error:", error)
            Swal.fire(
              "Gagal!",
              error.response?.data?.message || "Terjadi kesalahan saat import data karyawan.",
              "error",
            )
            setImportStatus({
              show: false,
              success: false,
              message: "Gagal Import Data",
            })
          })
      } else {
        setImportDialogOpen(true)
      }
    })
  }

  const handleDownloadTemplate = () => {
    // Implementasi download template
    window.open("/api/admin/downloadTemplateKaryawan", "_blank")
  }

  const onSubmit = async (data: FormValues) => {
    try {
      setError(null)

      // Remove password_confirmation before sending to API
      const { password_confirmation, ...submitData } = data

      if (isEdit && currentId) {
        // Update existing employee
        const response = await axios.put(`/api/admin/updateKaryawan/${currentId}`, submitData)

        if (response.data.status === "success") {
          // Refresh data after successful update
          getAllDataKaryawan()
          resetForm()
          setDialogOpen(false)
        }
      } else {
        // Add new employee
        const response = await axios.post("/api/admin/tambahKaryawan", submitData)

        if (response.data.status === "success") {
          // Refresh data after successful addition
          getAllDataKaryawan()
          resetForm()
          setDialogOpen(false)
        }
      }
    } catch (err: any) {
      console.error("Error saving employee:", err)

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
        setError(err.response?.data?.message || "Terjadi kesalahan saat menyimpan data karyawan.")
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
  const indexOfFirstItem = filteredKaryawan.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
  const indexOfLastItem = Math.min(currentPage * rowsPerPage, filteredKaryawan.length)

  return (
    <AdminLayout>
      <div className="p-1 md:p-6">
        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between">
          <h1 className="text-2xl font-bold md:mb-0 mb-3">Kelola Karyawan</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" /> Import Data
            </Button>
            <Button onClick={navigateToTambahKaryawan}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Karyawan
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Karyawan</CardTitle>
            <CardDescription>Daftar semua karyawan dalam perusahaan</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and rows per page controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari karyawan..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
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
                      <TableHead className="min-w-[180px]">Nama</TableHead>
                      <TableHead className="min-w-[200px]">Email</TableHead>
                      <TableHead className="min-w-[150px]">Divisi</TableHead>
                      <TableHead className="min-w-[150px]">No. Telepon</TableHead>
                      <TableHead className="w-[150px] text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6">
                          Memuat data karyawan...
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-destructive">
                          {error}
                        </TableCell>
                      </TableRow>
                    ) : getCurrentPageData().length > 0 ? (
                      getCurrentPageData().map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                          <TableCell className="font-medium">{item.nama_lengkap}</TableCell>
                          <TableCell>{item.email}</TableCell>
                          <TableCell>{item.divisi?.nama_divisi || "Tidak ada divisi"}</TableCell>
                          <TableCell>{item.nomor_telepon}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Buka menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDetailKaryawan(item.id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>Detail</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditKaryawan(item.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleHapusKaryawan(item.id)}
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
                        <TableCell colSpan={6} className="text-center py-6">
                          {searchTerm ? "Tidak ada karyawan yang sesuai dengan pencarian" : "Tidak ada data karyawan"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>

          {/* Pagination */}
          {filteredKaryawan.length > 0 && (
            <CardFooter className="flex flex-col md:flex-row gap-2 border-t px-6 py-4">
              <div className="text-xs text-muted-foreground text-center">
                Menampilkan {indexOfFirstItem}-{indexOfLastItem} dari {filteredKaryawan.length} karyawan
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

        {/* Dialog Edit Karyawan */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{isEdit ? "Edit Karyawan" : "Tambah Karyawan Baru"}</DialogTitle>
              <DialogDescription>
                {isEdit ? "Ubah informasi karyawan yang ada" : "Isi detail untuk menambahkan karyawan baru"}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nama_lengkap"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nama lengkap" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Masukkan alamat email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nomor_telepon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Telepon</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nomor telepon" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jenis_kelamin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Kelamin</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih jenis kelamin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LAKI-LAKI">Laki-laki</SelectItem>
                            <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tanggal_lahir"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Lahir</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="alamat"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Alamat</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan alamat" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="id_divisi"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Divisi</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value === "null" ? null : Number(value))}
                          defaultValue={field.value ? String(field.value) : "null"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih divisi" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="null">Tidak Ada Divisi</SelectItem>
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
                    name="password"
                    render={({ field }) => (
                      <FormItem className="md:col-span-1">
                        <FormLabel>{isEdit ? "Password (Kosongkan jika tidak ingin mengubah)" : "Password"}</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder={isEdit ? "Kosongkan jika tidak ingin mengubah password" : "Masukkan password"}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password_confirmation"
                    render={({ field }) => (
                      <FormItem className="md:col-span-1">
                        <FormLabel>Konfirmasi Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Konfirmasi password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter className="pt-4">
                  <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit">{isEdit ? "Simpan Perubahan" : "Tambah Karyawan"}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Dialog Detail Karyawan */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Detail Karyawan</DialogTitle>
              <DialogDescription>Informasi lengkap mengenai karyawan</DialogDescription>
            </DialogHeader>
            {selectedKaryawan && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="font-medium">ID:</div>
                  <div>{selectedKaryawan.id}</div>

                  <div className="font-medium">Nama Lengkap:</div>
                  <div>{selectedKaryawan.nama_lengkap}</div>

                  <div className="font-medium">Username:</div>
                  <div>{selectedKaryawan.username}</div>

                  <div className="font-medium">Email:</div>
                  <div>{selectedKaryawan.email}</div>

                  <div className="font-medium">Jenis Kelamin:</div>
                  <div>{selectedKaryawan.jenis_kelamin}</div>

                  <div className="font-medium">Tanggal Lahir:</div>
                  <div>{selectedKaryawan.tanggal_lahir}</div>

                  <div className="font-medium">Nomor Telepon:</div>
                  <div>{selectedKaryawan.nomor_telepon}</div>

                  <div className="font-medium">Alamat:</div>
                  <div>{selectedKaryawan.alamat}</div>

                  <div className="font-medium">Divisi:</div>
                  <div>{selectedKaryawan.divisi?.nama_divisi || "Tidak ada divisi"}</div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setDetailDialogOpen(false)}>Tutup</Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog Konfirmasi Hapus */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Karyawan</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus karyawan ini? Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Batal
              </Button>
              <Button variant="destructive" onClick={konfirmasiHapusKaryawan}>
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Import Data */}
        <Dialog
          open={importDialogOpen}
          onOpenChange={(open) => {
            setImportDialogOpen(open)
            if (!open) {
              setSelectedFile(null)
              setImportStatus({ show: false, success: false, message: "" })
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Data Karyawan</DialogTitle>
              <DialogDescription>
                Upload file Excel yang berisi data karyawan untuk diimpor ke sistem.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Card className="border-dashed border-2">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center space-y-2 text-center">
                    <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
                    <div className="text-sm font-medium">
                      {selectedFile ? selectedFile.name : "Pilih file Excel untuk diupload"}
                    </div>
                    <div className="text-xs text-muted-foreground">Format yang didukung: .xlsx, .xls (maks. 5MB)</div>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <Button variant="outline" type="button" className="mt-2">
                        <Upload className="mr-2 h-4 w-4" /> Pilih File
                      </Button>
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Belum memiliki template? Download template Excel di bawah ini.
                </div>
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                  <Download className="mr-2 h-4 w-4" /> Template Excel
                </Button>
              </div>

              {importStatus.show && (
                <Alert variant={importStatus.success ? "default" : "destructive"}>
                  <AlertDescription>{importStatus.message}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleImportData} disabled={!selectedFile}>
                Import Data
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

