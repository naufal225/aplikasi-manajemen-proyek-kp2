"use client"

import { useState, useEffect } from "react"
import { Edit, Plus, Trash2, Search, MoreVertical, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
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
import axios from "axios"
import { AdminLayout } from "@/layouts/admin-layout"
import { router } from "@inertiajs/react"
import Swal from "sweetalert2"

// Define interfaces for the models
import { Divisi } from "@/models/Models"

import { KaryawanForDivisi } from "@/models/Models"

// Schema validasi untuk form divisi
const divisiFormSchema = z.object({
  nama_divisi: z.string().min(2, {
    message: "Nama divisi harus minimal 2 karakter.",
  }),
  deskripsi: z.string().optional(),
  id_manajer: z.number().nullable(),
  id_divisi: z.number(),
})

export default function KelolaDivisi() {
  const [divisi, setDivisi] = useState<Divisi[]>([])

  // Data karyawan untuk dropdown manajer
  const [karyawan, setKaryawan] = useState<KaryawanForDivisi[]>([])

  // State untuk pagination dan search
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredDivisi, setFilteredDivisi] = useState<Divisi[]>([])
  const [totalPages, setTotalPages] = useState(1)

  const [isEdit, setIsEdit] = useState(false)
  const [currentId, setCurrentId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Tambahkan fungsi handleDetailDivisi dan state untuk dialog detail
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedDivisi, setSelectedDivisi] = useState<Divisi>()

   const [error, setError] = useState<string | null>(null)

  // Inisialisasi form dengan react-hook-form dan zod
  const form = useForm({
    resolver: zodResolver(divisiFormSchema),
    defaultValues: {
      nama_divisi: "",
      deskripsi: "",
      id_manajer: null,
      id_divisi: 0,
    },
  })

  //mendapatkan data divisi dari api
  const getAllDataDivisi = async () => {
    axios
      .get<{ status: string; data: Divisi[] }>("/api/admin/getAllDataDivisi")
      .then((response) => {
        if (response.data.status == "success") {
          setDivisi(response.data.data)
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const getAllDataKaryawanForDivisi = async () => {
    axios
      .get<{ status: string; data: KaryawanForDivisi[] }>("/api/admin/getAllDataKaryawanForDivisi")
      .then((response) => {
        if (response.data.status == "success") {
          setKaryawan(response.data.data)
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }

  // Filter dan pagination data
  useEffect(() => {
    // Filter data berdasarkan search term
    const filtered = divisi.filter(
      (item) =>
        item.nama_divisi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nama_manajer?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    setFilteredDivisi(filtered)
    setTotalPages(Math.ceil(filtered.length / rowsPerPage))

    // Reset ke halaman pertama jika search term berubah
    if (currentPage > Math.ceil(filtered.length / rowsPerPage)) {
      setCurrentPage(1)
    }
  }, [divisi, searchTerm, rowsPerPage, currentPage])

  // Fetch data when component mounts
  useEffect(() => {
    getAllDataDivisi()
    getAllDataKaryawanForDivisi()
  }, [])

  // Mendapatkan data untuk halaman saat ini
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return filteredDivisi.slice(startIndex, endIndex)
  }

  // Mendapatkan karyawan yang tersedia sebagai manajer
  const getAvailableManagers = () => {
    // Kumpulkan semua ID manajer yang sudah ada
    const existingManagerIds = divisi
      .filter((d) => d.id !== currentId) // Jangan sertakan divisi yang sedang diedit
      .map((d) => d.id_manajer)
      .filter((id) => id !== null)

    // Filter karyawan yang belum menjadi manajer atau adalah manajer dari divisi yang sedang diedit
    return karyawan.filter((k) => !existingManagerIds.includes(k.id))
  }

  // Menghitung jumlah karyawan per divisi
  const getJumlahKaryawan = (divisiId: number) => {
    return karyawan.filter((k) => k.divisi?.id === divisiId).length
  }

  const navigateToTambahDivisi = () => {
    window.location.href = "/kelola-data-divisi/tambah"
  }

  const resetForm = () => {
    form.reset({
      nama_divisi: "",
      deskripsi: "",
      id_manajer: null,
      id_divisi: 0,
    })
    setIsEdit(false)
    setCurrentId(null)
  }

  const handleEditDivisi = (id: number) => {
    const divisiToEdit = divisi.find((d) => d.id === id)
    if (divisiToEdit) {
      form.reset({
        nama_divisi: divisiToEdit.nama_divisi,
        deskripsi: divisiToEdit.deskripsi || "",
        id_manajer: divisiToEdit.id_manajer || null,
        id_divisi: divisiToEdit.id,
      })
      setIsEdit(true)
      setCurrentId(id)
      setDialogOpen(true)
      setSelectedDivisi(divisiToEdit)
    }
  }

  const handleHapusDivisi = (id: number | string) => {
        Swal.fire({
            title: "Apakah Anda yakin?",
            text: "Divisi yang dihapus tidak dapat dikembalikan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, hapus!",
            cancelButtonText: "Batal"
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`/api/admin/deleteDivisi`, { data: { id_divisi: id } })
                    .then((response) => {
                        getAllDataDivisi()
                        Swal.fire(
                            "Terhapus!",
                            "Divisi telah berhasil dihapus.",
                            "success"
                        );
                    })
                    .catch((error) => {
                        Swal.fire(
                            "Gagal!",
                            error.response?.data?.message || "Terjadi kesalahan saat menghapus divisi.",
                            "error"
                        );
                    });
            }
        });
    };

//   const onSubmitEdit = async (data: any) => {
//     axios
//       .put("/api/admin/updateDataDivisi", data)
//       .then((response) => {
//         if (response.data.status == "success") {
//           router.visit("/kelola-data-divisi")
//           Swal.fire({
//             title: "Berhasil!",
//             text: "Berhasil memperbarui data divisi",
//             icon: "success",
//             confirmButtonText: "Ok",
//           })
//         }
//       })
//       .catch((err) => {
//         console.error(err)
//       })
//   }

  const onSubmitEdit = async (data: any) => {
    try {
            setError(null);

            if (isEdit && currentId) {
                // SweetAlert konfirmasi sebelum update
                setDialogOpen(false)

                const result = await Swal.fire({
                    title: "Apakah Anda yakin?",
                    text: "Apakah Anda yakin untuk memperbarui data divisi?!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#3085d6",
                    confirmButtonText: "Ya, Perbarui!",
                    cancelButtonText: "Batal"
                });

                if (result.isConfirmed) {
                    // Kirim permintaan update setelah konfirmasi
                    const response = await axios.put(`/api/admin/updateDataDivisi`, data);

                    if (response.data.status === "success") {
                        // Perbarui data divisi
                        getAllDataDivisi();

                        // Tampilkan notifikasi sukses
                        Swal.fire("Berhasil!", "Data divisi berhasil diperbarui.", "success");
                        setDialogOpen(false);

                        // Reset form setelah berhasil
                        resetForm();
                    }
                } else {
                    setDialogOpen(true)
                }
            }
        } catch (err: any) {
            console.error("Error saving employee:", err);

            // Tangani error validasi dari API
            if (err.response?.status === 422 && err.response?.data?.errors) {
                const apiErrors = err.response.data.errors;

                Object.keys(apiErrors).forEach((key) => {
                    form.setError(key as any, {
                        type: "server",
                        message: Array.isArray(apiErrors[key]) ? apiErrors[key][0] : apiErrors[key],
                    });
                });
            } else {
                setError(err.response?.data?.message || "Terjadi kesalahan saat menyimpan data karyawan.");
                Swal.fire("Gagal!", err.response?.data?.message || "Terjadi kesalahan saat menyimpan data karyawan.", "error");
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
  const indexOfFirstItem = (currentPage - 1) * rowsPerPage + 1
  const indexOfLastItem = Math.min(currentPage * rowsPerPage, filteredDivisi.length)

  const handleDetailDivisi = (id: number) => {
    const divisiToView = divisi.find((d) => d.id === id)
    if (divisiToView) {
      setSelectedDivisi(divisiToView)
      setDetailDialogOpen(true)
    }
  }

  return (
    <AdminLayout>
      <div className="p-1 md:p-6">
        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between">
          <h1 className="text-2xl font-bold md:mb-0 mb-3">Kelola Divisi</h1>
          <Button onClick={navigateToTambahDivisi}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Divisi
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Divisi</CardTitle>
            <CardDescription>Daftar semua divisi dalam perusahaan</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and rows per page controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari divisi..."
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
                      <TableHead className="min-w-[180px]">Nama Divisi</TableHead>
                      <TableHead className="min-w-[250px]">Deskripsi</TableHead>
                      <TableHead className="min-w-[180px]">Nama Manajer</TableHead>
                      <TableHead className="min-w-[120px]">Jumlah Proyek</TableHead>
                      <TableHead className="min-w-[120px]">Jumlah Karyawan</TableHead>
                      <TableHead className="w-[150px] text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getCurrentPageData().length > 0 ? (
                      getCurrentPageData().map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                          <TableCell className="font-medium">{item.nama_divisi}</TableCell>
                          <TableCell>{item.deskripsi || "Tidak ada deskripsi"}</TableCell>
                          <TableCell>{item.nama_manajer || "Tidak ada manajer"}</TableCell>
                          <TableCell>{item.jumlah_proyek}</TableCell>
                          <TableCell>{item.jumlah_karyawan}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Buka menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDetailDivisi(item.id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>Detail</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditDivisi(item.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleHapusDivisi(item.id)}
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
                          {searchTerm ? "Tidak ada divisi yang sesuai dengan pencarian" : "Tidak ada data divisi"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>

          {/* Pagination */}
          {filteredDivisi.length > 0 && (
            <CardFooter className="flex flex-col md:flex-row gap-2 border-t px-6 py-4">
              <div className="text-xs text-muted-foreground text-center">
                Menampilkan {indexOfFirstItem}-{indexOfLastItem} dari {filteredDivisi.length} divisi
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

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Divisi</DialogTitle>
              <DialogDescription>Ubah informasi divisi yang ada</DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4 py-2">
                <FormField
                  control={form.control}
                  name="nama_divisi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Divisi</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama divisi" {...field} />
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
                        <Input placeholder="Masukkan deskripsi divisi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="id_manajer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Manajer</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === "null" ? null : Number(value))}
                        defaultValue={field.value ? String(field.value) : "null"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih manajer divisi" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="null">Tidak ada manajer</SelectItem>
                          {karyawan
                            .filter((manager) => {
                              // Include employees who:
                              // 1. Don't have a division (null/undefined)
                              // 2. Belong to the current division being edited
                              // 3. Are already the manager of this division (id_manajer matches)
                              return (
                                !manager.divisi ||
                                manager.divisi.id === currentId ||
                                manager.id === selectedDivisi?.id_manajer
                              )
                            })
                            .map((manager) => (
                              <SelectItem key={manager.id} value={String(manager.id)}>
                                {manager.nama_karyawan}{" "}
                                {manager.divisi ? `- ${manager.divisi.nama_divisi}` : "(Belum ada divisi)"}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Hanya menampilkan karyawan yang belum memiliki divisi atau sudah berada di divisi ini
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Hidden field for division ID */}
                <FormField
                  control={form.control}
                  name="id_divisi"
                  render={({ field }) => <input type="hidden" {...field} />}
                />

                <DialogFooter className="pt-4">
                  <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit">Simpan Perubahan</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detail Divisi</DialogTitle>
              <DialogDescription>Informasi lengkap mengenai divisi</DialogDescription>
            </DialogHeader>
            {selectedDivisi && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">ID:</div>
                  <div>{selectedDivisi.id}</div>

                  <div className="font-medium">Nama Divisi:</div>
                  <div>{selectedDivisi.nama_divisi}</div>

                  <div className="font-medium">Deskripsi:</div>
                  <div>{selectedDivisi.deskripsi ? selectedDivisi.deskripsi : "Tidak ada deskripsi"}</div>

                  <div className="font-medium">Manajer:</div>
                  <div>{selectedDivisi.nama_manajer || "Tidak ada manajer"}</div>

                  <div className="font-medium">Jumlah Karyawan:</div>
                  <div>{getJumlahKaryawan(selectedDivisi.id)}</div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setDetailDialogOpen(false)}>Tutup</Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

