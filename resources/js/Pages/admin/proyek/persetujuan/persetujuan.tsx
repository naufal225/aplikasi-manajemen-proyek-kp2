"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePage, router } from "@inertiajs/react"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  MessageSquare,
  ListChecks,
  Eye,
  Download,
  User,
  Calendar,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
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
import { AdminLayout } from "@/layouts/admin-layout"
import { format } from "date-fns"
import { id as LocaleID } from "date-fns/locale"
import Swal from "sweetalert2"

import type { Proyek, PersetujuanForm, Tugas } from "@/models/Models"
import axios from "axios"

export default function KelolaPersetujuanProyek() {
  const { props } = usePage()
  const { id } = props

  const [proyek, setProyek] = useState<Proyek | null>(null)
  const [tugas, setTugas] = useState<Tugas[]>([])

  // Separate loading states for project and tasks
  const [isLoadingProyek, setIsLoadingProyek] = useState(true)
  const [isLoadingTugas, setIsLoadingTugas] = useState(true)

  // Separate error states
  const [errorProyek, setErrorProyek] = useState<string | null>(null)
  const [errorTugas, setErrorTugas] = useState<string | null>(null)

  const [form, setForm] = useState<PersetujuanForm>({
    catatan: "",
    hasil_review: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedEvidence, setSelectedEvidence] = useState<{
    id: number
    nama_tugas: string
    bukti_url: string
    type: string
  } | null>(null)
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false)

  // Fetch project data
  useEffect(() => {
    if (!id) return

    // Reset states
    setIsLoadingProyek(true)
    setErrorProyek(null)

    // Fetch project data
    axios
      .get(`/api/admin/getProyekById/${id}`)
      .then((response) => {
        if (response.data.status === "success") {
          setProyek(response.data.data)
        } else {
          setErrorProyek("Gagal mengambil data proyek")
        }
      })
      .catch((err) => {
        console.error("Error fetching project:", err)
        setErrorProyek(`Gagal mengambil data proyek: ${err.message || "Kesalahan server"}`)
      })
      .finally(() => {
        setIsLoadingProyek(false)
      })
  }, [id])

  // Fetch tasks data
  useEffect(() => {
    if (!id) return

    // Reset states
    setIsLoadingTugas(true)
    setErrorTugas(null)

    // Fetch tasks data
    axios
      .get(`/api/admin/getTugasByIdProyek/${id}`)
      .then((response) => {
        if (response.data.status === "success") {
          setTugas(response.data.data)
        } else {
          setErrorTugas("Gagal mengambil data tugas")
        }
      })
      .catch((err) => {
        console.error("Error fetching tasks:", err)
        setErrorTugas(`Gagal mengambil data tugas: ${err.message || "Kesalahan server"}`)
      })
      .finally(() => {
        setIsLoadingTugas(false)
      })
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm({
      ...form,
      catatan: e.target.value,
    })
  }

  const handleApprove = async () => {
    if (!form.catatan.trim()) {
      Swal.fire({
        title: "Catatan Diperlukan",
        text: "Silakan berikan catatan untuk persetujuan ini",
        icon: "warning",
      })
      return
    }

    await handleSubmit("approved")
  }

  const handleReject = async () => {
    if (!form.catatan.trim()) {
      Swal.fire({
        title: "Catatan Diperlukan",
        text: "Silakan berikan alasan penolakan",
        icon: "warning",
      })
      return
    }

    await handleSubmit("rejected")
  }

  const handleSubmit = async (status: "approved" | "rejected") => {
    setIsSubmitting(true)

    try {
      const submitData = {
        id_proyek: Number(id),
        catatan: form.catatan,
        hasil_review: status,
      }

    //   // Simulate API call
    //   setTimeout(() => {
    //     Swal.fire({
    //       title: status === "approved" ? "Disetujui!" : "Ditolak!",
    //       text: status === "approved" ? "Proyek telah berhasil disetujui." : "Proyek telah ditolak.",
    //       icon: "success",
    //     }).then(() => {
    //       router.visit("/kelola-data-proyek")
    //     })
    //     setIsSubmitting(false)
    //   }, 1000)

    console.log(submitData)

      axios.put('/api/admin/giveReview', submitData)
        .then(response => {
            if(response.data.status == 'success') {
                Swal.fire({
                    title: status === "approved" ? "Disetujui!" : "Ditolak!",
                    text: status === "approved" ? "Proyek telah berhasil disetujui." : "Proyek telah ditolak.",
                    icon: "success",
                  })
                setIsSubmitting(false)
                router.visit('kelola-data-proyek')
            } else {
                Swal.fire({
                    title: "Terjadi Error",
                    icon: "error",
                  })
                setIsSubmitting(false)
            }
        })

      // In a real application, you would use:
      // const response = await axios.post("/api/admin/persetujuanProyek", submitData)
    } catch (err: any) {
      console.error("Error processing approval:", err)
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.message || "Terjadi kesalahan saat memproses persetujuan.",
        icon: "error",
      })
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.visit("/kelola-data-proyek")
  }

  const handleViewEvidence = (tugas: Tugas) => {
    setSelectedEvidence({
      id: tugas.id,
      nama_tugas: tugas.nama_tugas,
      bukti_url: tugas.bukti_pengerjaan || "",
      type: tugas.bukti_type || "unknown",
    })
    setEvidenceDialogOpen(true)

    // In a real application, you would fetch the evidence details:
    // axios.get(`/api/admin/getBuktiPengerjaan/${tugas.id}`)
    //   .then(response => {
    //     if (response.data.status === "success") {
    //       setSelectedEvidence({
    //         id: tugas.id,
    //         nama_tugas: tugas.nama_tugas,
    //         bukti_url: response.data.data.url,
    //         type: response.data.data.type
    //       })
    //       setEvidenceDialogOpen(true)
    //     }
    //   })
    //   .catch(err => {
    //     Swal.fire({
    //       title: "Gagal!",
    //       text: "Gagal memuat bukti pengerjaan.",
    //       icon: "error",
    //     })
    //   })
  }

  const handleDownloadEvidence = () => {
    if (selectedEvidence) {
      // In a real application, you would trigger a download:
      window.open(selectedEvidence.bukti_url, '_blank')

      Swal.fire({
        title: "Mengunduh...",
        text: `Mengunduh bukti pengerjaan untuk tugas "${selectedEvidence.nama_tugas}"`,
        icon: "info",
        timer: 2000,
        timerProgressBar: true,
      })
    }
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

  // Render file type icon
  const renderFileTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />
      case "image":
      case "png":
      case "jpg":
      case "jpeg":
        return <Eye className="h-4 w-4 text-blue-500" />
      case "zip":
      case "rar":
        return <Download className="h-4 w-4 text-purple-500" />
      case "document":
      case "doc":
      case "docx":
        return <FileText className="h-4 w-4 text-blue-700" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <AdminLayout>
      <div className="p-1 md:p-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold">Kelola Persetujuan Proyek</h1>
          <p className="text-muted-foreground">Tinjau dan berikan persetujuan untuk proyek</p>
        </div>

        {/* Project Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Detail Proyek */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detail Proyek
              </CardTitle>
              <CardDescription>Informasi lengkap mengenai proyek</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProyek ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Memuat data proyek...</p>
                </div>
              ) : errorProyek ? (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorProyek}</AlertDescription>
                </Alert>
              ) : !proyek ? (
                <Alert className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Proyek tidak ditemukan</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        {format(new Date(proyek.tanggal_mulai), "dd MMMM yyyy", { locale: LocaleID })}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Tanggal Selesai</h3>
                      <p className="text-base">
                        {format(new Date(proyek.tenggat_waktu), "dd MMMM yyyy", { locale: LocaleID })}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Deskripsi Proyek</h3>
                    <p className="text-sm">{proyek.deskripsi_proyek || "Tidak ada deskripsi"}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Persetujuan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Form Persetujuan
              </CardTitle>
              <CardDescription>Berikan persetujuan atau penolakan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="catatan" className="text-sm font-medium">
                    Catatan Persetujuan
                  </label>
                  <Textarea
                    id="catatan"
                    placeholder="Masukkan catatan persetujuan atau alasan penolakan"
                    className="mt-1 min-h-[120px]"
                    value={form.catatan}
                    onChange={handleInputChange}
                    disabled={isLoadingProyek || !!errorProyek || !proyek}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleApprove}
                disabled={isSubmitting || isLoadingProyek || !!errorProyek || !proyek}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Setujui Proyek
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleReject}
                disabled={isSubmitting || isLoadingProyek || !!errorProyek || !proyek}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Tolak Proyek
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Daftar Tugas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              Daftar Tugas Proyek
            </CardTitle>
            <CardDescription>Tugas-tugas yang telah diselesaikan dalam proyek ini</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTugas ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Memuat data tugas...</p>
              </div>
            ) : errorTugas ? (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorTugas}</AlertDescription>
              </Alert>
            ) : tugas.length === 0 ? (
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
                        <TableHead className="min-w-[120px]">Tenggat Waktu</TableHead>
                        <TableHead className="min-w-[120px]">Bukti Pengerjaan</TableHead>
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
                          <TableCell>{renderStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{format(new Date(item.tenggat_waktu), "dd MMM yyyy", { locale: LocaleID })}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.bukti_pengerjaan ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => handleViewEvidence(item)}
                              >
                                {renderFileTypeIcon(item.bukti_type || "unknown")}
                                <span>Lihat Bukti</span>
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-sm">Tidak ada bukti</span>
                            )}
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

        {/* Dialog Bukti Pengerjaan */}
        <Dialog open={evidenceDialogOpen} onOpenChange={setEvidenceDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Bukti Pengerjaan Tugas</DialogTitle>
              <DialogDescription>Bukti pengerjaan untuk tugas "{selectedEvidence?.nama_tugas}"</DialogDescription>
            </DialogHeader>

            <div className="py-4">
              {selectedEvidence && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {renderFileTypeIcon(selectedEvidence.type)}
                      <span className="font-medium">{selectedEvidence.type.toUpperCase()} File</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={handleDownloadEvidence}
                      disabled={selectedEvidence.bukti_url === undefined || selectedEvidence.bukti_url.length == 0}
                    >
                      <Download className="h-4 w-4" />
                      <span>Unduh</span>
                    </Button>
                  </div>

                  <div className="border rounded-md p-4 bg-muted/30">
                    {selectedEvidence.type === "image" ? (
                      <div className="flex justify-center">
                        <div className="border rounded-md overflow-hidden max-w-md">
                          <img
                            src="/placeholder.svg?height=300&width=400"
                            alt="Bukti pengerjaan"
                            className="w-full h-auto"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        {renderFileTypeIcon(selectedEvidence.type)}
                        <p className="mt-2 font-medium">Preview tidak tersedia</p>
                        <p className="text-sm text-muted-foreground">
                          Silakan unduh file untuk melihat bukti pengerjaan
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 flex items-center gap-1"
                          onClick={handleDownloadEvidence}
                        >
                          <Download className="h-4 w-4" />
                          <span>Unduh File</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={() => setEvidenceDialogOpen(false)}>Tutup</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

