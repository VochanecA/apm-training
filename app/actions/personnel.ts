"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

// Tipovi za rezultat
interface PersonnelSuccess {
  success: true
  message: string
  userId: string
  person?: {
    id: string
    email: string
    full_name: string
    role: string
  }
  invitationToken?: string
  signupLink?: string
  data?: any
}

interface PersonnelError {
  success: false
  error: string
  message?: string
  invitationToken?: never
  signupLink?: never
}

type PersonnelResult = PersonnelSuccess | PersonnelError

export async function addPersonnel(formData: FormData): Promise<PersonnelResult> {
  try {
    const supabase = await createClient()
    
    // 1. Proveri da li je trenutni korisnik admin
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    if (!currentUser) {
      return {
        success: false,
        error: "User not authenticated"
      }
    }

    const { data: userProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single()

    if (!userProfile || userProfile.role !== "admin") {
      return {
        success: false,
        error: "Only administrators can add personnel"
      }
    }

    const full_name = formData.get("full_name") as string
    const email = formData.get("email") as string
    const role = formData.get("role") as string
    const job_category_id_raw = formData.get("job_category_id") as string
    const airport_id_raw = formData.get("airport_id") as string

    // Konvertuj posebne vrednosti u null
    const job_category_id = 
      job_category_id_raw === "no-category" || job_category_id_raw === "" ? 
      null : job_category_id_raw

    const airport_id = 
      airport_id_raw === "no-airport" || airport_id_raw === "" ? 
      null : airport_id_raw

    // Validacija
    if (!email || !email.includes('@')) {
      return {
        success: false,
        error: "Invalid email address"
      }
    }

    if (!full_name || full_name.trim().length < 2) {
      return {
        success: false,
        error: "Full name must be at least 2 characters"
      }
    }

    console.log("Attempting to add personnel via RPC:", { 
      full_name, 
      email, 
      role,
      job_category_id,
      airport_id 
    })

    const supabaseAdmin = createAdminClient()

    // POKUŠAJ: Koristi RPC funkciju create_profile_only
    try {
      console.log("Calling create_profile_only RPC function...")
      
      const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc(
        'create_profile_only',
        {
          p_email: email,
          p_full_name: full_name,
          p_role: role,
          p_job_category_id: job_category_id,
          p_airport_id: airport_id
        }
      )

      if (rpcError) {
        console.error("RPC function error:", rpcError)
        return {
          success: false,
          error: `RPC failed: ${rpcError.message}`
        }
      }

      console.log("RPC result:", rpcResult)

      if (rpcResult?.success === false) {
        return {
          success: false,
          error: rpcResult.error || "RPC function returned error"
        }
      }

      // Ako je uspešno, generiši signup link
      if (rpcResult?.success === true && rpcResult?.invitation_token) {
        const signupLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/invited-signup?email=${encodeURIComponent(email)}&token=${rpcResult.invitation_token}`
        
        console.log("Profile created successfully, signup link:", signupLink)
        
        revalidatePath("/dashboard/personnel")
        return { 
          success: true,
          message: rpcResult.message || "Profile created successfully! Share the signup link with the user.",
          userId: rpcResult.user_id,
          person: {
            id: rpcResult.user_id,
            email: email,
            full_name: full_name,
            role: role
          },
          invitationToken: rpcResult.invitation_token,
          signupLink,
          data: rpcResult
        }
      }

      // Ako nema invitation_token, vrati osnovni rezultat
      revalidatePath("/dashboard/personnel")
      return { 
        success: true,
        message: rpcResult?.message || "Profile created via RPC function.",
        userId: rpcResult?.user_id || '',
        person: rpcResult?.user_id ? {
          id: rpcResult.user_id,
          email: email,
          full_name: full_name,
          role: role
        } : undefined,
        data: rpcResult
      }

    } catch (rpcError: any) {
      console.error("RPC method failed:", rpcError.message)
      
      // FALLBACK: Direktno kreiranje profila
      try {
        console.log("Falling back to direct profile creation...")
        const fallbackResult = await createProfileDirectly(supabaseAdmin, {
          email, 
          full_name, 
          role, 
          job_category_id, 
          airport_id
        })
        
        return fallbackResult
      } catch (fallbackError: any) {
        console.error("Fallback also failed:", fallbackError.message)
        return {
          success: false,
          error: `Both RPC and fallback failed: ${fallbackError.message}`
        }
      }
    }

  } catch (error: any) {
    console.error("Error in addPersonnel:", error)
    return { 
      success: false,
      error: error.message || "Failed to add personnel" 
    }
  }
}

// Direktno kreiranje profila (fallback ako RPC ne radi)
async function createProfileDirectly(
  supabaseAdmin: any,
  data: {
    email: string,
    full_name: string,
    role: string,
    job_category_id: string | null,
    airport_id: string | null
  }
): Promise<PersonnelSuccess | PersonnelError> {
  try {
    const userId = crypto.randomUUID()
    const invitationToken = crypto.randomUUID()
    
    console.log("Creating profile directly, ID:", userId)

    // Prvo proveri da li email već postoji
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("email", data.email)
      .single()

    if (existingProfile) {
      return {
        success: false,
        error: `Email ${data.email} already exists in the system`
      }
    }

    // Kreiraj profil
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        job_category_id: data.job_category_id,
        is_active: false,
        needs_auth_setup: true,
        invitation_token: invitationToken,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      return {
        success: false,
        error: `Profile creation failed: ${profileError.message}`
      }
    }

    // Dodaj aerodrom ako je izabran
    if (data.airport_id && data.airport_id !== "no-airport") {
      const { error: airportError } = await supabaseAdmin
        .from("employee_airports")
        .insert({
          employee_id: userId,
          airport_id: data.airport_id,
          is_primary: true,
          start_date: new Date().toISOString().split("T")[0],
          created_at: new Date().toISOString()
        })

      if (airportError) {
        console.error("Airport assignment error (non-critical):", airportError.message)
      }
    }

    // Generiši signup link
    const signupLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/invited-signup?email=${encodeURIComponent(data.email)}&token=${invitationToken}`

    revalidatePath("/dashboard/personnel")
    
    return {
      success: true,
      message: "Profile created. User can sign up with the provided link.",
      userId,
      person: {
        id: userId,
        email: data.email,
        full_name: data.full_name,
        role: data.role
      },
      invitationToken,
      signupLink
    }
  } catch (error: any) {
    return {
      success: false,
      error: `Direct profile creation failed: ${error.message}`
    }
  }
}