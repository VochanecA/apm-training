// app/actions/training-programs.ts
"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Originalna funkcija za dodavanje programa (ostaje ista)
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

// NOVO: Dodavanje varijante pomoću FormData
export async function addTrainingProgramVariant(formData: FormData) {
  try {
    console.log("Starting addTrainingProgramVariant function...")
    
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error("Auth error:", authError)
      throw new Error("Authentication failed")
    }
    
    if (!user) {
      throw new Error("User not authenticated")
    }

    console.log("Form data received for variant:")
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`)
    }

    const program_id = formData.get("program_id") as string
    const variant_type = formData.get("variant_type") as string
    const variant_name = formData.get("variant_name") as string
    const description = formData.get("description") as string
    const theoretical_hours = parseInt(formData.get("theoretical_hours") as string) || 0
    const practical_hours = parseInt(formData.get("practical_hours") as string) || 0
    const ojt_hours = parseInt(formData.get("ojt_hours") as string) || 0
    const validity_months = parseInt(formData.get("validity_months") as string) || 24
    const is_active = formData.get("is_active") === "true" || formData.get("is_active") === "on"

    // Validacija
    if (!program_id) {
      throw new Error("Program ID is required")
    }
    
    if (!variant_name || variant_name.trim().length < 2) {
      throw new Error("Variant name is required and must be at least 2 characters")
    }

    // Provjeri da li program postoji
    const { data: programData, error: programError } = await supabase
      .from("training_programs")
      .select("id, title")
      .eq("id", program_id)
      .single()

    if (programError || !programData) {
      throw new Error("Training program not found")
    }

    // Izračunaj ukupne sate
    const total_hours = theoretical_hours + practical_hours + ojt_hours

    console.log("Inserting variant data:", {
      program_id,
      variant_type,
      variant_name,
      description,
      theoretical_hours,
      practical_hours,
      ojt_hours,
      total_hours,
      validity_months,
      is_active
    })

    const { data, error } = await supabase
      .from("training_program_variants")
      .insert({
        program_id,
        variant_type,
        variant_name: variant_name.trim(),
        description: description?.trim() || null,
        theoretical_hours,
        practical_hours,
        ojt_hours,
        simulation_hours: 0,
        total_hours,
        validity_months,
        regulation_reference: null,
        authority_approval: null,
        is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error("Supabase insert error:", error)
      // Detaljnija greška
      if (error.code === '23505') {
        throw new Error("A variant with this name already exists for this program")
      } else if (error.code === '23503') {
        throw new Error("Invalid program ID or foreign key constraint violation")
      } else if (error.message.includes("variant_type")) {
        throw new Error("Invalid variant type selected. Must be one of: initial, recurrent, requalification, refresher, conversion, update")
      }
      throw error
    }

    console.log("Variant insert successful! Data:", data)

    // Revalidiraj stranice
    revalidatePath("/dashboard/training-programs")
    revalidatePath(`/dashboard/training-programs/${program_id}`)
    revalidatePath(`/dashboard/training-programs/${program_id}/variants`)

    return { 
      success: true, 
      message: "Training program variant added successfully",
      variantId: data?.[0]?.id || "",
      data: data?.[0]
    }
  } catch (error: any) {
    console.error("[v0] Error adding training program variant:", error)
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      details: error.details
    })
    
    let errorMessage = "Failed to add training program variant"
    
    // Specifične greške
    if (error.code === '23505') {
      errorMessage = "A variant with this name already exists for this program"
    } else if (error.code === '42501') {
      errorMessage = "Permission denied. Check your RLS policies"
    } else if (error.message.includes("network")) {
      errorMessage = "Network error. Please check your connection"
    } else if (error.message.includes("variant_type")) {
      errorMessage = "Invalid variant type selected"
    }
    
    return { 
      success: false, 
      error: errorMessage
    }
  }
}

// NOVO: Ažuriranje varijante
export async function updateTrainingProgramVariant(formData: FormData) {
  try {
    console.log("Starting updateTrainingProgramVariant function...")
    
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error("Auth error:", authError)
      throw new Error("Authentication failed")
    }
    
    if (!user) {
      throw new Error("User not authenticated")
    }

    const variant_id = formData.get("variant_id") as string
    const variant_type = formData.get("variant_type") as string
    const variant_name = formData.get("variant_name") as string
    const description = formData.get("description") as string
    const theoretical_hours = parseInt(formData.get("theoretical_hours") as string) || 0
    const practical_hours = parseInt(formData.get("practical_hours") as string) || 0
    const ojt_hours = parseInt(formData.get("ojt_hours") as string) || 0
    const validity_months = parseInt(formData.get("validity_months") as string) || 24
    const is_active = formData.get("is_active") === "true" || formData.get("is_active") === "on"

    // Validacija
    if (!variant_id) {
      throw new Error("Variant ID is required")
    }
    
    if (!variant_name || variant_name.trim().length < 2) {
      throw new Error("Variant name is required and must be at least 2 characters")
    }

    // Provjeri da li varijanta postoji
    const { data: variantData, error: variantError } = await supabase
      .from("training_program_variants")
      .select("id, program_id")
      .eq("id", variant_id)
      .single()

    if (variantError || !variantData) {
      throw new Error("Variant not found")
    }

    const program_id = variantData.program_id
    const total_hours = theoretical_hours + practical_hours + ojt_hours

    console.log("Updating variant data:", {
      variant_id,
      variant_type,
      variant_name,
      theoretical_hours,
      practical_hours,
      ojt_hours,
      total_hours,
      validity_months,
      is_active
    })

    const { data, error } = await supabase
      .from("training_program_variants")
      .update({
        variant_type,
        variant_name: variant_name.trim(),
        description: description?.trim() || null,
        theoretical_hours,
        practical_hours,
        ojt_hours,
        simulation_hours: 0,
        total_hours,
        validity_months,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq("id", variant_id)
      .select()

    if (error) {
      console.error("Supabase update error:", error)
      if (error.code === '23505') {
        throw new Error("A variant with this name already exists")
      }
      throw error
    }

    console.log("Variant update successful! Data:", data)

    // Revalidiraj stranice
    revalidatePath("/dashboard/training-programs")
    revalidatePath(`/dashboard/training-programs/${program_id}`)
    revalidatePath(`/dashboard/training-programs/${program_id}/variants`)

    return { 
      success: true, 
      message: "Training program variant updated successfully",
      data: data?.[0]
    }
  } catch (error: any) {
    console.error("[v0] Error updating training program variant:", error)
    
    let errorMessage = "Failed to update training program variant"
    
    if (error.code === '23505') {
      errorMessage = "A variant with this name already exists"
    } else if (error.code === '42501') {
      errorMessage = "Permission denied. Check your RLS policies"
    }
    
    return { 
      success: false, 
      error: errorMessage
    }
  }
}

// NOVO: Brisanje varijante
export async function deleteTrainingProgramVariant(variantId: string) {
  try {
    console.log("Starting deleteTrainingProgramVariant function...")
    
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error("Auth error:", authError)
      throw new Error("Authentication failed")
    }
    
    if (!user) {
      throw new Error("User not authenticated")
    }

    if (!variantId) {
      throw new Error("Variant ID is required")
    }

    // Prvo dobij program_id za revalidaciju
    const { data: variantData, error: fetchError } = await supabase
      .from("training_program_variants")
      .select("program_id")
      .eq("id", variantId)
      .single()

    if (fetchError) {
      throw new Error("Variant not found")
    }

    const program_id = variantData.program_id

    console.log("Deleting variant:", variantId)

    const { error } = await supabase
      .from("training_program_variants")
      .delete()
      .eq("id", variantId)

    if (error) {
      console.error("Supabase delete error:", error)
      throw error
    }

    console.log("Variant delete successful!")

    // Revalidiraj stranice
    revalidatePath("/dashboard/training-programs")
    revalidatePath(`/dashboard/training-programs/${program_id}`)
    revalidatePath(`/dashboard/training-programs/${program_id}/variants`)

    return { 
      success: true, 
      message: "Training program variant deleted successfully"
    }
  } catch (error: any) {
    console.error("[v0] Error deleting training program variant:", error)
    
    let errorMessage = "Failed to delete training program variant"
    
    if (error.code === '42501') {
      errorMessage = "Permission denied. Check your RLS policies"
    } else if (error.message.includes("foreign key")) {
      errorMessage = "Cannot delete variant because it is referenced by other records"
    }
    
    return { 
      success: false, 
      error: errorMessage
    }
  }
}

// NOVO: Dohvatanje varijanti za program
export async function getTrainingProgramVariants(programId: string) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("training_program_variants")
      .select("*")
      .eq("program_id", programId)
      .order("variant_type", { ascending: true })
      .order("created_at", { ascending: true })

    if (error) throw error

    return { 
      success: true, 
      data: data || []
    }
  } catch (error: any) {
    console.error("Error fetching training program variants:", error)
    return { 
      success: false, 
      error: error.message,
      data: []
    }
  }
}

// Originalna funkcija za dohvaćanje job categories (ostaje ista)
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

// NOVO: Dohvatanje jednog programa
export async function getTrainingProgram(programId: string) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("training_programs")
      .select(`
        *,
        primary_instructor:profiles!training_programs_primary_instructor_id_fkey(id, full_name, email, role),
        job_category:job_categories!training_programs_job_category_id_fkey(id, name_en, code)
      `)
      .eq("id", programId)
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error("Error fetching training program:", error)
    return { success: false, error: error.message }
  }
}