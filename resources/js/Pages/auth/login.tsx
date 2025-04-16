"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Lock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { router, Head } from "@inertiajs/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import axios from "axios"
import { AxiosError } from "axios"
import Swal from "sweetalert2"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  })
  const [errors, setErrors] = useState({
    login: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      rememberMe: checked,
    }))
  }

  const validateForm = () => {
    let valid = true
    const newErrors = { login: "", password: "" }

    if (!formData.login) {
      newErrors.login = "Email or Username is required"
      valid = false
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
      valid = false
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
        const response = await axios.post('/login', formData);

        // Simpan token di localStorage atau sessionStorage
        localStorage.setItem("auth_token", response.data.token);

        // Redirect ke dashboard setelah login berhasil
        router.get('/dashboard');

    } catch (error: any) {
        if (error.response && error.response.status === 401) {
            setErrors((prev) => ({
                ...prev,
                login: "Invalid credentials",
                password: "",
            }));
            Swal.fire({
                title: 'Error!',
                text: 'Username atau Email atau Password salah',
                icon: 'error',
                confirmButtonText: 'Cool'
              })
        } else {
            Swal.fire
        }
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Head title="Login"/>
        <Card className="border-gray-200">
            <CardHeader className="flex flex-col items-center">
              <img
                src="img/logo_grafit.png"
                alt="Logo Grafit"
                className="w-24 h-24 object-contain mb-2"
              />
              <CardTitle className="text-2xl font-semibold text-center">Login</CardTitle>
            </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    name="login"
                    placeholder="Masukkan Username Atau Email"
                    value={formData.login}
                    onChange={handleChange}
                    className={`pl-10 ${errors.login ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.login && <p className="text-red-500 text-sm">{errors.login}</p>}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Masukkan Password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                  />
                  <div
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <Eye className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>

              {/* <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember-me" checked={formData.rememberMe} onCheckedChange={handleCheckboxChange} />
                  <label htmlFor="remember-me" className="text-sm text-gray-600">
                    Ingat Saya
                  </label>
                </div>
              </div> */}

              <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

