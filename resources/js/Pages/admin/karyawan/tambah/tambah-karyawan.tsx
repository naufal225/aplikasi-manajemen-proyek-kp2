"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from 'lucide-react'
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
import { AlertCircle, CheckCircle } from 'lucide-react'
import type { Divisi } from "@/models/Models"
import Swal from "sweetalert2"

// Schema validasi untuk form karyawan
const karyawanFormSchema = z.object({
  nama_lengkap: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  id_divisi: z.number().nullable(),
  email: z.string().email("Format email tidak valid"),
  alamat: z.string().min(5, "Alamat minimal 5 karakter"),
  jenis_kelamin: z.enum(["LAKI-LAKI", "PEREMPUAN"], {
    errorMap: () => ({ message: "Jenis kelamin harus 'LAKI-LAKI' atau 'PEREMPUAN'" }),
  }),
  nomor_telepon: z.string().min(10, "Nomor telepon tidak valid"),
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  password_confirmation: z.string().min(8, "Konfirmasi password minimal 8 karakter"),
  tanggal_lahir: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal lahir harus YYYY-MM-DD"),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Password dan konfirmasi password tidak cocok",
  path: ["password_confirmation"],
});

type FormValues = z.infer<typeof karyawanFormSchema>

export default function TambahKaryawan() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [divisi, setDivisi] = useState<Divisi[]>([])

  // Inisialisasi form dengan react-hook-form dan zod
  const form = useForm<FormValues>({
    resolver: zodResolver(karyawanFormSchema),
    defaultValues: {
      nama_lengkap: "",
      id_divisi: null,
      email: "",
      alamat: "",
      jenis_kelamin: "LAKI-LAKI",
      nomor_telepon: "",
      username: "",
      password: "",
      password_confirmation: "",
      tanggal_lahir: new Date().toISOString().split("T")[0],
    },
  });

  // Fetch divisi data
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

  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // Remove password_confirmation before sending to API
    const { password_confirmation, ...submitData } = data;

    axios.post("/api/admin/storeDataKaryawan", submitData)
        .then((response) => {
            if (response.data.status === "success") {
                setSuccess("Karyawan berhasil ditambahkan!");
                // Reset form setelah berhasil
                form.reset();

                // Redirect ke halaman karyawan
                router.visit("/kelola-data-karyawan");

                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Berhasil menambahkan data karyawan',
                    icon: 'success',
                    confirmButtonText: 'Ok'
                  })
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: response.data.message,
                    icon: 'error',
                    confirmButtonText: 'Ok'
                })
                setError(response.data.message || "Terjadi kesalahan saat menambahkan karyawan.");
            }
        })
        .catch((err) => {
            console.error("Error adding employee:", err);

            if (err.response?.status === 422 && err.response?.data?.errors) {
                const apiErrors = err.response.data.errors;
                Object.keys(apiErrors).forEach((key) => {
                    form.setError(key as any, {
                        type: "server",
                        message: Array.isArray(apiErrors[key]) ? apiErrors[key][0] : apiErrors[key],
                    });
                });
            } else {
                setError(err.response?.data?.message || "Terjadi kesalahan saat menambahkan karyawan.");
            }

            Swal.fire({
                title: 'Error!',
                text: String(error),
                icon: 'error',
                confirmButtonText: 'Ok'
            })
        })
        .finally(() => {
            setIsSubmitting(false);
        });
};


  const handleCancel = () => {
    router.visit('/kelola-data-karyawan')
  }

  return (
    <AdminLayout>
      <div className="p-1 md:p-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleCancel} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold">Tambah Karyawan Baru</h1>
          <p className="text-muted-foreground">Tambahkan karyawan baru ke dalam sistem</p>
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
            <CardTitle>Form Tambah Karyawan</CardTitle>
            <CardDescription>Isi informasi karyawan yang akan ditambahkan</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="nama_lengkap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama lengkap" {...field} />
                      </FormControl>
                      <FormDescription>Nama lengkap karyawan sesuai identitas resmi.</FormDescription>
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
                      <FormDescription>Username untuk login ke sistem.</FormDescription>
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
                      <FormDescription>Email akan digunakan untuk login dan komunikasi.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <FormField
                  control={form.control}
                  name="nomor_telepon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Telepon</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nomor telepon" {...field} />
                      </FormControl>
                      <FormDescription>Format: +62xxxxxxxxxx atau nomor lokal.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alamat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan alamat lengkap" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="id_divisi"
                  render={({ field }) => (
                    <FormItem>
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
                      <FormDescription>Divisi tempat karyawan akan bekerja.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Masukkan Password" {...field} />
                      </FormControl>
                      <FormDescription>Password minimal 8 karakter.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password_confirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Konfirmasi Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Konfirmasi Password" {...field} />
                      </FormControl>
                      <FormDescription>Masukkan kembali password yang sama.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <Button variant="outline" type="button" onClick={handleCancel}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Karyawan"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  )
}
