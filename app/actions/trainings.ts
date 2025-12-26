"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addTraining(formData: FormData) {
  try {
    const supabase = await createClient()

    const program_id = formData.get("program_id") as string
    const variant_id = formData.get("variant_id") as string  // NOVO POLJE!
    const trainee_id = formData.get("trainee_id") as string
    const instructor_id = formData.get("instructor_id") as string
    const airport_id = formData.get("airport_id") as string
    const start_date = formData.get("start_date") as string
    const end_date = formData.get("end_date") as string
    const status = formData.get("status") as string || "scheduled"

    const { data: programData } = await supabase
      .from("training_programs")
      .select("validity_months")
      .eq("id", program_id)
      .single()

    // Ako nema variant_id, koristite default initial variant
    let finalVariantId = variant_id
    if (!variant_id) {
      const { data: defaultVariant } = await supabase
        .from("training_program_variants")
        .select("id")
        .eq("program_id", program_id)
        .eq("variant_type", "initial")
        .eq("is_active", true)
        .single()
      
      if (defaultVariant) {
        finalVariantId = defaultVariant.id
      }
    }

    const { error } = await supabase.from("trainings").insert({
      program_id,
      variant_id: finalVariantId,
      trainee_id,
      instructor_id,
      airport_id,
      start_date,
      end_date,
      status,
      completion_percentage: 0
    })

    if (error) throw error

    revalidatePath("/dashboard/trainings")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error adding training:", error)
    return { success: false, error: error.message }
  }
}