// components/pdf-certificate-template.tsx
"use client"

import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { format } from "date-fns"

interface CertificateTemplateProps {
  certificateData: {
    certificateNumber: string
    traineeName: string
    trainingProgram: string
    jobCategory: string
    issueDate: string
    expiryDate: string
    airportName: string
    airportCode: string
    issuedByName: string
    signatureImage?: string
    directorSignatureImage?: string
    certificateTitle?: string
    additionalNotes?: string
  }
  templateType?: 'standard' | 'premium' | 'simple'
}

export const generateCertificatePDF = async (props: CertificateTemplateProps) => {
  const { certificateData, templateType = 'standard' } = props
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })

  // Margini
  const marginLeft = 20
  const marginRight = 20
  const pageWidth = doc.internal.pageSize.width

  // Background color
  doc.setFillColor(240, 240, 245)
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.height, 'F')

  // Header - Certificate Border
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(1)
  doc.rect(marginLeft, 15, pageWidth - marginLeft * 2, doc.internal.pageSize.height - 30)

  // Title
  doc.setFontSize(32)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(41, 128, 185)
  const titleText = certificateData.certificateTitle || 'CERTIFICATE OF COMPLETION'
  const titleWidth = doc.getTextWidth(titleText)
  doc.text(titleText, (pageWidth - titleWidth) / 2, 40)

  // Subtitle
  doc.setFontSize(16)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('This certifies that', (pageWidth) / 2, 60, { align: 'center' })

  // Trainee Name
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(certificateData.traineeName.toUpperCase(), (pageWidth) / 2, 80, { align: 'center' })

  // Completion Text
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  const completionText = `has successfully completed the ${certificateData.trainingProgram}`
  doc.text(completionText, (pageWidth) / 2, 95, { align: 'center' })

  // Training Details
  doc.setFontSize(12)
  const detailsY = 115
  const details = [
    [`Job Category:`, certificateData.jobCategory],
    [`Airport:`, `${certificateData.airportName} (${certificateData.airportCode})`],
    [`Certificate Number:`, certificateData.certificateNumber],
    [`Issue Date:`, format(new Date(certificateData.issueDate), 'dd MMMM yyyy')],
    [`Valid Until:`, format(new Date(certificateData.expiryDate), 'dd MMMM yyyy')]
  ]

  autoTable(doc, {
    startY: detailsY,
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 12,
      cellPadding: 6,
      lineColor: [240, 240, 240],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    body: details.map(row => [
      { content: row[0], styles: { fontStyle: 'bold', textColor: [100, 100, 100] } },
      { content: row[1], styles: { textColor: [50, 50, 50] } }
    ]),
    margin: { left: marginLeft + 30, right: marginRight + 30 }
  })

  // Footer Section
  const footerY = 170

  // Issued By
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('Issued By:', marginLeft + 40, footerY)

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(certificateData.issuedByName, marginLeft + 40, footerY + 10)

  // Signature
  if (certificateData.directorSignatureImage) {
    try {
      const signatureImg = new Image()
      signatureImg.src = certificateData.directorSignatureImage
      await new Promise((resolve) => {
        signatureImg.onload = resolve
      })
      doc.addImage(signatureImg, 'PNG', marginLeft + 30, footerY + 15, 40, 20)
    } catch (error) {
      console.error('Error loading signature image:', error)
      // Fallback to text signature
      doc.setFontSize(10)
      doc.setFont('helvetica', 'italic')
      doc.text('_________________________', marginLeft + 30, footerY + 25)
      doc.text('Director Signature', marginLeft + 35, footerY + 32)
    }
  }

  // Certificate Seal (Right side)
  const sealX = pageWidth - marginRight - 60
  doc.setDrawColor(41, 128, 185)
  doc.setFillColor(255, 255, 255)
  doc.circle(sealX, footerY, 30, 'FD')

  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(41, 128, 185)
  doc.text('CAA', sealX - 8, footerY - 5)

  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('APPROVED', sealX - 10, footerY + 5)

  // Additional Notes
  if (certificateData.additionalNotes) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(150, 150, 150)
    doc.text(certificateData.additionalNotes, pageWidth / 2, doc.internal.pageSize.height - 20, { align: 'center' })
  }

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(200, 200, 200)
  doc.text('Certificate ID: ' + certificateData.certificateNumber, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' })
  doc.text('Generated: ' + format(new Date(), 'dd/MM/yyyy HH:mm'), pageWidth / 2, doc.internal.pageSize.height - 5, { align: 'center' })

  return doc
}

export const CertificatePreview = ({ certificateData }: { certificateData: any }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 shadow-2xl rounded-lg">
      {/* Certificate Header */}
      <div className="text-center mb-8">
        <div className="inline-block border-b-2 border-primary pb-2 mb-4">
          <h1 className="text-4xl font-bold text-primary mb-2">CERTIFICATE OF COMPLETION</h1>
          <p className="text-gray-600">This certifies that</p>
        </div>
        
        {/* Trainee Name */}
        <h2 className="text-3xl font-bold text-gray-900 my-6 uppercase">
          {certificateData.traineeName}
        </h2>
        
        <p className="text-lg text-gray-700 mb-8">
          has successfully completed the <span className="font-semibold">{certificateData.trainingProgram}</span>
        </p>
      </div>

      {/* Certificate Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div>
            <span className="text-sm font-semibold text-gray-500">Job Category:</span>
            <p className="text-lg font-medium">{certificateData.jobCategory}</p>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-500">Airport:</span>
            <p className="text-lg font-medium">{certificateData.airportName} ({certificateData.airportCode})</p>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-500">Certificate Number:</span>
            <p className="text-lg font-medium font-mono">{certificateData.certificateNumber}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <span className="text-sm font-semibold text-gray-500">Issue Date:</span>
            <p className="text-lg font-medium">
              {format(new Date(certificateData.issueDate), 'dd MMMM yyyy')}
            </p>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-500">Valid Until:</span>
            <p className="text-lg font-medium">
              {format(new Date(certificateData.expiryDate), 'dd MMMM yyyy')}
            </p>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-500">Issued By:</span>
            <p className="text-lg font-medium">{certificateData.issuedByName}</p>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="border-t pt-8 mt-8">
        <div className="flex justify-between items-end">
          <div className="text-center">
            {certificateData.directorSignatureImage ? (
              <div className="mb-2">
                <img 
                  src={certificateData.directorSignatureImage} 
                  alt="Director Signature" 
                  className="h-16 w-auto"
                />
              </div>
            ) : (
              <div className="border-t-2 border-gray-400 w-48 mb-2"></div>
            )}
            <p className="text-sm font-semibold text-gray-700">Director of Training Center</p>
            <p className="text-xs text-gray-500">{certificateData.issuedByName}</p>
          </div>
          
          <div className="text-center">
            <div className="w-24 h-24 rounded-full border-4 border-primary flex items-center justify-center mx-auto mb-2">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">CAA</div>
                <div className="text-xs text-gray-600">APPROVED</div>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-700">Official Seal</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t text-center">
        <p className="text-xs text-gray-500">
          Certificate ID: {certificateData.certificateNumber} • Generated: {format(new Date(), 'dd/MM/yyyy HH:mm')}
        </p>
      </div>
    </div>
  )
}