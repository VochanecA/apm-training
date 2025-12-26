// components/ui/qr-scanner.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode"
import { Camera, X, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface QRScannerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScan: (result: string) => void
}

export function QRScanner({ open, onOpenChange, onScan }: QRScannerProps) {
  const [error, setError] = useState<string>("")
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [cameraId, setCameraId] = useState<string>("")
  const [availableCameras, setAvailableCameras] = useState<any[]>([])
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const scannerContainerId = "qr-scanner-container"

  useEffect(() => {
    if (open) {
      checkCameraPermission()
      getAvailableCameras()
    }

    return () => {
      stopScanner()
    }
  }, [open])

  useEffect(() => {
    if (open && hasPermission) {
      startScanner()
    }
  }, [open, hasPermission, cameraId])

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      setHasPermission(true)
      setError("")
    } catch (err: any) {
      console.error("Camera permission error:", err)
      setHasPermission(false)
      setError(err.message || "Camera permission denied")
    }
  }

  const getAvailableCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === "videoinput")
      setAvailableCameras(videoDevices)
      
      // Select back camera by default if available
      const backCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes("back") || 
        device.label.toLowerCase().includes("rear")
      )
      
      if (backCamera && backCamera.deviceId) {
        setCameraId(backCamera.deviceId)
      } else if (videoDevices.length > 0) {
        setCameraId(videoDevices[0].deviceId)
      }
    } catch (err) {
      console.error("Error getting cameras:", err)
    }
  }

  const startScanner = () => {
    if (!scannerContainerId || !cameraId) return
    
    stopScanner()

    try {
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
      }

      scannerRef.current = new Html5QrcodeScanner(
        scannerContainerId,
        config,
        false
      )

      scannerRef.current.render(
        (decodedText) => {
          console.log("QR Code scanned:", decodedText)
          onScan(decodedText)
          onOpenChange(false)
        },
        (errorMessage) => {
          // Don't show common scanning errors to user
          if (!errorMessage.includes("NotFoundException")) {
            console.warn("QR scan error:", errorMessage)
          }
        }
      )

      setIsScanning(true)
    } catch (err: any) {
      console.error("Scanner error:", err)
      setError(err.message || "Failed to start scanner")
    }
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear()
      } catch (err) {
        console.error("Error clearing scanner:", err)
      }
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  const handlePermissionRequest = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      setHasPermission(true)
      setError("")
      startScanner()
    } catch (err: any) {
      setError(err.message || "Camera permission denied")
    }
  }

  const handleCameraChange = (deviceId: string) => {
    setCameraId(deviceId)
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        stopScanner()
      }
      onOpenChange(newOpen)
    }}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center text-xl">
              <Camera className="h-5 w-5 mr-2" />
              Scan QR Code
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                stopScanner()
                onOpenChange(false)
              }}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6">
          {hasPermission === false ? (
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Camera Access Required</h3>
                <p className="text-muted-foreground mt-1">
                  Please allow camera access to scan QR codes.
                </p>
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
              </div>
              <Button onClick={handlePermissionRequest}>
                Grant Camera Permission
              </Button>
            </div>
          ) : (
            <>
              {/* Camera Selection */}
              {availableCameras.length > 1 && (
                <div className="mb-4">
                  <label className="text-sm font-medium mb-1 block">
                    Select Camera
                  </label>
                  <select
                    value={cameraId}
                    onChange={(e) => handleCameraChange(e.target.value)}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    {availableCameras.map((camera, index) => (
                      <option key={camera.deviceId} value={camera.deviceId}>
                        {camera.label || `Camera ${index + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* QR Scanner Container */}
              <div className="relative rounded-lg overflow-hidden border">
                <div 
                  id={scannerContainerId}
                  className="min-h-[300px] bg-black flex items-center justify-center"
                />
                
                {/* Scanner overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-64 h-64 border-2 border-white rounded-lg">
                      <div className="absolute -top-1 left-0 w-8 h-8 border-l-2 border-t-2 border-white rounded-tl-lg" />
                      <div className="absolute -top-1 right-0 w-8 h-8 border-r-2 border-t-2 border-white rounded-tr-lg" />
                      <div className="absolute -bottom-1 left-0 w-8 h-8 border-l-2 border-b-2 border-white rounded-bl-lg" />
                      <div className="absolute -bottom-1 right-0 w-8 h-8 border-r-2 border-b-2 border-white rounded-br-lg" />
                    </div>
                  </div>
                </div>

                {/* Loading indicator */}
                {!isScanning && hasPermission && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-white mx-auto mb-2" />
                      <p className="text-white">Starting scanner...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Position QR code within the frame to scan
                </p>
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}