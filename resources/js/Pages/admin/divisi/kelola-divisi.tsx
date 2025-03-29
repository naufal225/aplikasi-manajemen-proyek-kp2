"use client"

import { useState } from "react"
import { Edit, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { AdminLayout } from "@/layouts/admin-layout"

import { router } from "@inertiajs/react"

// Schema validasi untuk form divisi
const divisiFormSchema = z.object({
  nama: z.string().min(2, {
    message: "Nama divisi harus minimal 2 karakter.",
  }),
  deskripsi: z.string().optional(),
  manajerId: z.string().nullable(),
})

export default function KelolaDivisi() {
  const [divisi, setDivisi] = useState([
    {
      id: 1,
      nama: "Pengembangan",
      deskripsi: "Divisi pengembangan perangkat lunak",
      manajerId: "1",
      manajer: "Ahmad Fauzi",
    },
    {
      id: 2,
      nama: "Pemasaran",
      deskripsi: "Divisi pemasaran dan penjualan",
      manajerId: "2",
      manajer: "Siti Rahayu",
    },
    {
      id: 3,
      nama: "Keuangan",
      deskripsi: "Divisi keuangan dan akuntansi",
      manajerId: "3",
      manajer: "Budi Santoso",
    },
  ])

  // Data karyawan untuk dropdown manajer
  const [karyawan, setKaryawan] = useState([
    { id: 1, nama: "Ahmad Fauzi", divisiId: 1, jabatan: "Senior Developer" },
    { id: 2, nama: "Siti Rahayu", divisiId: 2, jabatan: "Marketing Manager" },
    { id: 3, nama: "Budi Santoso", divisiId: 3, jabatan: "Finance Manager" },
    { id: 4, nama: "Dewi Anggraini", divisiId: null, jabatan: "HR Manager" },
    { id: 5, nama: "Eko Prasetyo", divisiId: null, jabatan: "IT Support" },
    { id: 6, nama: "Fitri Handayani", divisiId: 1, jabatan: "UI/UX Designer" },
    { id: 7, nama: "Gunawan Wibowo", divisiId: 2, jabatan: "Sales Executive" },
    { id: 8, nama: "Hadi Santoso", divisiId: 1, jabatan: "Backend Developer" },
    { id: 9, nama: "Indah Permata", divisiId: 3, jabatan: "Accountant" },
    { id: 10, nama: "Joko Widodo", divisiId: null, jabatan: "Business Analyst" },
  ])

  const [isEdit, setIsEdit] = useState(false)
  const [currentId, setCurrentId] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Inisialisasi form dengan react-hook-form dan zod
  const form = useForm({
    resolver: zodResolver(divisiFormSchema),
    defaultValues: {
      nama: "",
      deskripsi: "",
      manajerId: null,
    },
  })

  // Mendapatkan karyawan yang tersedia sebagai manajer (belum menjadi manajer di divisi lain)
  const getAvailableManagers = () => {
    // Kumpulkan semua ID manajer yang sudah ada
    const existingManagerIds = divisi
      .filter((d) => d.id !== currentId) // Jangan sertakan divisi yang sedang diedit
      .map((d) => d.manajerId)
      .filter((id) => id !== null)

    // Filter karyawan yang belum menjadi manajer atau adalah manajer dari divisi yang sedang diedit
    return karyawan.filter((k) => !existingManagerIds.includes(String(k.id)))
  }

  // Menghitung jumlah karyawan per divisi
  const getJumlahKaryawan = (divisiId: number) => {
    return karyawan.filter((k) => k.divisiId === divisiId).length
  }

  const navigateToTambahDivisi = () => {
    router.visit("/divisi/tambah")
  }

  const resetForm = () => {
    form.reset({
      nama: "",
      deskripsi: "",
      manajerId: null,
    })
    setIsEdit(false)
    setCurrentId(null)
  }

  const handleEditDivisi = (id) => {
    const divisiToEdit = divisi.find((d) => d.id === id)
    if (divisiToEdit) {
      form.reset({
        nama: divisiToEdit.nama,
        deskripsi: divisiToEdit.deskripsi || "",
        manajerId: divisiToEdit.manajerId || null,
      })
      setIsEdit(true)
      setCurrentId(id)
      setDialogOpen(true)
    }
  }

  const handleHapusDivisi = (id) => {
    setCurrentId(id)
    setDeleteDialogOpen(true)
  }

  const konfirmasiHapusDivisi = () => {
    if (currentId) {
      // Bebaskan karyawan dari divisi yang dihapus
      setKaryawan((prev) => prev.map((k) => (k.divisiId === currentId ? { ...k, divisiId: null } : k)))

      setDivisi((prev) => prev.filter((d) => d.id !== currentId))
      setDeleteDialogOpen(false)
      setCurrentId(null)
    }
  }

  const onSubmit = (data) => {
    // Dapatkan nama manajer jika ada
    const selectedManager = data.manajerId ? karyawan.find((k) => String(k.id) === data.manajerId) : null

    const newDivisiData = {
      ...data,
      manajer: selectedManager ? selectedManager.nama : null,
    }

    if (isEdit && currentId) {
      setDivisi((prev) => prev.map((item) => (item.id === currentId ? { ...item, ...newDivisiData } : item)))

      // Update divisiId karyawan jika manajer berubah
      if (data.manajerId) {
        setKaryawan((prev) => prev.map((k) => (String(k.id) === data.manajerId ? { ...k, divisiId: currentId } : k)))
      }
    } else {
      const newId = Math.max(0, ...divisi.map((d) => d.id)) + 1
      setDivisi((prev) => [...prev, { id: newId, ...newDivisiData }])

      // Update divisiId karyawan jika manajer dipilih
      if (data.manajerId) {
        setKaryawan((prev) => prev.map((k) => (String(k.id) === data.manajerId ? { ...k, divisiId: newId } : k)))
      }
    }

    resetForm()
    setDialogOpen(false)
  }

  return (
    <AdminLayout>
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kelola Divisi</h1>
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
          {/* Wrapper div dengan overflow-auto untuk scrolling horizontal */}
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">No</TableHead>
                  <TableHead className="min-w-[180px]">Nama Divisi</TableHead>
                  <TableHead className="min-w-[250px]">Deskripsi</TableHead>
                  <TableHead className="min-w-[180px]">Nama Manajer</TableHead>
                  <TableHead className="min-w-[120px]">Jumlah Karyawan</TableHead>
                  <TableHead className="w-[150px] text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {divisi.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{item.nama}</TableCell>
                    <TableCell>{item.deskripsi}</TableCell>
                    <TableCell>{item.manajer || "-"}</TableCell>
                    <TableCell>{getJumlahKaryawan(item.id)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditDivisi(item.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500"
                          onClick={() => handleHapusDivisi(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Divisi" : "Tambah Divisi Baru"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "Ubah informasi divisi yang ada" : "Isi detail untuk menambahkan divisi baru"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="nama"
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
                name="manajerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Manajer</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih manajer divisi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">Tidak Ada Manajer</SelectItem>
                        {getAvailableManagers().map((manager) => (
                          <SelectItem key={manager.id} value={String(manager.id)}>
                            {manager.nama} - {manager.jabatan}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Hanya menampilkan karyawan yang belum menjadi manajer di divisi lain
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">{isEdit ? "Simpan Perubahan" : "Tambah Divisi"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Divisi</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus divisi ini? Tindakan ini tidak dapat dibatalkan. Semua karyawan dalam
              divisi ini akan dibebaskan dari divisi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={konfirmasiHapusDivisi}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </AdminLayout>
  )
}

