import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Users, Search, Download } from "lucide-react"
import Link from "next/link"
import { AddAirportDialog } from "@/components/add-airport-dialog"
import { AirportActions } from "@/components/airports/airport-actions"

export default async function AirportsPage() {  // OVO JE VAŽNO: AirportsPage, ne AirportDetailsPage
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch all airports with employee count
  const { data: airports, error } = await supabase
    .from("airports")
    .select(`
      *,
      employee_airports(count)
    `)
    .order("name")

  // Dodajte ovo za debugging
  if (error) {
    console.error("Error fetching airports list:", error)
  }

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "airport":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "heliodrome":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20"
      case "training_facility":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Airport Facilities</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage airports and heliodromes</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" size="sm">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <AddAirportDialog />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Facilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{airports?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Airports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {airports?.filter((a) => a.type === "airport").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Heliodromes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {airports?.filter((a) => a.type === "heliodrome").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Training Facilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {airports?.filter((a) => a.type === "training_facility").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Airports List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {airports && airports.length > 0 ? (
          airports.map((airport) => (
            <Card key={airport.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <CardTitle className="text-lg leading-tight">{airport.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <span className="font-mono">{airport.code}</span>
                      {airport.icao_code && <span className="font-mono">/ {airport.icao_code}</span>}
                      {airport.iata_code && <span className="font-mono">/ {airport.iata_code}</span>}
                    </CardDescription>
                  </div>
                  <Badge className={getTypeColor(airport.type)} variant="outline">
                    {airport.type?.toUpperCase() || "UNKNOWN"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {airport.location}
                      {airport.country && `, ${airport.country}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4 flex-shrink-0" />
                    <span>Type: {airport.type}</span>
                  </div>
                  {airport.employee_airports && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span>{airport.employee_airports[0]?.count || 0} employees</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Link href={`/dashboard/airports/${airport.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No airports found</h3>
              <p className="mt-2 text-sm text-muted-foreground">Start by adding your first airport facility</p>
              <div className="mt-4">
                <AddAirportDialog />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}