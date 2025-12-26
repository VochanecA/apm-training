// app/actions/certificates.ts
"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { generateCertificatePDF } from "@/components/pdf-certificate-template"

// Dodajte ovu funkciju u app/actions/certificates.ts
export async function autoCreateCertificateOnTrainingComplete(trainingId: string) {
  try {
    const supabase = await createClient()

    // Proverite da li sertifikat već postoji
    const { data: existingCertificate } = await supabase
      .from("certificates")
      .select("id")
      .eq("training_id", trainingId)
      .single()

    if (existingCertificate) {
      return { success: false, error: "Certificate already exists for this training" }
    }

    // Kreirajte sertifikat koristeći postojeću funkciju
    return await createCertificateFromTraining(trainingId)
  } catch (error: any) {
    console.error("Error auto-creating certificate:", error)
    return { success: false, error: error.message }
  }
}
// U app/actions/certificates.ts, pronađite addCertificate funkciju i modifikujte je:

export async function addCertificate(formData: FormData) {
  const supabase = await createClient()

  try {
    const training_id = formData.get("training_id") as string
    const certificate_number = formData.get("certificate_number") as string
    const issue_date = formData.get("issue_date") as string
    const expiry_date = formData.get("expiry_date") as string
    const status = formData.get("status") as string
    const pdf_file = formData.get("pdf_file") as File | null

    // Validate required fields
    if (!training_id || !certificate_number || !issue_date || !expiry_date || !status) {
      return { success: false, error: "All required fields must be filled" }
    }

    // Fetch training data to get trainee_id and other details
    const { data: trainingData, error: trainingError } = await supabase
      .from("trainings")
      .select(`
        trainee_id, 
        airport_id,
        trainee:profiles!trainings_trainee_id_fkey(job_category_id)
      `)
      .eq("id", training_id)
      .single()

    if (trainingError || !trainingData) {
      return { success: false, error: "Training not found" }
    }

    // Extract job_category_id from trainee (nested object)
    const traineeData = Array.isArray(trainingData.trainee) 
      ? trainingData.trainee[0] 
      : trainingData.trainee
    
    const job_category_id = traineeData?.job_category_id || null

    // Create certificate
    const { data: certificate, error: certificateError } = await supabase
      .from("certificates")
      .insert({
        trainee_id: trainingData.trainee_id,
        training_id: training_id,
        certificate_number: certificate_number,
        issue_date: issue_date,
        expiry_date: expiry_date,
        status: status,
        airport_id: trainingData.airport_id,
        job_category_id: job_category_id,
      })
      .select()
      .single()

    if (certificateError) {
      console.error("Certificate creation error:", certificateError)
      return { success: false, error: certificateError.message }
    }

    // Handle PDF upload if provided
    if (pdf_file && pdf_file.size > 0) {
      // ... postojeći kod za upload ...
    } else {
      // AUTOMATSKA GENERACIJA PDF-a ako nije upload-ovan fajl
      // Pozovite generateCertificatePDFAction sa novim certificate ID
      await generateCertificatePDFAction(certificate.id)
    }

    revalidatePath("/dashboard/certificates")
    revalidatePath(`/dashboard/personnel/${trainingData.trainee_id}`)
    
    return { 
      success: true, 
      certificateId: certificate.id,
      message: "Certificate added successfully" 
    }
  } catch (error: any) {
    console.error("Error adding certificate:", error)
    return { success: false, error: error.message || "Internal server error" }
  }
}
export async function generateCertificatePDFAction(certificateId: string) {
  try {
    const supabase = await createClient()

    // Fetch certificate data with all related information
    const { data: certificate, error } = await supabase
      .from("certificates")
      .select(`
        *,
        trainee:profiles!certificates_trainee_id_fkey(
          id,
          full_name,
          employee_id,
          date_of_birth,
          nationality
        ),
        job_categories!certificates_job_category_id_fkey(
          name_en,
          name_me,
          code
        ),
        airports!certificates_airport_id_fkey(
          name,
          code,
          location,
          country
        ),
        training:trainings!certificates_training_id_fkey(
          id,
          start_date,
          end_date,
          training_program:training_programs!trainings_program_id_fkey(
            title,
            code,
            description,
            total_hours
          ),
          instructor:profiles!trainings_instructor_id_fkey(
            full_name
          )
        ),
        theoretical_exam:examinations!certificates_theoretical_exam_id_fkey(
          score,
          max_score,
          passed
        ),
        practical_exam:examinations!certificates_practical_exam_id_fkey(
          score,
          max_score,
          passed
        )
      `)
      .eq("id", certificateId)
      .single()

    if (error || !certificate) {
      console.error("Certificate not found:", error)
      return { success: false, error: "Certificate not found" }
    }

    // Fetch system settings for director signature and company info
    const { data: settings } = await supabase
      .from("settings")
      .select("*")
      .single()

    // Prepare certificate data for PDF generation
    const certificateData = {
      certificateNumber: certificate.certificate_number,
      traineeName: certificate.trainee?.full_name || "Unknown",
      employeeId: certificate.trainee?.employee_id || "N/A",
      trainingProgram: certificate.training?.training_program?.title || "Training Program",
      trainingCode: certificate.training?.training_program?.code || "N/A",
      jobCategory: certificate.job_categories?.name_en || certificate.job_categories?.name_me || "N/A",
      jobCategoryCode: certificate.job_categories?.code || "N/A",
      issueDate: certificate.issue_date,
      expiryDate: certificate.expiry_date,
      airportName: certificate.airports?.name || "Airport",
      airportCode: certificate.airports?.code || "N/A",
      airportLocation: certificate.airports?.location || "",
      issuedByName: settings?.director_name || "Director of Training",
      directorSignatureImage: settings?.director_signature_url,
      companyLogo: settings?.company_logo_url,
      theoreticalScore: certificate.theoretical_exam?.score,
      theoreticalMaxScore: certificate.theoretical_exam?.max_score,
      practicalScore: certificate.practical_exam?.score,
      practicalMaxScore: certificate.practical_exam?.max_score,
      trainingHours: certificate.training?.training_program?.total_hours || 0,
      trainingInstructor: certificate.training?.instructor?.full_name || "N/A",
      additionalNotes: certificate.notes || `Issued in accordance with aviation regulations. Valid until ${certificate.expiry_date}.`
    }

    // Generate PDF
    const pdfDoc = await generateCertificatePDF({
      certificateData,
      templateType: 'standard'
    })

    // Convert PDF to Blob for storage
    const pdfBlob = pdfDoc.output('blob')
    const fileName = `${certificate.id}_${certificate.certificate_number.replace(/\s+/g, '_')}_generated.pdf`
    
    try {
      // Upload generated PDF to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(`pdfs/${fileName}`, pdfBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'application/pdf'
        })

      if (uploadError) {
        console.error("Error uploading generated PDF:", uploadError)
        // Fallback to base64 if storage fails
        const pdfBase64 = pdfDoc.output('datauristring')
        
        const { error: updateError } = await supabase
          .from("certificates")
          .update({ 
            pdf_url: pdfBase64,
            updated_at: new Date().toISOString()
          })
          .eq("id", certificateId)

        if (updateError) {
          console.error("Error updating certificate with base64 PDF:", updateError)
        }
      } else {
        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('certificates')
          .getPublicUrl(`pdfs/${fileName}`)

        // Update certificate with PDF URL
        const { error: updateError } = await supabase
          .from("certificates")
          .update({ 
            pdf_url: publicUrl,
            pdf_storage_path: `pdfs/${fileName}`,
            updated_at: new Date().toISOString()
          })
          .eq("id", certificateId)

        if (updateError) {
          console.error("Error updating certificate with PDF URL:", updateError)
        }
      }
    } catch (storageError) {
      console.error("Storage error:", storageError)
      // Fallback to base64
      const pdfBase64 = pdfDoc.output('datauristring')
      
      await supabase
        .from("certificates")
        .update({ 
          pdf_url: pdfBase64,
          updated_at: new Date().toISOString()
        })
        .eq("id", certificateId)
    }

    revalidatePath(`/dashboard/certificates/${certificateId}`)
    revalidatePath(`/dashboard/personnel/${certificate.trainee_id}`)
    
    return { 
      success: true, 
      certificateNumber: certificate.certificate_number,
      message: "Certificate PDF generated successfully"
    }
  } catch (error: any) {
    console.error("Error generating certificate PDF:", error)
    return { success: false, error: error.message || "Failed to generate certificate PDF" }
  }
}

