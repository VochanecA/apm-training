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

// Update Airport Function
export async function updateAirport(id: string, formData: FormData) {
  try {
    const supabase = await createClient()

    const name = formData.get("name") as string
    const code = formData.get("code") as string
    const type = formData.get("type") as string
    const location = formData.get("location") as string
    const country = formData.get("country") as string
    const icao_code = formData.get("icao_code") as string
    const iata_code = formData.get("iata_code") as string
    const description = formData.get("description") as string
    const is_active = formData.get("is_active") === "true"

    const { error } = await supabase
      .from("airports")
      .update({
        name,
        code,
        type,
        location,
        country,
        icao_code: icao_code || null,
        iata_code: iata_code || null,
        description: description || null,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error

    revalidatePath("/dashboard/airports")
    revalidatePath(`/dashboard/airports/${id}`)
    revalidatePath(`/dashboard/airports/${id}/edit`)
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error updating airport:", error)
    return { success: false, error: error.message }
  }
}

// Delete Airport Function
export async function deleteAirport(id: string) {
  try {
    const supabase = await createClient()

    // Check for dependencies before deleting
    const [assignmentsResult, trainingsResult, certificatesResult] = await Promise.all([
      supabase.from("employee_airports").select("id").eq("airport_id", id).limit(1),
      supabase.from("trainings").select("id").eq("airport_id", id).limit(1),
      supabase.from("certificates").select("id").eq("airport_id", id).limit(1),
    ])

    if (assignmentsResult.data && assignmentsResult.data.length > 0) {
      return { 
        success: false, 
        error: "Cannot delete airport. It has employees assigned." 
      }
    }

    if (trainingsResult.data && trainingsResult.data.length > 0) {
      return { 
        success: false, 
        error: "Cannot delete airport. It has training records." 
      }
    }

    if (certificatesResult.data && certificatesResult.data.length > 0) {
      return { 
        success: false, 
        error: "Cannot delete airport. It has certificate records." 
      }
    }

    const { error } = await supabase
      .from("airports")
      .delete()
      .eq("id", id)

    if (error) throw error

    revalidatePath("/dashboard/airports")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error deleting airport:", error)
    return { success: false, error: error.message }
  }
}

// Toggle Airport Active Status
export async function toggleAirportStatus(id: string, isActive: boolean) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("airports")
      .update({ 
        is_active: !isActive,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)

    if (error) throw error

    revalidatePath("/dashboard/airports")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error toggling airport status:", error)
    return { success: false, error: error.message }
  }
}

// Get Airport Details
export async function getAirport(id: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("airports")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error("[v0] Error fetching airport:", error)
    return { success: false, error: error.message }
  }
}

// Get All Airports
export async function getAllAirports() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("airports")
      .select(`
        *,
        employee_airports(count)
      `)
      .order("name")

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error("[v0] Error fetching airports:", error)
    return { success: false, error: error.message }
  }
}