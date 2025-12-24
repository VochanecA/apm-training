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

// Ažurirajte addTrainingProgram funkciju
export async function addTrainingProgram(formData: FormData) {
  try {
    const supabase = await createClient()

    const title = formData.get("title") as string
    const code = formData.get("code") as string
    const job_category_id_raw = formData.get("job_category_id") as string
    const description = formData.get("description") as string
    const theoretical_hours = parseInt(formData.get("theoretical_hours") as string) || 0
    const practical_hours = parseInt(formData.get("practical_hours") as string) || 0
    const ojt_hours = parseInt(formData.get("ojt_hours") as string) || 0
    const approval_number = formData.get("approval_number") as string
    const approval_date = formData.get("approval_date") as string
    const approved_by = formData.get("approved_by") as string
    const version = formData.get("version") as string || "1.0"
    const validity_months = parseInt(formData.get("validity_months") as string) || 24

    // Konvertuj posebne vrednosti u null
    const job_category_id = 
      job_category_id_raw === "no-category" || job_category_id_raw === "" ? 
      null : job_category_id_raw

    const total_hours = theoretical_hours + practical_hours + ojt_hours

    const { error } = await supabase.from("training_programs").insert({
      title,
      code,
      job_category_id,
      description: description || null,
      theoretical_hours,
      practical_hours,
      ojt_hours,
      total_hours,
      approval_number: approval_number || null,
      approval_date: approval_date || null,
      approved_by: approved_by || null,
      version,
      validity_months,
      is_active: true,
    })

    if (error) throw error

    revalidatePath("/dashboard/training-programs")
    return { 
      success: true, 
      message: "Training program created successfully" 
    }
  } catch (error: any) {
    console.error("[v0] Error creating training program:", error)
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