// components/qr-code-display.tsx
"use client"

import { useEffect, useState } from "react"
import QRCode from "qrcode"


interface QRCodeDisplayProps {
  url: string
  size?: number
  className?: string
}

export default function QRCodeDisplay({ url, size = 180, className = "" }: QRCodeDisplayProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("")
  const [error, setError] = useState(false)

  useEffect(() => {
    const generateQR = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(url, {
          width: size,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff"
          }
        })
        setQrCodeDataUrl(dataUrl)
        setError(false)
      } catch (err) {
        console.error("Failed to generate QR code:", err)
        setError(true)
      }
    }

    if (url) {
      generateQR()
    }
  }, [url, size])

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded ${className}`} style={{ width: size, height: size }}>
        <p className="text-xs text-center text-gray-500 p-2">Failed to generate QR code</p>
      </div>
    )
  }

  if (!qrCodeDataUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded animate-pulse ${className}`} style={{ width: size, height: size }}>
        <div className="text-xs text-gray-400">Generating QR...</div>
      </div>
    )
  }

  return (
    <img 
      src={qrCodeDataUrl} 
      alt={`QR Code for ${url}`}
      className={`rounded ${className}`}
      style={{ width: size, height: size }}
    />
  )
}