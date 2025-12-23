"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createJobCategory(formData: FormData) {
  const supabase = await createClient()

  const data = {
    code: formData.get("code") as string,
    name_en: formData.get("name_en") as string,
    name_me: (formData.get("name_me") as string) || (formData.get("name_en") as string),
    description: formData.get("description") as string,
    requires_certificate: formData.get("requires_certificate") === "on",
  }

  const { error } = await supabase.from("job_categories").insert(data)

  if (error) {
    console.error("[v0] Error creating job category:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/personnel")
  return { success: true }
}
