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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Upload, X } from "lucide-react"
import { addCertificate } from "@/app/actions/certificates"
import { useRouter } from "next/navigation"

interface AddCertificateDialogProps {
  trainings: Array<{
    id: string
    trainee: { id: string; full_name: string }
    training_program: { name: string; code: string }
  }>
}

export function AddCertificateDialog({ trainings }: AddCertificateDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadMethod, setUploadMethod] = useState<'generate' | 'upload'>('generate')
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file')
        return
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    // Add the file to formData if selected
    if (selectedFile && uploadMethod === 'upload') {
      formData.append('pdf_file', selectedFile)
    }

    const result = await addCertificate(formData)

    if (result.success) {
      setOpen(false)
      setSelectedFile(null)
      setUploadMethod('generate')
      router.refresh()
      alert("Certificate added successfully!")
    } else {
      alert(result.error || "Failed to add certificate")
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <FileText className="mr-2 h-4 w-4" />
          Add Certificate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Issue New Certificate</DialogTitle>
            <DialogDescription>
              Issue a certificate for completed training. You can generate a new PDF or upload an existing one.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Training Selection */}
            <div className="grid gap-2">
              <Label htmlFor="training_id">Training *</Label>
              <Select name="training_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select completed training" />
                </SelectTrigger>
                <SelectContent>
                  {trainings.map((training) => (
                    <SelectItem key={training.id} value={training.id}>
                      {training.trainee.full_name} - {training.training_program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Certificate Number */}
            <div className="grid gap-2">
              <Label htmlFor="certificate_number">Certificate Number *</Label>
              <Input 
                id="certificate_number" 
                name="certificate_number" 
                placeholder="CERT-2025-001" 
                required 
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="issue_date">Issue Date *</Label>
                <Input id="issue_date" name="issue_date" type="date" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiry_date">Expiry Date *</Label>
                <Input id="expiry_date" name="expiry_date" type="date" required />
              </div>
            </div>

            {/* Status */}
            <div className="grid gap-2">
              <Label htmlFor="status">Status *</Label>
              <Select name="status" defaultValue="valid" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* PDF Upload Method */}
            <div className="grid gap-2">
              <Label>PDF Certificate</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={uploadMethod === 'generate' ? 'default' : 'outline'}
                  onClick={() => setUploadMethod('generate')}
                  className="flex-1"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Generate New
                </Button>
                <Button
                  type="button"
                  variant={uploadMethod === 'upload' ? 'default' : 'outline'}
                  onClick={() => setUploadMethod('upload')}
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Existing
                </Button>
              </div>
            </div>

            {/* File Upload Section */}
            {uploadMethod === 'upload' && (
              <div className="space-y-3 border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pdf_file" className="text-sm font-medium">
                    Upload PDF Certificate
                  </Label>
                  {selectedFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {selectedFile ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-md">
                    <FileText className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="pdf_file"
                      name="pdf_file"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm text-gray-500">
                        Click to select PDF file
                      </span>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  Maximum file size: 10MB. Only PDF files are accepted.
                </p>
              </div>
            )}

            {/* Info about generated PDF */}
            {uploadMethod === 'generate' && (
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-sm text-blue-700">
                  A new PDF certificate will be generated using the template.
                  You can regenerate or upload a different PDF later.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setOpen(false)
                setSelectedFile(null)
                setUploadMethod('generate')
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Issue Certificate
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}