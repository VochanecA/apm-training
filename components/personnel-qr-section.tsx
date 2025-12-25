"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { QrCode, Copy, RefreshCw } from "lucide-react"
import { generateQRCode } from "@/app/actions/qr-codes"
import { format } from "date-fns"

interface PersonnelQRSectionProps {
  personnelId: string
  initialQRData?: {
    qr_code_token?: string | null
    qr_code_last_accessed?: string | null
  }
}

export function PersonnelQRSection({ personnelId, initialQRData }: PersonnelQRSectionProps) {
  const [qrData, setQrData] = useState(initialQRData)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const qrUrl = qrData?.qr_code_token 
    ? `${baseUrl}/personnel-profile/${qrData.qr_code_token}`
    : null

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Never"
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm")
    } catch {
      return "Invalid date"
    }
  }

  const handleGenerateQR = async () => {
    setGenerating(true)
    try {
      const result = await generateQRCode(personnelId)
      if (result.success) {
        // Ažuriraj lokalno stanje
        setQrData({
          qr_code_token: result.qrToken,
          qr_code_last_accessed: null
        })
        
        // Reload stranicu da se osveže
        window.location.reload()
      }
    } catch (error) {
      console.error("Error generating QR code:", error)
    } finally {
      setGenerating(false)
    }
  }

  const handleCopyURL = async () => {
    if (!qrUrl) return
    
    try {
      await navigator.clipboard.writeText(qrUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  return (
    <div className="pt-4 border-t mt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium">QR Code Access</h4>
        {qrData?.qr_code_last_accessed && (
          <span className="text-xs text-muted-foreground">
            Last: {formatDate(qrData.qr_code_last_accessed)}
          </span>
        )}
      </div>
      
      {qrUrl ? (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border">
            <p className="text-xs text-muted-foreground mb-2">
              Scan this QR code to view public profile:
            </p>
            
            {/* Simple QR Code Display */}
            <div className="text-center py-3">
              <div className="inline-block p-4 bg-white rounded-lg border">
                <QrCode className="h-24 w-24 text-black" />
              </div>
            </div>
            
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-1">Profile URL:</p>
              <code className="text-xs bg-white dark:bg-gray-800 p-2 rounded block break-all">
                {qrUrl}
              </code>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full"
                onClick={handleCopyURL}
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "Copied!" : "Copy URL"}
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2"
              onClick={handleGenerateQR}
              disabled={generating}
            >
              {generating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <QrCode className="h-4 w-4 mr-2" />
              )}
              {generating ? "Regenerating..." : "Regenerate QR Code"}
            </Button>
          </div>
        </div>
      ) : (
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          size="sm"
          onClick={handleGenerateQR}
          disabled={generating}
        >
          {generating ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <QrCode className="mr-2 h-4 w-4" />
          )}
          {generating ? "Generating..." : "Generate QR Code"}
        </Button>
      )}
    </div>
  )
}