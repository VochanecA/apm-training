"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addCertificate(formData: FormData) {
  try {
    const supabase = await createClient()

    const training_id = formData.get("training_id") as string
    const certificate_number = formData.get("certificate_number") as string
    const issue_date = formData.get("issue_date") as string
    const expiry_date = formData.get("expiry_date") as string
    const status = formData.get("status") as string

    const { data: training, error: trainingError } = await supabase
      .from("trainings")
      .select("trainee_id")
      .eq("id", training_id)
      .single()

    if (trainingError) throw trainingError

    const { error } = await supabase.from("certificates").insert({
      training_id,
      trainee_id: training.trainee_id,
      certificate_number,
      issue_date,
      expiry_date,
      status,
    })

    if (error) throw error

    revalidatePath("/dashboard/certificates")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error adding certificate:", error)
    return { success: false, error: error.message }
  }
}
