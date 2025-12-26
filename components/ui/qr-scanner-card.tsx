// components/ui/qr-scanner-card.tsx
"use client"

import { useState, useEffect } from "react"
import { QrCode, Camera, Upload, ArrowRight, CheckCircle, Scan } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QRScanner } from "./qr-scanner"
import { useRouter } from "next/navigation"

export default function QRScannerCard() {
  const [qrUrl, setQrUrl] = useState("")
  const [error, setError] = useState("")
  const [showScanner, setShowScanner] = useState(false)
  const [hasCameraSupport, setHasCameraSupport] = useState(false)
  const router = useRouter()

  // Proveri da li browser podržava kameru
  useEffect(() => {
    const checkCameraSupport = () => {
      const hasGetUserMedia = !!(
        navigator.mediaDevices?.getUserMedia ||
        (navigator as any).webkitGetUserMedia ||
        (navigator as any).mozGetUserMedia ||
        (navigator as any).msGetUserMedia
      )
      
      setHasCameraSupport(hasGetUserMedia)
    }

    checkCameraSupport()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!qrUrl.trim()) {
      setError("Please enter a QR code URL")
      return
    }

    processQRCode(qrUrl)
  }

  const handleScanResult = (result: string) => {
    console.log("QR Code scanned:", result)
    processQRCode(result)
  }

  const processQRCode = (qrCodeData: string) => {
    try {
      setError("")
      
      // Proveri da li je prazan string
      if (!qrCodeData.trim()) {
        setError("QR code is empty")
        return
      }

      let urlToProcess = qrCodeData
      
      // Ako QR kod sadrži URL, koristi ga direktno
      if (qrCodeData.startsWith('http')) {
        urlToProcess = qrCodeData
      } 
      // Ako je samo token (alphanumeric sa možda - i _), dodaj base URL
      else if (qrCodeData.match(/^[a-zA-Z0-9-_]+$/)) {
        urlToProcess = `${window.location.origin}/personnel-profile/${qrCodeData}`
      } 
      // Ako je putanja, dodaj base URL
      else if (qrCodeData.startsWith('/')) {
        urlToProcess = `${window.location.origin}${qrCodeData}`
      }
      // Ako nema prefix, pokušaj da parsiraš kao URL
      else {
        try {
          new URL(qrCodeData)
          urlToProcess = qrCodeData
        } catch {
          // Ako nije validan URL, dodaj https:// prefix
          urlToProcess = `https://${qrCodeData}`
        }
      }
      
      // Pokušaj da parsiraš URL
      try {
        const url = new URL(urlToProcess)
        
        // Proveri da li je naš domen (ako želite ograničenje)
        const isInternalDomain = url.hostname === window.location.hostname
        
        // Izdvoji token iz putanje
        const pathParts = url.pathname.split('/').filter(part => part)
        const token = pathParts[pathParts.length - 1]
        
        if (!token) {
          setError("No personnel token found in QR code")
          return
        }

        // Redirektuj na personnel profile
        router.push(`/personnel-profile/${token}`)
      } catch (urlError) {
        console.error("URL parsing error:", urlError)
        setError("Invalid QR code format. Please check the URL.")
      }
    } catch (err) {
      console.error("Error processing QR code:", err)
      setError("Invalid QR code. Please try again.")
    }
  }

  const startCameraScan = () => {
    if (!hasCameraSupport) {
      alert("Your browser doesn't support camera access. Please use a modern browser like Chrome, Firefox, or Edge.")
      return
    }
    
    // Proveri HTTPS za produkciju
    if (process.env.NODE_ENV === 'production' && window.location.protocol !== 'https:') {
      alert("Camera access requires HTTPS in production. Please use HTTPS to enable camera scanning.")
      return
    }
    
    setShowScanner(true)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Ovde bi implementirali čitanje QR koda iz slike
      // Za sada, samo obavesti korisnika
      alert(`Image "${file.name}" uploaded. QR code scanning from images will be available soon.`)
      
      // Reset file input
      event.target.value = ""
    } catch (err) {
      console.error("Error handling file upload:", err)
      alert("Failed to process image. Please try again.")
    }
  }

  return (
    <>
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
            <div className="md:col-span-2 space-y-6">
              {/* URL Input Section */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Enter QR Code URL
                  </label>
                  <form onSubmit={handleSubmit} className="space-y-2">
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
                  </form>
                </div>
                
                {/* Quick Scan Options */}
                <div>
                  <p className="text-sm font-medium mb-3">Quick Scan Options</p>
                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={startCameraScan}
                      className="flex-1 h-12"
                      disabled={!hasCameraSupport}
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">Camera Scan</div>
                        <div className="text-xs text-muted-foreground">Use device camera</div>
                      </div>
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline"
                      className="flex-1 h-12"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">Upload Image</div>
                        <div className="text-xs text-muted-foreground">Scan from file</div>
                      </div>
                    </Button>
                    
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*,.png,.jpg,.jpeg,.gif,.bmp"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                  
                  {!hasCameraSupport && (
                    <p className="text-xs text-amber-600 mt-2">
                      Camera scanning requires a modern browser with camera support.
                    </p>
                  )}
                </div>
              </div>
              
              {/* How to Use */}
              <div className="rounded-lg bg-muted/30 p-4">
                <h4 className="font-medium mb-2 flex items-center">
                  <Scan className="h-4 w-4 mr-2" />
                  How to Use
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Enter the QR code URL manually, or</li>
                  <li>• Click "Camera Scan" to use your device camera</li>
                  <li>• Or upload an image containing a QR code</li>
                  <li>• You'll be redirected to the personnel verification page</li>
                </ul>
              </div>
            </div>
            
            {/* Benefits Section */}
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
              
              <div className="flex items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                <CheckCircle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Mobile Friendly</p>
                  <p className="text-xs text-amber-600">Works on phones and tablets</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground text-center">
              For on-site inspections, scan the QR code on personnel ID cards to instantly verify 
              all qualifications, certifications, and training records.
            </p>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Note: Camera access requires HTTPS in production environments.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* QR Scanner Dialog */}
      <QRScanner
        open={showScanner}
        onOpenChange={setShowScanner}
        onScan={handleScanResult}
      />
    </>
  )
}