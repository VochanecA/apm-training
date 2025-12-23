import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, invitation_token } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()

    // 1. Kreiraj auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${request.nextUrl.origin}/auth/callback`
      }
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "User creation failed" },
        { status: 500 }
      )
    }

    // 2. Pokušaj da linkuješ sa postojećim profilom (koristi RPC ako postoji)
    try {
      // Prvo proveri da li postoji profil sa ovim email-om
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("id, email, invitation_token, needs_auth_setup")
        .eq("email", email)
        .eq("needs_auth_setup", true)
        .single()

      if (existingProfile) {
        // Proveri invitation token ako je prosleđen
        if (invitation_token && existingProfile.invitation_token !== invitation_token) {
          console.warn("Invitation token mismatch, but continuing...")
        }

        // Ažuriraj profil sa auth user ID
        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({
            id: authData.user.id,
            is_active: true,
            needs_auth_setup: false,
            invitation_token: null,
            auth_user_linked_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq("id", existingProfile.id)

        if (updateError) {
          console.warn("Failed to link profile:", updateError.message)
        } else {
          console.log("Profile successfully linked to auth user")
        }
      }
    } catch (linkError) {
      console.warn("Profile linking failed:", linkError)
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully!",
      userId: authData.user.id
    })

  } catch (error: any) {
    console.error("Signup API error:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}