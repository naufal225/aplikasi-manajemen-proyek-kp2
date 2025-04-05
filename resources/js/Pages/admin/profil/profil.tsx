"use client"

import { AvatarFallback, Avatar } from "@/components/ui/avatar"

import { AvatarImage } from "@/components/ui/avatar"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { AdminLayout } from "@/layouts/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Camera, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import axios from "axios"
import Swal from "sweetalert2"

// Schema validasi untuk form profil
const profileFormSchema = z.object({
  nama_lengkap: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  username: z.string().min(3, "Username minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  jenis_kelamin: z.enum(["LAKI-LAKI", "PEREMPUAN"], {
    errorMap: () => ({ message: "Jenis kelamin harus 'LAKI-LAKI' atau 'PEREMPUAN'" }),
  }),
  nomor_telepon: z.string().min(10, "Nomor telepon tidak valid"),
  alamat: z.string().min(5, "Alamat minimal 5 karakter"),
  tanggal_lahir: z.date({
    required_error: "Tanggal lahir diperlukan",
  }),
})

// Schema validasi untuk form password
const passwordFormSchema = z
  .object({
    current_password: z.string().min(1, "Password saat ini diperlukan"),
    new_password: z.string().min(8, "Password baru minimal 8 karakter"),
    confirm_password: z.string().min(8, "Konfirmasi password minimal 8 karakter"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Password baru dan konfirmasi password tidak cocok",
    path: ["confirm_password"],
  })

type ProfileFormValues = z.infer<typeof profileFormSchema>
type PasswordFormValues = z.infer<typeof passwordFormSchema>

interface UserProfile {
  id: number
  nama_lengkap: string
  username: string
  email: string
  tipe_admin: "admin" | "owner"
  jenis_kelamin: "LAKI-LAKI" | "PEREMPUAN"
  nomor_telepon: string
  alamat: string
  tanggal_lahir: string
  foto_profil?: string | null
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("profile")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [skipFetchOnce, setSkipFetchOnce] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Inisialisasi form profil
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nama_lengkap: "",
      username: "",
      email: "",
      jenis_kelamin: "LAKI-LAKI",
      nomor_telepon: "",
      alamat: "",
      tanggal_lahir: new Date(),
    },
  })

  // Inisialisasi form password
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  })

  const fetchUserProfile = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.get<{ status: string; data: UserProfile }>("/api/admin/getUserLogedIn")
      if (response.data.status === "success") {
        const newUserData = response.data.data
        setUser(newUserData)

        profileForm.reset({
          nama_lengkap: newUserData.nama_lengkap,
          username: newUserData.username,
          email: newUserData.email,
          jenis_kelamin: newUserData.jenis_kelamin,
          nomor_telepon: newUserData.nomor_telepon,
          alamat: newUserData.alamat,
          tanggal_lahir: new Date(newUserData.tanggal_lahir),
        })
      } else {
        setError("Gagal memuat data profil")
      }
    } catch (err) {
      console.error("Error fetching profile:", err)
      setError("Terjadi kesalahan saat memuat data profil")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch user data
  useEffect(() => {
    fetchUserProfile()
  }, [])

  // Handle profile form submission
  const onSubmitProfile = async (data: ProfileFormValues) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const formattedDate = format(data.tanggal_lahir, "yyyy-MM-dd")

      const submitData = {
        id: user?.id,
        nama_lengkap: data.nama_lengkap,
        username: data.username,
        email: data.email,
        jenis_kelamin: data.jenis_kelamin,
        nomor_telepon: data.nomor_telepon,
        alamat: data.alamat,
        tanggal_lahir: formattedDate,
      }

      const response = await axios.put("/api/admin/updateProfile", submitData)

      if (response.data.status === "success") {
        setSuccess("Profil berhasil diperbarui")
        setUser(response.data.data) // Update user state

        profileForm.reset({
          nama_lengkap: user?.nama_lengkap,
          username: user?.username,
          email: user?.email,
          jenis_kelamin: user?.jenis_kelamin,
          nomor_telepon: user?.nomor_telepon,
          alamat: user?.alamat,
          tanggal_lahir: new Date(user!.tanggal_lahir),
        }) // Reset form

        Swal.fire({
          title: "Berhasil!",
          text: "Profil berhasil diperbarui",
          icon: "success",
          timer: 2000,
        })

        window.location.href = "/profil"
      } else {
        // Ini jarang terjadi, tapi disiapkan
        const msg = response.data.message || "Gagal memperbarui profil"
        setError(msg)
        Swal.fire({
          title: "Gagal!",
          text: msg.join(" "),
          icon: "error",
          timer: 2000,
        })
      }
    } catch (err: any) {
      console.error("Error updating profile:", err)

      if (err.response?.status === 422 && err.response?.data?.message) {
        const apiErrors = err.response.data.message

        Object.keys(apiErrors).forEach((key) => {
          profileForm.setError(key as keyof ProfileFormValues, {
            type: "server",
            message: Array.isArray(apiErrors[key]) ? apiErrors[key][0] : apiErrors[key],
          })
        })
      } else {
        const fallback = err.response?.data?.message || "Terjadi kesalahan saat memperbarui profil."
        setError(fallback)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle password form submission
  const onSubmitPassword = async (data: PasswordFormValues) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Include user ID in the password update request
      const submitData = {
        id: user?.id, // Add user ID to the data
        current_password: data.current_password,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      }

      const response = await axios.put("/api/admin/updatePassword", submitData)

      if (response.data.status === "success") {
        setSuccess("Password berhasil diperbarui")

        // Reset password form
        passwordForm.reset({
          current_password: "",
          new_password: "",
          confirm_password: "",
        })

        // Show success message
        Swal.fire({
          title: "Berhasil!",
          text: "Password berhasil diperbarui",
          icon: "success",
          timer: 2000,
        })
      } else {
        setError(response.data.message || "Gagal memperbarui password")
      }
    } catch (err: any) {
      console.error("Error updating password:", err)

      // Handle validation errors
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const apiErrors = err.response.data.errors

        Object.keys(apiErrors).forEach((key) => {
          passwordForm.setError(key as any, {
            type: "server",
            message: Array.isArray(apiErrors[key]) ? apiErrors[key][0] : apiErrors[key],
          })
        })
      } else if (err.response?.status === 400 && err.response?.data?.message) {
        // Handle specific error for current password
        passwordForm.setError("current_password", {
          type: "server",
          message: err.response.data.message,
        })
      } else {
        setError(err.response?.data?.message || "Terjadi kesalahan saat memperbarui password")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle profile photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log("FILEE: " + file)

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"]
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        title: "Format Tidak Valid!",
        text: "Hanya file JPG, JPEG, dan PNG yang diperbolehkan",
        icon: "error",
      })
      return
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        title: "Ukuran File Terlalu Besar!",
        text: "Ukuran file maksimal 2MB",
        icon: "error",
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewImage(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Store the file for later upload
    setSelectedFile(file)

    // Show confirmation modal
    Swal.fire({
      title: "Konfirmasi Upload",
      text: "Apakah Anda yakin ingin mengupload foto ini?",
      imageUrl: URL.createObjectURL(file),
      imageWidth: 200,
      imageHeight: 200,
      imageAlt: "Preview foto profil",
      showCancelButton: true,
      confirmButtonText: "Ya, Upload",
      cancelButtonText: "Batal",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        // Make sure we're using the file that was selected
        uploadPhoto(file)
      } else {
        // Reset preview if user cancels
        setPreviewImage(null)
        setSelectedFile(null)
      }
    })
  }

  // Upload photo to server
  const uploadPhoto = async (file: File) => {
    setIsUploadingPhoto(true)
    setError(null)

    try {
      // Create a new FormData instance
      const formData = new FormData()

      // Explicitly append the file with the correct field name
      formData.append("foto_profil", file, file.name)

      // Add the user ID
      if (user?.id) {
        formData.append("id", user.id.toString())
      }

      console.log("Uploading file:", file.name, file.type, file.size)

      // Log the FormData entries to verify content (for debugging)
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1])
      }

      const response = await axios.post("/api/admin/updateProfilePhoto", formData)

      if (response.data.status === "success") {
        // Update user data with new photo URL
        if (user) {
          setUser({
            ...user,
            foto_profil: response.data.data.foto_profil,
          })
        }

        // Show success message
        Swal.fire({
          title: "Berhasil!",
          text: "Foto profil berhasil diperbarui",
          icon: "success",
          timer: 2000,
        })

        // Reset selected file
        setSelectedFile(null)
      } else {
        setError(response.data.message.join(" ") || "Gagal memperbarui foto profil")
        const msg = response.data.message
        Swal.fire({
          title: "Gagal!",
          text: msg.join(" "),
          icon: "error",
          timer: 2000,
        })

        // Reset preview and selected file if upload fails
        setPreviewImage(null)
        setSelectedFile(null)
      }
    } catch (err: any) {
      console.error("Error uploading photo:", err)
      setError(err.response?.data?.message || "Terjadi kesalahan saat mengunggah foto profil")

      // Reset preview and selected file if upload fails
      setPreviewImage(null)
      setSelectedFile(null)
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.nama_lengkap) return "U"

    const nameParts = user.nama_lengkap.split(" ")
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase()

    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase()
  }

  // Safely get gender display text
  const getGenderDisplayText = (gender: string | undefined) => {
    if (gender === "LAKI-LAKI") return "Laki-laki"
    if (gender === "PEREMPUAN") return "Perempuan"
    return ""
  }

  // Safely get admin type display text
  const getAdminTypeDisplayText = (type: string | undefined) => {
    if (type === "owner") return "Owner"
    if (type === "admin") return "Admin"
    return ""
  }

  return (
    <AdminLayout>
      <div className="p-1 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Profil Saya</h1>
          <p className="text-muted-foreground">Kelola informasi profil dan keamanan akun Anda</p>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-2 border-border">
                    {previewImage ? (
                      <AvatarImage src={previewImage} alt="Preview" />
                    ) : user?.foto_profil ? (
                      <AvatarImage src={'/storage/' + user.foto_profil} alt={user.nama_lengkap || "User"} />
                    ) : (
                      <AvatarFallback className="text-3xl">{getUserInitials()}</AvatarFallback>
                    )}
                  </Avatar>
                  <label
                    htmlFor="profile-photo"
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    {isUploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </label>
                  <input
                    type="file"
                    id="profile-photo"
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handlePhotoUpload}
                    disabled={isUploadingPhoto}
                  />
                </div>

                {user && (
                  <div className="text-center">
                    <h3 className="text-lg font-medium">{user.nama_lengkap || ""}</h3>
                    <p className="text-sm text-muted-foreground">{user.email || ""}</p>
                    <Badge
                      variant="outline"
                      className={`mt-2 ${user.tipe_admin === "owner" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}
                    >
                      {getAdminTypeDisplayText(user.tipe_admin)}
                    </Badge>
                  </div>
                )}

                <Separator />

                <div className="w-full">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="profile">Profil</TabsTrigger>
                      <TabsTrigger value="password">Password</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Card */}
          <Card className="md:col-span-3">
            {/* Pindahkan TabsContent ke dalam komponen Tabs */}
            <Tabs value={activeTab} className="w-full">
              <TabsContent value="profile" className="mt-0 border-none p-0 outline-none">
                <CardHeader>
                  <CardTitle>Informasi Profil</CardTitle>
                  <CardDescription>Perbarui informasi profil Anda</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={profileForm.control}
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
                            control={profileForm.control}
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
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="Masukkan email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={profileForm.control}
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
                            control={profileForm.control}
                            name="jenis_kelamin"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Jenis Kelamin</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={true}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue>{getGenderDisplayText(field.value)}</SelectValue>
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="LAKI-LAKI">Laki-laki</SelectItem>
                                    <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>Jenis kelamin tidak dapat diubah</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={profileForm.control}
                            name="tanggal_lahir"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Tanggal Lahir</FormLabel>
                                <DatePicker selected={field.value} onSelect={field.onChange} disabled={false} />
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={profileForm.control}
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
                        </div>

                        <div className="flex justify-end">
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                              </>
                            ) : (
                              "Simpan Perubahan"
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </TabsContent>

              <TabsContent value="password" className="mt-0 border-none p-0 outline-none">
                <CardHeader>
                  <CardTitle>Ubah Password</CardTitle>
                  <CardDescription>Perbarui password akun Anda untuk keamanan</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-6">
                      <FormField
                        control={passwordForm.control}
                        name="current_password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password Saat Ini</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  type={showCurrentPassword ? "text" : "password"}
                                  placeholder="Masukkan password saat ini"
                                  {...field}
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              >
                                {showCurrentPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="sr-only">
                                  {showCurrentPassword ? "Sembunyikan password" : "Tampilkan password"}
                                </span>
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="new_password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password Baru</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  type={showNewPassword ? "text" : "password"}
                                  placeholder="Masukkan password baru"
                                  {...field}
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                              >
                                {showNewPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="sr-only">
                                  {showNewPassword ? "Sembunyikan password" : "Tampilkan password"}
                                </span>
                              </Button>
                            </div>
                            <FormDescription>Password minimal 8 karakter</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="confirm_password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Konfirmasi Password</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="Konfirmasi password baru"
                                  {...field}
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="sr-only">
                                  {showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                                </span>
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Menyimpan...
                            </>
                          ) : (
                            "Ubah Password"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}



