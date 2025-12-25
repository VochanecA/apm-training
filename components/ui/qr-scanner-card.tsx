// components/ui/qr-scanner-card.tsx
"use client"

import { useState } from "react"
import { QrCode, Camera, Upload, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function QRScannerCard() {
  const [qrUrl, setQrUrl] = useState("")
  const [error, setError] = useState("")
  const [scanning, setScanning] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!qrUrl.trim()) {
      setError("Please enter a QR code URL")
      return
    }

    try {
      // Izdvoji token iz URL-a
      const url = new URL(qrUrl)
      const pathParts = url.pathname.split('/')
      const token = pathParts[pathParts.length - 1]
      
      if (!token) {
        setError("Invalid QR code URL format")
        return
      }

      router.push(`/personnel-profile/${token}`)
    } catch (err) {
      setError("Invalid URL format. Please enter a valid QR code URL.")
    }
  }

  const startCameraScan = () => {
    setScanning(true)
    // Simulacija skeniranja
    setTimeout(() => {
      setScanning(false)
      alert("Camera scan would be implemented here. Please use URL input for now.")
    }, 1000)
  }

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <CardTitle className="flex items-center text-lg">
          <QrCode className="h-5 w-5 mr-2 text-primary" />
          Quick Personnel Verification
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Scan personnel QR code to instantly verify qualifications and certifications
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Enter QR Code URL
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="https://yoursite.com/personnel-profile/abc123..."
                    value={qrUrl}
                    onChange={(e) => {
                      setQrUrl(e.target.value)
                      setError("")
                    }}
                    className="flex-1"
                  />
                  <Button type="submit" className="whitespace-nowrap">
                    Verify
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                {error && (
                  <p className="text-sm text-red-600 mt-2">{error}</p>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={startCameraScan}
                  disabled={scanning}
                  className="flex-1"
                >
                  {scanning ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Camera Scan
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  className="flex-1"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      alert(`Image "${file.name}" uploaded. QR scanning from image would be implemented here.`)
                    }
                  }}
                />
              </div>
            </form>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">Real-time Verification</p>
                <p className="text-xs text-green-600">Instant access to personnel records</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">CAA Approved</p>
                <p className="text-xs text-blue-600">Compliant with aviation regulations</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <CheckCircle className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-purple-800">Secure Access</p>
                <p className="text-xs text-purple-600">Encrypted and timestamped</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-muted-foreground text-center">
            For on-site inspections, scan the QR code on personnel ID cards to instantly verify 
            all qualifications, certifications, and training records.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}