import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  MapPin, 
  Users, 
  Globe, 
  Calendar,
  ArrowLeft,
  Edit,
  FileText,
  Plane,
  Activity
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface AirportDetailsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AirportDetailsPage({ params }: AirportDetailsPageProps) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { id } = await params

  // Fetch basic airport data
  const { data: airport, error } = await supabase
    .from("airports")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !airport) {
    console.error("Error fetching airport:", error)
    redirect("/dashboard/airports")
  }

  // Fetch counts separately to avoid SQL errors
  const [
    { count: employeeCount },
    { count: trainingCount },
    { count: certificateCount }
  ] = await Promise.all([
    supabase
      .from("employee_airports")
      .select("*", { count: "exact", head: true })
      .eq("airport_id", id),
    
    supabase
      .from("trainings")
      .select("*", { count: "exact", head: true })
      .eq("airport_id", id),
    
    supabase
      .from("certificates")
      .select("*", { count: "exact", head: true })
      .eq("airport_id", id)
  ])

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

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? "bg-green-500/10 text-green-600 border-green-500/20"
      : "bg-red-500/10 text-red-600 border-red-500/20"
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "dd/MM/yyyy")
    } catch {
      return "Invalid date"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/airports">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Airports
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{airport.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Airport code: {airport.code} {airport.icao_code && `(ICAO: ${airport.icao_code})`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/airports/${airport.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeCount || 0}</div>
            <p className="text-xs text-muted-foreground">Assigned personnel</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trainings</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainingCount || 0}</div>
            <p className="text-xs text-muted-foreground">Ongoing sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificateCount || 0}</div>
            <p className="text-xs text-muted-foreground">Issued certificates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facility Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge className={getStatusColor(airport.is_active)}>
                {airport.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Operational status</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Airport Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Airport Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary">
                    <Building2 className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">{airport.name}</h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getTypeColor(airport.type)}>
                        {airport.type?.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="font-mono">
                        {airport.code}
                      </Badge>
                      {airport.icao_code && (
                        <Badge variant="outline" className="font-mono">
                          ICAO: {airport.icao_code}
                        </Badge>
                      )}
                      {airport.iata_code && (
                        <Badge variant="outline" className="font-mono">
                          IATA: {airport.iata_code}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">
                          {airport.location}
                          {airport.country && `, ${airport.country}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Country</p>
                        <p className="font-medium">{airport.country || "Not specified"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="font-medium">{formatDate(airport.created_at)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Last Updated</p>
                        <p className="font-medium">{formatDate(airport.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {airport.description && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Description</h3>
                    <p className="text-sm text-muted-foreground">{airport.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Personnel at this Airport */}
          {employeeCount && employeeCount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Assigned Personnel
                </CardTitle>
                <CardDescription>{employeeCount} employees assigned to this airport</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="rounded-lg border p-4">
                    <p className="text-center text-sm text-muted-foreground">
                      Personnel list would appear here when data is available
                    </p>
                    <Button asChild variant="outline" className="mt-2 w-full">
                      <Link href={`/dashboard/personnel?airport=${airport.id}`}>
                        View All Personnel
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Facility Status</p>
                    <p className={`text-lg font-semibold ${airport.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {airport.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Facility Type</p>
                    <p className="text-lg font-semibold">{airport.type}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Employee Count</span>
                    <span className="font-medium">{employeeCount || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Training Count</span>
                    <span className="font-medium">{trainingCount || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Certificate Count</span>
                    <span className="font-medium">{certificateCount || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                  <Link href={`/dashboard/airports/${airport.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Airport
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  Assign Personnel
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Plane className="mr-2 h-4 w-4" />
                  Schedule Training
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Airport ID</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {airport.id.substring(0, 8)}...
                  </code>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{formatDate(airport.created_at)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium">{formatDate(airport.updated_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}