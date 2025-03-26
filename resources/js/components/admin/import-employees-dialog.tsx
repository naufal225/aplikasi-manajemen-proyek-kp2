"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileSpreadsheet, Upload } from "lucide-react"
import { showSuccess } from "@/components/sweet-alert"

export function ImportEmployeesDialog() {
  const [isOpen, setIsOpen] = useState(false)
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
      setIsOpen(false)
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Upload className="h-4 w-4 mr-2" />
          Import Karyawan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Import Data Karyawan
          </DialogTitle>
          <DialogDescription>
            Import data karyawan dari file Excel (.xlsx). Pastikan format file sesuai dengan template.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

