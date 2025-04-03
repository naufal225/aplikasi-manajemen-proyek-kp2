"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { AdminLayout } from "@/layouts/admin-layout"
import axios from "axios"
import { router } from "@inertiajs/react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"
import { format, isAfter } from "date-fns"
import { useEffect } from "react"
import Swal from "sweetalert2"

// Schema validasi untuk form proyek
const proyekFormSchema = z
  .object({
    nama_proyek: z.string().min(2, {
      message: "Nama proyek harus minimal 2 karakter.",
    }),
    deskripsi_proyek: z.string().optional(),
    id_divisi: z.number({
      required_error: "Silakan pilih divisi.",
    }),
    status: z.enum(["pending", "in-progress"], {
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

// Interface untuk data divisi
interface Divisi {
  id: number
  nama_divisi: string
}

export default function TambahProyek() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [divisi, setDivisi] = useState<Divisi[]>([])

  // Inisialisasi form dengan react-hook-form dan zod
  const form = useForm<FormValues>({
    resolver: zodResolver(proyekFormSchema),
    defaultValues: {
      nama_proyek: "",
      deskripsi_proyek: "",
      status: "pending",
      tanggal_mulai: new Date(),
      tenggat_waktu: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  })

  // Fetch data divisi
  useEffect(() => {
    const getAllDataDivisi = async () => {
      try {
        const response = await axios.get<{ status: string; data: Divisi[] }>("/api/admin/getAllDataDivisi")
        if (response.data.status === "success") {
          setDivisi(response.data.data)
        }
      } catch (err) {
        console.error("Error fetching divisions:", err)
        setError("Gagal memuat data divisi")
      }
    }

    getAllDataDivisi()
  }, [])

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
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Hitung progress berdasarkan status
      const progress = getProgressByStatus(data.status)
      const submitData = {
        ...data,
        progress,
        tanggal_mulai: format(data.tanggal_mulai, "yyyy-MM-dd"),
        tenggat_waktu: format(data.tenggat_waktu, "yyyy-MM-dd"),
      }

      // Direct axios POST request to the API endpoint
      const response = await axios.post("/api/admin/storeDataProyek", submitData)

      if (response.data.status === "success") {
        Swal.fire({
            title: 'Berhasil!',
            text: 'Data proyek baru berhasil ditambahkan',
            icon: 'success',
            cancelButtonText: 'Ok'
        })

        form.reset()

        // Redirect after successful submission
        setTimeout(() => {
          router.visit("/kelola-data-proyek")
        }, 2000)
      } else {
        setError(response.data.message || "Terjadi kesalahan saat menambahkan proyek.")
      }
    } catch (err: any) {
      console.error("Error adding project:", err)
      setError(err.response?.data?.message || "Terjadi kesalahan saat menambahkan proyek.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Replace the handleCancel function
  const handleCancel = () => {
    router.visit("/kelola-data-proyek")
  }

  return (
    <AdminLayout>
      <div className="p-1 md:p-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleCancel} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold">Tambah Proyek Baru</h1>
          <p className="text-muted-foreground">Tambahkan proyek baru ke dalam sistem</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-500 text-green-500">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Form Tambah Proyek</CardTitle>
            <CardDescription>Isi informasi proyek yang akan ditambahkan</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="nama_proyek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Proyek</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama proyek" {...field} />
                      </FormControl>
                      <FormDescription>Nama proyek harus unik dan minimal 2 karakter.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deskripsi_proyek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan deskripsi proyek (opsional)"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>Deskripsi singkat tentang proyek dan tujuannya.</FormDescription>
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
                        <FormDescription>Divisi yang bertanggung jawab atas proyek ini.</FormDescription>
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
                          </SelectContent>
                        </Select>

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
                        <FormDescription>Tanggal dimulainya proyek.</FormDescription>
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
                        <FormDescription>Tenggat waktu penyelesaian proyek.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <Button variant="outline" type="button" onClick={handleCancel}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Proyek"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  )
}

