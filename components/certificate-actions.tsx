// components/certificate-actions.tsx - pojednostavljena verzija
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileText, Printer, Eye, RefreshCw, CheckCircle } from "lucide-react"
import { generateCertificatePDFAction, createCertificateFromTraining } from "@/app/actions/certificates"
import { toast } from "sonner"

interface CertificateActionsProps {
  certificateId?: string
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
  const [isCreating, setIsCreating] = useState(false)

  const handleGeneratePDF = async () => {
    if (!certificateId) return
    
    setIsGenerating(true)
    try {
      const result = await generateCertificatePDFAction(certificateId)
      
      if (result.success) {
        toast.success("Certificate PDF regenerated", {
          description: `Certificate ${certificateNumber} has been updated.`
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

  // Ako nema certificateId, ali ima trainingId - prikaži dugme za kreiranje
  if (!certificateId && trainingId) {
    return (
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
    )
  }

  // Ako ima certificateId - prikaži osnovne opcije
  return (
    <div className="flex flex-wrap gap-2">
      {/* Regenerate PDF Button */}
      <Button
        onClick={handleGeneratePDF}
        disabled={isGenerating}
        variant="outline"
        size="sm"
      >
        {isGenerating ? (
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="mr-2 h-4 w-4" />
        )}
        {isGenerating ? "Regenerating..." : "Regenerate PDF"}
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
    </div>
  )
}

// ✅ Kada dodajete sertifikat → automatski se generiše PDF

// ✅ Nema više upload opcije → sistem sam kreira profesionalni sertifikat

// ✅ Možete regenerisati PDF ako je potrebno

// ✅ Jednostavniji UI bez opcija za upload