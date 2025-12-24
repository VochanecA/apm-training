import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import EditPersonnelForm from "./edit-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface EditPersonnelPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditPersonnelPage({ params }: EditPersonnelPageProps) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { id } = await params

  // Fetch personnel data
  const { data: personnel, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !personnel) {
    console.error("Error fetching personnel:", error)
    redirect("/dashboard/personnel")
  }

  // Fetch dropdown options
  const [jobCategories, airports, employeeAirports] = await Promise.all([
    supabase
      .from("job_categories")
      .select("id, name_en, name_me, code")
      .order("name_en"),
    
    supabase
      .from("airports")
      .select("id, name, code, location")
      .order("name"),
    
    supabase
      .from("employee_airports")
      .select("airport_id, is_primary, start_date")
      .eq("employee_id", id)
  ])

  // Get current assignments
  const currentAssignments = employeeAirports.data?.map(a => ({
    airport_id: a.airport_id,
    is_primary: a.is_primary,
    start_date: a.start_date
  })) || []

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/personnel/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Edit Personnel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update information for {personnel.full_name}
          </p>
        </div>
      </div>

      {/* Pass personnel.id as a prop */}
      <EditPersonnelForm 
        personnelId={id}
        personnel={personnel}
        jobCategories={jobCategories.data || []}
        airports={airports.data || []}
        currentAssignments={currentAssignments}
      />
    </div>
  )
}