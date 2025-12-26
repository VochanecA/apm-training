// app/actions/training-programs.ts
"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// app/actions/training-programs.ts
export async function addTrainingProgram(formData: FormData) {
  try {
    console.log("Starting addTrainingProgram function...")
    
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error("Auth error:", authError)
      throw new Error("Authentication failed")
    }
    
    if (!user) {
      throw new Error("User not authenticated")
    }
    
    console.log("User authenticated:", user.email)

    // Ispis svih podataka iz forme za debug
    console.log("Form data received:")
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`)
    }

    const title = formData.get("title") as string
    const code = formData.get("code") as string
    const job_category_id_raw = formData.get("job_category_id") as string
    const primary_instructor_id_raw = formData.get("primary_instructor_id") as string
    const description = formData.get("description") as string
    const theoretical_hours = parseInt(formData.get("theoretical_hours") as string) || 0
    const practical_hours = parseInt(formData.get("practical_hours") as string) || 0
    const ojt_hours = parseInt(formData.get("ojt_hours") as string) || 0
    const approval_number = formData.get("approval_number") as string
    const approval_date = formData.get("approval_date") as string
    const approved_by = formData.get("approved_by") as string
    const version = formData.get("version") as string || "1.0"
    const validity_months = parseInt(formData.get("validity_months") as string) || 24

    // Validacija
    if (!title || title.trim().length < 2) {
      throw new Error("Title is required and must be at least 2 characters")
    }
    
    if (!code || code.trim().length < 2) {
      throw new Error("Code is required and must be at least 2 characters")
    }

    // Konvertuj posebne vrednosti u null
    const job_category_id = 
      job_category_id_raw === "no-category" || job_category_id_raw === "" || !job_category_id_raw ? 
      null : job_category_id_raw

    // Konvertuj instruktora u null ako je prazan string
    const primary_instructor_id = 
      primary_instructor_id_raw === "" || !primary_instructor_id_raw ? 
      null : primary_instructor_id_raw

    console.log("Inserting data into database...")
    console.log("Data to insert:", {
      title,
      code,
      job_category_id,
      primary_instructor_id,
      description,
      theoretical_hours,
      practical_hours,
      ojt_hours,
      approval_number,
      approval_date,
      approved_by,
      version,
      validity_months
    })

    const { data, error } = await supabase
      .from("training_programs")
      .insert({
        title: title.trim(),
        code: code.trim().toUpperCase(),
        job_category_id,
        primary_instructor_id,
        description: description?.trim() || null,
        theoretical_hours,
        practical_hours,
        ojt_hours,
        approval_number: approval_number?.trim() || null,
        approval_date: approval_date || null,
        approved_by: approved_by?.trim() || null,
        version: version?.trim() || "1.0",
        validity_months,
        is_active: true,
      })
      .select()

    if (error) {
      console.error("Supabase insert error:", error)
      throw error
    }

    console.log("Insert successful! Data:", data)

    revalidatePath("/dashboard/training-programs")
    return { 
      success: true, 
      message: "Training program created successfully",
      programId: data?.[0]?.id || "",
      data: data?.[0]
    }
  } catch (error: any) {
    console.error("[v0] Error creating training program:", error)
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      details: error.details
    })
    
    let errorMessage = "Failed to create training program"
    
    // Specifične greške
    if (error.code === '23505') {
      errorMessage = "A training program with this code already exists"
    } else if (error.code === '42501') {
      errorMessage = "Permission denied. Check your RLS policies"
    } else if (error.message.includes("network")) {
      errorMessage = "Network error. Please check your connection"
    } else if (error.message.includes("total_hours")) {
      errorMessage = "Database error: total_hours is auto-calculated"
    } else if (error.message.includes("primary_instructor_id")) {
      errorMessage = "Invalid instructor selected"
    }
    
    return { 
      success: false, 
      error: errorMessage
    }
  }
}

export async function getJobCategories() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("job_categories")
      .select("id, name_en, name_me, code")
      .order("name_en")

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error("Error fetching job categories:", error)
    return { success: false, error: error.message }
  }
}