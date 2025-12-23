"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface TrainingProgramSuccess {
  success: true
  message: string
  programId: string
  data?: any
}

interface TrainingProgramError {
  success: false
  error: string
}

type TrainingProgramResult = TrainingProgramSuccess | TrainingProgramError

export async function addTrainingProgram(formData: FormData): Promise<TrainingProgramResult> {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return {
        success: false,
        error: "User not authenticated"
      }
    }

    // Get form data
    const title = formData.get("title") as string
    const code = formData.get("code") as string
    const job_category_id_raw = formData.get("job_category_id") as string
    const description = formData.get("description") as string
    const theoretical_hours = formData.get("theoretical_hours") as string
    const practical_hours = formData.get("practical_hours") as string
    const ojt_hours = formData.get("ojt_hours") as string
    const approval_number = formData.get("approval_number") as string
    const approval_date = formData.get("approval_date") as string
    const approved_by = formData.get("approved_by") as string
    const version = formData.get("version") as string || "1.0"

    // Validate required fields
    if (!title || title.trim().length < 2) {
      return {
        success: false,
        error: "Title must be at least 2 characters"
      }
    }

    if (!code || code.trim().length < 2) {
      return {
        success: false,
        error: "Code must be at least 2 characters"
      }
    }

    // Convert empty strings to null for optional fields
    const job_category_id = job_category_id_raw === "" ? null : job_category_id_raw
    
    // Convert hours to numbers, default to 0 if empty
    const theoreticalHoursNum = theoretical_hours ? parseInt(theoretical_hours) : 0
    const practicalHoursNum = practical_hours ? parseInt(practical_hours) : 0
    const ojtHoursNum = ojt_hours ? parseInt(ojt_hours) : 0
    const total_hours = theoreticalHoursNum + practicalHoursNum + ojtHoursNum

    // Check if code already exists
    const { data: existingProgram } = await supabase
      .from("training_programs")
      .select("id")
      .eq("code", code.trim())
      .single()

    if (existingProgram) {
      return {
        success: false,
        error: `Program with code "${code}" already exists`
      }
    }

    // Insert new training program
    const { data, error } = await supabase
      .from("training_programs")
      .insert({
        title: title.trim(),
        code: code.trim(),
        job_category_id,
        description: description || null,
        theoretical_hours: theoreticalHoursNum,
        practical_hours: practicalHoursNum,
        ojt_hours: ojtHoursNum,
        total_hours,
        approval_number: approval_number || null,
        approval_date: approval_date || null,
        approved_by: approved_by || null,
        version: version,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating training program:", error)
      return {
        success: false,
        error: `Failed to create training program: ${error.message}`
      }
    }

    revalidatePath("/dashboard/trainings")
    
    return {
      success: true,
      message: `Training program "${title}" created successfully!`,
      programId: data.id,
      data
    }

  } catch (error: any) {
    console.error("Error in addTrainingProgram:", error)
    return {
      success: false,
      error: error.message || "Failed to create training program"
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