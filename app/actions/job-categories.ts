"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Postojeća funkcija za kreiranje
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

  revalidatePath("/dashboard/job-categories")
  revalidatePath("/dashboard/personnel")
  return { success: true }
}

// Nova funkcija za ažuriranje
export async function updateJobCategory(id: string, formData: FormData) {
  try {
    const supabase = await createClient()

    const data = {
      code: formData.get("code") as string,
      name_en: formData.get("name_en") as string,
      name_me: (formData.get("name_me") as string) || formData.get("name_en"),
      description: formData.get("description") as string,
      requires_certificate: formData.get("requires_certificate") === "on",
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from("job_categories")
      .update(data)
      .eq("id", id)

    if (error) throw error

    revalidatePath("/dashboard/job-categories")
    revalidatePath(`/dashboard/job-categories/${id}`)
    revalidatePath("/dashboard/personnel")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error updating job category:", error)
    return { success: false, error: error.message }
  }
}

// Nova funkcija za brisanje
export async function deleteJobCategory(id: string) {
  try {
    const supabase = await createClient()

    // Proveri da li postoje povezani profili
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id")
      .eq("job_category_id", id)
      .limit(1)

    if (profiles && profiles.length > 0) {
      return { 
        success: false, 
        error: "Cannot delete job category. There are personnel assigned to this category." 
      }
    }

    // Proveri da li postoje povezani trening programi
    const { data: trainingPrograms } = await supabase
      .from("training_programs")
      .select("id")
      .eq("job_category_id", id)
      .limit(1)

    if (trainingPrograms && trainingPrograms.length > 0) {
      return { 
        success: false, 
        error: "Cannot delete job category. There are training programs associated with this category." 
      }
    }

    const { error } = await supabase
      .from("job_categories")
      .delete()
      .eq("id", id)

    if (error) throw error

    revalidatePath("/dashboard/job-categories")
    revalidatePath("/dashboard/personnel")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error deleting job category:", error)
    return { success: false, error: error.message }
  }
}

// Nova funkcija za dobijanje svih kategorija
export async function getAllJobCategories() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("job_categories")
      .select(`
        *,
        profiles(count),
        training_programs(count)
      `)
      .order("code")

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error("[v0] Error fetching job categories:", error)
    return { success: false, error: error.message }
  }
}

// Nova funkcija za dobijanje jedne kategorije
export async function getJobCategory(id: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("job_categories")
      .select(`
        *,
        profiles(
          id,
          full_name,
          email,
          role,
          is_active
        ),
        training_programs(
          id,
          title,
          code,
          is_active
        )
      `)
      .eq("id", id)
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error("[v0] Error fetching job category:", error)
    return { success: false, error: error.message }
  }
}

// Dodajte ovu funkciju na kraj fajla:

export async function addPersonnelToCategory(jobCategoryId: string, personnelIds: string[]) {
  try {
    const supabase = await createClient()

    // Proveri da li osoblje već pripada ovoj kategoriji
    const { data: existingPersonnel } = await supabase
      .from("profiles")
      .select("id")
      .eq("job_category_id", jobCategoryId)
      .in("id", personnelIds)

    const existingIds = existingPersonnel?.map(p => p.id) || []
    const newPersonnelIds = personnelIds.filter(id => !existingIds.includes(id))

    if (newPersonnelIds.length === 0) {
      return { 
        success: false, 
        error: "Selected personnel are already assigned to this category" 
      }
    }

    // Ažuriraj profile
    const { error } = await supabase
      .from("profiles")
      .update({ job_category_id: jobCategoryId })
      .in("id", newPersonnelIds)

    if (error) throw error

    revalidatePath(`/dashboard/job-categories/${jobCategoryId}`)
    revalidatePath("/dashboard/job-categories")
    revalidatePath("/dashboard/personnel")
    return { 
      success: true, 
      message: `Successfully assigned ${newPersonnelIds.length} personnel to category`,
      assignedCount: newPersonnelIds.length
    }
  } catch (error: any) {
    console.error("[v0] Error adding personnel to category:", error)
    return { success: false, error: error.message }
  }
}

// Nova funkcija za uklanjanje osoblja iz kategorije
export async function removePersonnelFromCategory(jobCategoryId: string, personnelId: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("profiles")
      .update({ job_category_id: null })
      .eq("id", personnelId)
      .eq("job_category_id", jobCategoryId)

    if (error) throw error

    revalidatePath(`/dashboard/job-categories/${jobCategoryId}`)
    revalidatePath("/dashboard/job-categories")
    revalidatePath("/dashboard/personnel")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error removing personnel from category:", error)
    return { success: false, error: error.message }
  }
}