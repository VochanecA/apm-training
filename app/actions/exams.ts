"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addExam(formData: FormData) {
  try {
    const supabase = await createClient()

    const training_id = formData.get("training_id") as string
    const exam_type = formData.get("exam_type") as string
    const exam_date = formData.get("exam_date") as string
    const status = formData.get("status") as string
    const notes = (formData.get("notes") as string) || null

    const { error } = await supabase.from("examinations").insert({
      training_id,
      exam_type,
      exam_date,
      status,
      notes,
      score: null,
    })

    if (error) throw error

    revalidatePath("/dashboard/exams")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error adding exam:", error)
    return { success: false, error: error.message }
  }
}
