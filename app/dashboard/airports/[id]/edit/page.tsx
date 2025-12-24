import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import EditAirportForm from "./edit-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface EditAirportPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditAirportPage({ params }: EditAirportPageProps) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { id } = await params

  // Fetch airport data
  const { data: airport, error } = await supabase
    .from("airports")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !airport) {
    console.error("Error fetching airport:", error)
    redirect("/dashboard/airports")
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/airports/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Airport
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Edit Airport</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update information for {airport.name}
          </p>
        </div>
      </div>

      <EditAirportForm airport={airport} />
    </div>
  )
}