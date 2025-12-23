import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  Building2, 
  User, 
  Shield,
  ArrowLeft,
  Edit,
  Download
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface PersonnelProfilePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PersonnelProfilePage({ params }: PersonnelProfilePageProps) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Unwrap params promise
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

  // Fetch additional data in parallel
  const [jobCategoriesData, airportsData] = await Promise.all([
    personnel.job_category_id 
      ? supabase
          .from("job_categories")
          .select("name_en, name_me, code")
          .eq("id", personnel.job_category_id)
          .single()
      : Promise.resolve({ data: null, error: null }),
    
    supabase
      .from("employee_airports")
      .select(`
        airport_id,
        is_primary,
        start_date,
        airports!inner(name, code, location)
      `)
      .eq("employee_id", id)
  ])

  // Get job category
  const jobCategory = jobCategoriesData.data

  // Get airports
  const assignedAirports = airportsData.data || []
  
  // Get primary airport
  const primaryAirport = assignedAirports.find((ea: any) => ea.is_primary)?.airports

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "dd/MM/yyyy")
    } catch {
      return "Invalid date"
    }
  }

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20"
      case "instructor":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "employee":
      case "trainee":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "inspector":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  // Get status badge
  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="text-muted-foreground">
        Inactive
      </Badge>
    )
  }

  // Get initials for avatar
  const getInitials = (name: string | null) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/personnel">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Personnel
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Personnel Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Detailed information about {personnel.full_name || "this person"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {getInitials(personnel.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div>
                      <h2 className="text-2xl font-bold">{personnel.full_name || "Unknown Name"}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRoleColor(personnel.role)}>
                          {personnel.role?.toUpperCase() || "UNKNOWN"}
                        </Badge>
                        {getStatusBadge(personnel.is_active)}
                        {personnel.needs_auth_setup && (
                          <Badge variant="outline" className="text-amber-600 border-amber-500/20">
                            Pending Signup
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Employee since {formatDate(personnel.created_at)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{personnel.email || "No email"}</p>
                      </div>
                    </div>
                    
                    {personnel.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{personnel.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {personnel.date_of_birth && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Date of Birth</p>
                          <p className="font-medium">{formatDate(personnel.date_of_birth)}</p>
                        </div>
                      </div>
                    )}
                    
                    {personnel.nationality && (
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Nationality</p>
                          <p className="font-medium">{personnel.nationality}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobCategory && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Job Category</p>
                      <p className="font-medium">
                        {jobCategory.name_en || jobCategory.name_me} 
                        ({jobCategory.code})
                      </p>
                    </div>
                  </div>
                )}

                {personnel.employee_id && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Employee ID</p>
                      <p className="font-medium">{personnel.employee_id}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Airport Assignments Card */}
          {assignedAirports.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Airport Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignedAirports.map((assignment: any, index: number) => (
                    <div key={index} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {assignment.airports?.name} ({assignment.airports?.code})
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {assignment.airports?.location}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={assignment.is_primary ? "default" : "outline"}>
                            {assignment.is_primary ? "Primary" : "Secondary"}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Since {formatDate(assignment.start_date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
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
                    <p className="text-sm text-muted-foreground">Account Status</p>
                    <p className={`text-lg font-semibold ${personnel.is_active ? 'text-green-600' : 'text-amber-600'}`}>
                      {personnel.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Auth Setup</p>
                    <p className={`text-lg font-semibold ${personnel.needs_auth_setup ? 'text-amber-600' : 'text-green-600'}`}>
                      {personnel.needs_auth_setup ? 'Pending' : 'Complete'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-medium">{formatDate(personnel.created_at)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-medium">{formatDate(personnel.updated_at)}</span>
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
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Profile
                </Button>
                {personnel.needs_auth_setup && (
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    Resend Invitation
                  </Button>
                )}
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
                  <span className="text-muted-foreground">Profile ID</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {personnel.id.substring(0, 8)}...
                  </code>
                </div>
                {personnel.invitation_token && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Invitation Token</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {personnel.invitation_token.substring(0, 8)}...
                    </code>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}