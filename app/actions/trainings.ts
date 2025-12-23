"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addTraining(formData: FormData) {
  try {
    const supabase = await createClient()

    const training_program_id = formData.get("training_program_id") as string
    const trainee_id = formData.get("trainee_id") as string
    const instructor_id = formData.get("instructor_id") as string
    const start_date = formData.get("start_date") as string
    const end_date = formData.get("end_date") as string
    const status = formData.get("status") as string

    const { error } = await supabase.from("trainings").insert({
      training_program_id,
      trainee_id,
      instructor_id,
      start_date,
      end_date,
      status,
    })

    if (error) throw error

    revalidatePath("/dashboard/trainings")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error adding training:", error)
    return { success: false, error: error.message }
  }
}
