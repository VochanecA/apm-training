import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Provera autentifikacije
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = params
    const qrToken = crypto.randomUUID()
    
    // Ažuriraj profil sa novim tokenom
    const { error } = await supabase
      .from("profiles")
      .update({ 
        qr_code_token: qrToken,
        qr_code_last_accessed: null 
      })
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Vrati korisnika nazad na profil
    return NextResponse.redirect(new URL(`/dashboard/personnel/${id}`, request.url))
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}