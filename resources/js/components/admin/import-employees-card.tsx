"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileSpreadsheet, Upload, X } from "lucide-react"
import { showSuccess } from "@/components/sweet-alert"

export function ImportEmployeesCard({ onClose }: { onClose: () => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!selectedFile) return

    setIsUploading(true)

    try {
      // In a real app, you would upload the file to your server
      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1500))

      showSuccess("Data karyawan berhasil diimport")
      onClose()
      setSelectedFile(null)
    } catch (error) {
      console.error("Error importing employees:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    // In a real app, this would download an Excel template
    // For now, we'll just simulate it
    alert("Template Excel akan diunduh")
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base md:text-lg font-semibold">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Import Data Karyawan
            </div>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription>
            Import data karyawan dari file Excel (.xlsx). Pastikan format file sesuai dengan template.
          </CardDescription>

          <Button variant="outline" onClick={downloadTemplate} className="w-full sm:w-auto">
            Download Template Excel
          </Button>

          <div className="grid w-full items-center gap-1.5">
            <label htmlFor="file-upload" className="text-sm font-medium">
              Pilih File Excel
            </label>
            <div className="flex items-center gap-2">
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
                onChange={handleFileChange}
              />
            </div>
            {selectedFile && <p className="text-sm text-muted-foreground">File terpilih: {selectedFile.name}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleImport} disabled={!selectedFile || isUploading}>
            {isUploading ? (
              <>Mengimport...</>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

