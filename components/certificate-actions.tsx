// components/certificate-actions.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Download, 
  FileText, 
  Upload, 
  Printer, 
  Eye, 
  RefreshCw,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { 
  generateCertificatePDFAction,
  uploadExistingCertificate,
  createCertificateFromTraining
} from "@/app/actions/certificates"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface CertificateActionsProps {
  certificateId: string
  trainingId?: string
  certificateNumber?: string
  hasPDF?: boolean
  pdfUrl?: string
  onCertificateGenerated?: () => void
}

export function CertificateActions({ 
  certificateId, 
  trainingId, 
  certificateNumber,
  hasPDF = false,
  pdfUrl,
  onCertificateGenerated 
}: CertificateActionsProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  const handleGeneratePDF = async () => {
    setIsGenerating(true)
    try {
      const result = await generateCertificatePDFAction(certificateId)
      
      if (result.success) {
        toast.success("Certificate PDF generated successfully", {
          description: `Certificate ${certificateNumber} is ready for download.`
        })
        if (onCertificateGenerated) {
          onCertificateGenerated()
        }
      } else {
        toast.error("Failed to generate PDF", {
          description: result.error || "Unknown error occurred"
        })
      }
    } catch (error) {
      toast.error("Error generating PDF", {
        description: "Please try again later."
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUploadPDF = async (formData: FormData) => {
    setIsUploading(true)
    try {
      const result = await uploadExistingCertificate(certificateId, formData)
      
      if (result.success) {
        toast.success("PDF uploaded successfully", {
          description: "Certificate PDF has been updated."
        })
        setUploadDialogOpen(false)
        if (onCertificateGenerated) {
          onCertificateGenerated()
        }
      } else {
        toast.error("Failed to upload PDF", {
          description: result.error || "Unknown error occurred"
        })
      }
    } catch (error) {
      toast.error("Error uploading PDF", {
        description: "Please try again later."
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleCreateFromTraining = async () => {
    if (!trainingId) return
    
    setIsCreating(true)
    try {
      const result = await createCertificateFromTraining(trainingId)
      
      if (result.success) {
        toast.success("Certificate created successfully", {
          description: `Certificate ${result.certificateNumber} has been created.`
        })
        if (onCertificateGenerated) {
          onCertificateGenerated()
        }
      } else {
        toast.error("Failed to create certificate", {
          description: result.error || "Unknown error occurred"
        })
      }
    } catch (error) {
      toast.error("Error creating certificate", {
        description: "Please try again later."
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDownloadPDF = () => {
    if (pdfUrl) {
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = `certificate_${certificateNumber || certificateId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank')
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
        }
      }
    }
  }

  const handleViewPDF = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank')
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Generate PDF Button */}
      <Button
        onClick={handleGeneratePDF}
        disabled={isGenerating}
        variant={hasPDF ? "outline" : "default"}
        size="sm"
      >
        {isGenerating ? (
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
        ) : hasPDF ? (
          <RefreshCw className="mr-2 h-4 w-4" />
        ) : (
          <FileText className="mr-2 h-4 w-4" />
        )}
        {isGenerating ? "Generating..." : hasPDF ? "Regenerate PDF" : "Generate PDF"}
      </Button>

      {/* View/Download PDF Buttons */}
      {hasPDF && pdfUrl && (
        <>
          <Button
            onClick={handleViewPDF}
            variant="outline"
            size="sm"
          >
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            size="sm"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </>
      )}

      {/* Upload PDF Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Upload PDF
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Existing Certificate PDF</DialogTitle>
          </DialogHeader>
          <form action={handleUploadPDF} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pdf_file">Select PDF File</Label>
              <Input
                id="pdf_file"
                name="pdf_file"
                type="file"
                accept=".pdf"
                required
              />
              <p className="text-sm text-muted-foreground">
                Maximum file size: 10MB. Only PDF files are accepted.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUploadDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUploading}
              >
                {isUploading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Certificate from Training (if trainingId is provided) */}
      {trainingId && !certificateId && (
        <Button
          onClick={handleCreateFromTraining}
          disabled={isCreating}
          variant="default"
          size="sm"
        >
          {isCreating ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="mr-2 h-4 w-4" />
          )}
          {isCreating ? "Creating..." : "Create Certificate"}
        </Button>
      )}
    </div>
  )
}