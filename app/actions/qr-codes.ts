"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function generateQRCode(personnelId: string) {
  try {
    const supabase = await createClient()
    
    // Proveri autentifikaciju
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Generiši novi token
    const qrToken = crypto.randomUUID()
    const supabaseAdmin = createAdminClient()
    
    // Ažuriraj profil sa novim tokenom
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ 
        qr_code_token: qrToken,
        qr_code_last_accessed: null 
      })
      .eq("id", personnelId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Kreiraj URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const qrUrl = `${baseUrl}/personnel-profile/${qrToken}`

    // Loguj akciju
    await supabaseAdmin
      .from("audit_logs")
      .insert({
        user_id: user.id,
        action: "QR_CODE_GENERATED",
        table_name: "profiles",
        record_id: personnelId,
        new_data: { qr_token: qrToken }
      })

    revalidatePath(`/dashboard/personnel/${personnelId}`)
    
    return { 
      success: true, 
      qrToken, 
      qrUrl,
      message: "QR code generated successfully"
    }

  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getQRCode(personnelId: string) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("profiles")
      .select("qr_code_token, qr_code_last_accessed")
      .eq("id", personnelId)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    if (!data.qr_code_token) {
      // Generiši token ako ne postoji
      return await generateQRCode(personnelId)
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const qrUrl = `${baseUrl}/personnel-profile/${data.qr_code_token}`

    return { 
      success: true, 
      qrToken: data.qr_code_token,
      qrUrl,
      lastAccessed: data.qr_code_last_accessed
    }

  } catch (error: any) {
    return { success: false, error: error.message }
  }
}