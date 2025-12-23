"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addAirport(formData: FormData) {
  try {
    const supabase = await createClient()

    const name = formData.get("name") as string
    const code = formData.get("code") as string
    const icao_code = formData.get("icao_code") as string
    const iata_code = (formData.get("iata_code") as string) || null
    const airport_type = formData.get("airport_type") as string
    const city = formData.get("city") as string
    const country = (formData.get("country") as string) || null

    const { error } = await supabase.from("airports").insert({
      name,
      code,
      icao_code,
      iata_code,
      airport_type,
      city,
      country,
    })

    if (error) throw error

    revalidatePath("/dashboard/airports")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error adding airport:", error)
    return { success: false, error: error.message }
  }
}
