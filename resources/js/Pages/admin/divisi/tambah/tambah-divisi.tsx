"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { AdminLayout } from "@/layouts/admin-layout"
import axios from "axios"
import { router } from "@inertiajs/react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import Swal from "sweetalert2"

// Schema validasi untuk form divisi
const divisiFormSchema = z.object({
  nama_divisi: z.string().min(2, {
    message: "Nama divisi harus minimal 2 karakter.",
  }),
  deskripsi: z.string().optional(),
})

type FormValues = z.infer<typeof divisiFormSchema>

export default function TambahDivisi() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Inisialisasi form dengan react-hook-form dan zod
  const form = useForm<FormValues>({
    resolver: zodResolver(divisiFormSchema),
    defaultValues: {
      nama_divisi: "",
      deskripsi: "",
    },
  })

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Direct axios POST request to the API endpoint
      const response = await axios.post("/api/admin/storeDataDivisi", data)

      if (response.data.status === "success") {
        setSuccess("Divisi berhasil ditambahkan!")
        form.reset()

        // Redirect after successful submission
        router.visit("/kelola-data-divisi")

        Swal.fire({
            title: 'Berhasil!',
            text: 'Berhasil menambahkan data divisi',
            icon: 'success',
            confirmButtonText: 'Ok'
          })
      } else {
        setError(response.data.message || "Terjadi kesalahan saat menambahkan divisi.")
      }
    } catch (err: any) {
      console.error("Error adding division:", err)
      setError(err.response?.data?.message || "Terjadi kesalahan saat menambahkan divisi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Replace the handleCancel function
  const handleCancel = () => {
    router.visit("/kelola-data-divisi")
  }

  const handleReset = () => {
    form.reset()
  }

  return (
    <AdminLayout>
      <div className="p-1 md:p-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleCancel} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold">Tambah Divisi Baru</h1>
          <p className="text-muted-foreground">Tambahkan divisi baru ke dalam sistem</p>
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
            <CardTitle>Form Tambah Divisi</CardTitle>
            <CardDescription>Isi informasi divisi yang akan ditambahkan</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="nama_divisi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Divisi</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama divisi" {...field} />
                      </FormControl>
                      <FormDescription>Nama divisi harus unik dan minimal 2 karakter.</FormDescription>
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
                        <Textarea
                          placeholder="Masukkan deskripsi divisi (opsional)"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Deskripsi singkat tentang divisi dan tanggung jawabnya.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <Button variant="outline" type="button" onClick={handleReset}>
                  Reset
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Divisi"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  )
}

