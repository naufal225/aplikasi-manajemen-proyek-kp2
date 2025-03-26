"use client"

import Swal, { type SweetAlertIcon, type SweetAlertOptions } from "sweetalert2"
import withReactContent from "sweetalert2-react-content"

// Initialize SweetAlert with React content
const MySwal = withReactContent(Swal)

// Default styling to match the application theme
const defaultOptions: SweetAlertOptions = {
  customClass: {
    container: "font-sans",
    popup: "rounded-lg shadow-lg border border-border bg-background text-foreground",
    title: "text-xl font-semibold",
    closeButton: "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    icon: "",
    image: "",
    input:
      "border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
    actions: "gap-2",
    confirmButton: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium",
    denyButton:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md px-4 py-2 text-sm font-medium",
    cancelButton:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md px-4 py-2 text-sm font-medium",
    footer: "border-t border-border mt-2 pt-2 text-xs text-muted-foreground",
  },
  buttonsStyling: false,
  reverseButtons: true,
  backdrop: "rgba(0, 0, 0, 0.4)",
}

// Confirmation dialog for delete operations
export const showDeleteConfirmation = async (
  title: string,
  text: string,
  confirmButtonText = "Hapus",
  cancelButtonText = "Batal",
): Promise<boolean> => {
  const result = await MySwal.fire({
    ...defaultOptions,
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: "hsl(var(--destructive))",
  })

  return result.isConfirmed
}

// Success notification
export const showSuccess = (title: string, text?: string, timer = 2000): Promise<any> => {
  return MySwal.fire({
    ...defaultOptions,
    title,
    text,
    icon: "success",
    timer,
    timerProgressBar: true,
  })
}

// Error notification
export const showError = (title: string, text?: string): Promise<any> => {
  return MySwal.fire({
    ...defaultOptions,
    title,
    text,
    icon: "error",
  })
}

// Info notification
export const showInfo = (title: string, text?: string): Promise<any> => {
  return MySwal.fire({
    ...defaultOptions,
    title,
    text,
    icon: "info",
  })
}

// Custom confirmation dialog
export const showConfirmation = async (
  title: string,
  text: string,
  icon: SweetAlertIcon = "question",
  confirmButtonText = "Ya",
  cancelButtonText = "Tidak",
): Promise<boolean> => {
  const result = await MySwal.fire({
    ...defaultOptions,
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
  })

  return result.isConfirmed
}

// Toast notification
export const showToast = (
  title: string,
  icon: SweetAlertIcon = "success",
  position:
    | "top"
    | "top-start"
    | "top-end"
    | "center"
    | "center-start"
    | "center-end"
    | "bottom"
    | "bottom-start"
    | "bottom-end" = "bottom-end",
  timer = 3000,
): void => {
  const Toast = MySwal.mixin({
    toast: true,
    position,
    showConfirmButton: false,
    timer,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", MySwal.stopTimer)
      toast.addEventListener("mouseleave", MySwal.resumeTimer)
    },
  })

  Toast.fire({
    icon,
    title,
  })
}