export async function uploadExistingCertificate(certificateId: string, formData: FormData) {
  try {
    const supabase = await createClient()
    const file = formData.get("pdf_file") as File
    
    if (!file) {
      return { success: false, error: "No file provided" }
    }

    if (file.type !== "application/pdf") {
      return { success: false, error: "Please upload a valid PDF file" }
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return { success: false, error: "File size must be less than 10MB" }
    }

    // Get certificate info for file naming
    const { data: certificate, error: certError } = await supabase
      .from("certificates")
      .select("certificate_number")
      .eq("id", certificateId)
      .single()

    if (certError) {
      return { success: false, error: "Certificate not found" }
    }

    const fileName = `${certificateId}_${certificate.certificate_number.replace(/\s+/g, '_')}_uploaded.pdf`
    
    try {
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(`pdfs/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'application/pdf'
        })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        
        // Fallback to base64 if storage fails
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64 = `data:application/pdf;base64,${buffer.toString('base64')}`

        const { error: updateError } = await supabase
          .from("certificates")
          .update({ 
            pdf_url: base64,
            updated_at: new Date().toISOString()
          })
          .eq("id", certificateId)

        if (updateError) {
          throw updateError
        }
      } else {
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('certificates')
          .getPublicUrl(`pdfs/${fileName}`)

        // Update certificate with PDF URL
        const { error: updateError } = await supabase
          .from("certificates")
          .update({ 
            pdf_url: publicUrl,
            pdf_storage_path: `pdfs/${fileName}`,
            updated_at: new Date().toISOString()
          })
          .eq("id", certificateId)

        if (updateError) {
          throw updateError
        }
      }

      revalidatePath(`/dashboard/certificates/${certificateId}`)
      
      return { 
        success: true, 
        message: "Certificate PDF uploaded successfully"
      }
    } catch (storageError: any) {
      console.error("Storage error:", storageError)
      // Try fallback to base64
      try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64 = `data:application/pdf;base64,${buffer.toString('base64')}`

        await supabase
          .from("certificates")
          .update({ 
            pdf_url: base64,
            updated_at: new Date().toISOString()
          })
          .eq("id", certificateId)

        return { 
          success: true, 
          message: "Certificate PDF uploaded successfully (stored as base64)"
        }
      } catch (fallbackError) {
        throw new Error("Failed to upload PDF")
      }
    }
  } catch (error: any) {
    console.error("Error uploading certificate:", error)
    return { success: false, error: error.message || "Failed to upload certificate" }
  }
}

export async function createCertificateFromTraining(trainingId: string) {
  try {
    const supabase = await createClient()

    // Fetch training data with all related information
    const { data: training, error: trainingError } = await supabase
      .from("trainings")
      .select(`
        *,
        trainee:profiles!trainings_trainee_id_fkey(
          id,
          full_name,
          employee_id,
          job_category_id
        ),
        training_program:training_programs!trainings_program_id_fkey(
          title,
          code,
          validity_months,
          total_hours
        ),
        airports!trainings_airport_id_fkey(
          id,
          name,
          code
        )
      `)
      .eq("id", trainingId)
      .single()

    if (trainingError || !training) {
      return { success: false, error: "Training not found" }
    }

    if (training.status !== "completed") {
      return { success: false, error: "Training must be completed to issue certificate" }
    }

    // Check if certificate already exists for this training
    const { data: existingCertificate } = await supabase
      .from("certificates")
      .select("id")
      .eq("training_id", trainingId)
      .single()

    if (existingCertificate) {
      return { success: false, error: "Certificate already exists for this training" }
    }

    // Generate certificate number
    const timestamp = new Date().getTime()
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, '0')
    const certificateNumber = `CERT-${training.training_program?.code || "TNG"}-${year}${month}-${timestamp.toString().slice(-6)}`

    // Calculate dates
    const issueDate = new Date()
    const validityMonths = training.training_program?.validity_months || 24
    const expiryDate = new Date(issueDate)
    expiryDate.setMonth(expiryDate.getMonth() + validityMonths)

    // Fetch examination results if available
    const { data: examinations } = await supabase
      .from("examinations")
      .select("*")
      .eq("training_id", trainingId)

    let theoreticalExamId = null
    let practicalExamId = null

    if (examinations) {
      examinations.forEach(exam => {
        if (exam.exam_type === "theoretical") {
          theoreticalExamId = exam.id
        } else if (exam.exam_type === "practical") {
          practicalExamId = exam.id
        }
      })
    }

    // Extract trainee data (could be array or object)
    const traineeData = Array.isArray(training.trainee) 
      ? training.trainee[0] 
      : training.trainee

    // Create certificate record
    const { data: certificate, error: certificateError } = await supabase
      .from("certificates")
      .insert({
        certificate_number: certificateNumber,
        trainee_id: training.trainee_id,
        job_category_id: traineeData?.job_category_id || null,
        training_id: trainingId,
        airport_id: training.airport_id,
        issue_date: issueDate.toISOString().split("T")[0],
        expiry_date: expiryDate.toISOString().split("T")[0],
        status: "valid",
        theoretical_exam_id: theoreticalExamId,
        practical_exam_id: practicalExamId,
        notes: `Certificate issued upon successful completion of ${training.training_program?.title} training. Training hours: ${training.training_program?.total_hours || 0}.`
      })
      .select()
      .single()

    if (certificateError) {
      throw certificateError
    }

    // Automatically generate PDF
    const pdfResult = await generateCertificatePDFAction(certificate.id)
    
    revalidatePath(`/dashboard/personnel/${training.trainee_id}`)
    revalidatePath("/dashboard/certificates")
    revalidatePath(`/dashboard/certificates/${certificate.id}`)
    
    return { 
      success: true, 
      certificateId: certificate.id,
      certificateNumber,
      message: "Certificate created successfully"
    }
  } catch (error: any) {
    console.error("Error creating certificate:", error)
    return { success: false, error: error.message || "Failed to create certificate" }
  }
}

export async function getCertificateDetails(certificateId: string) {
  try {
    const supabase = await createClient()

    const { data: certificate, error } = await supabase
      .from("certificates")
      .select(`
        *,
        trainee:profiles!certificates_trainee_id_fkey(
          id,
          full_name,
          employee_id,
          date_of_birth,
          nationality,
          phone,
          email
        ),
        job_categories!certificates_job_category_id_fkey(
          name_en,
          name_me,
          code,
          description
        ),
        airports!certificates_airport_id_fkey(
          name,
          code,
          location,
          country
        ),
        training:trainings!certificates_training_id_fkey(
          id,
          start_date,
          end_date,
          status,
          completion_percentage,
          training_program:training_programs!trainings_program_id_fkey(
            title,
            code,
            description,
            theoretical_hours,
            practical_hours,
            ojt_hours,
            total_hours
          ),
          instructor:profiles!trainings_instructor_id_fkey(
            full_name,
            email
          )
        ),
        theoretical_exam:examinations!certificates_theoretical_exam_id_fkey(
          id,
          score,
          max_score,
          passed,
          exam_date
        ),
        practical_exam:examinations!certificates_practical_exam_id_fkey(
          id,
          score,
          max_score,
          passed,
          exam_date
        ),
        skill_checks!skill_checks_certificate_id_fkey(
          id,
          check_date,
          passed,
          score,
          notes
        )
      `)
      .eq("id", certificateId)
      .single()

    if (error) {
      throw error
    }

    return { success: true, certificate }
  } catch (error: any) {
    console.error("Error fetching certificate details:", error)
    return { success: false, error: error.message }
  }
}

export async function updateCertificate(certificateId: string, formData: FormData) {
  try {
    const supabase = await createClient()

    const updates = {
      certificate_number: formData.get("certificate_number") as string,
      issue_date: formData.get("issue_date") as string,
      expiry_date: formData.get("expiry_date") as string,
      status: formData.get("status") as string,
      notes: formData.get("notes") as string,
      updated_at: new Date().toISOString()
    }

    // Remove undefined values
    Object.keys(updates).forEach(key => {
      if (updates[key as keyof typeof updates] === undefined) {
        delete updates[key as keyof typeof updates]
      }
    })

    const { error } = await supabase
      .from("certificates")
      .update(updates)
      .eq("id", certificateId)

    if (error) throw error

    revalidatePath(`/dashboard/certificates/${certificateId}`)
    revalidatePath("/dashboard/certificates")
    
    return { success: true }
  } catch (error: any) {
    console.error("Error updating certificate:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteCertificate(certificateId: string) {
  try {
    const supabase = await createClient()

    // Get certificate info for revalidation and storage cleanup
    const { data: certificate } = await supabase
      .from("certificates")
      .select("trainee_id, pdf_storage_path")
      .eq("id", certificateId)
      .single()

    // Delete PDF from storage if exists
    if (certificate?.pdf_storage_path) {
      try {
        await supabase.storage
          .from('certificates')
          .remove([certificate.pdf_storage_path])
      } catch (storageError) {
        console.error("Error deleting PDF from storage:", storageError)
        // Continue with certificate deletion even if storage cleanup fails
      }
    }

    const { error } = await supabase
      .from("certificates")
      .delete()
      .eq("id", certificateId)

    if (error) throw error

    revalidatePath("/dashboard/certificates")
    if (certificate?.trainee_id) {
      revalidatePath(`/dashboard/personnel/${certificate.trainee_id}`)
    }
    
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting certificate:", error)
    return { success: false, error: error.message }
  }
}

// Helper function to check if certificates bucket exists
export async function checkStorageBucket() {
  try {
    const supabase = await createClient()
    
    // List buckets to check if certificates bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error("Error listing buckets:", error)
      return { exists: false, error: error.message }
    }
    
    const certificatesBucket = buckets?.find(b => b.name === 'certificates')
    
    return { 
      exists: !!certificatesBucket,
      bucket: certificatesBucket 
    }
  } catch (error: any) {
    console.error("Error checking storage bucket:", error)
    return { exists: false, error: error.message }
  }
}

// Helper function to list PDF files in certificates bucket
export async function listCertificatePDFs() {
  try {
    const supabase = await createClient()
    
    const { data: files, error } = await supabase.storage
      .from('certificates')
      .list('pdfs')
    
    if (error) {
      console.error("Error listing PDF files:", error)
      return { success: false, error: error.message }
    }
    
    return { success: true, files }
  } catch (error: any) {
    console.error("Error listing certificate PDFs:", error)
    return { success: false, error: error.message }
  }
}