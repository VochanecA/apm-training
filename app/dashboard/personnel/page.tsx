import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Mail, Briefcase, Building2, Search, Download } from "lucide-react"
import Link from "next/link"
import { AddPersonnelDialog } from "@/components/add-personnel-dialog"

export default async function PersonnelPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch all data using RPC for job categories
  const [{ data: personnel }, { data: jobCategories }, { data: airports }] = await Promise.all([
    supabase
      .from("profiles")
      .select(`
        *,
        employee_airports(airport:airports(name, code))
      `)
      .order("created_at", { ascending: false }),
    supabase.rpc('get_job_categories_formatted'), // Koristimo RPC funkciju
    supabase.from("airports").select("id, name, code").order("name"),
  ])

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20"
      case "instructor":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "employee":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Personnel</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage employees and staff members</p>
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
          <AddPersonnelDialog 
            jobCategories={jobCategories || []} 
            airports={airports || []} 
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Personnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personnel?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Instructors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personnel?.filter((p) => p.role === "instructor").length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personnel?.filter((p) => p.role === "employee").length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personnel?.filter((p) => p.role === "admin").length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Personnel List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {personnel && personnel.length > 0 ? (
          personnel.map((person) => (
            <Card key={person.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(person.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <CardTitle className="text-base leading-tight">{person.full_name || "Unknown"}</CardTitle>
        <Badge className={getRoleColor(person.role)} variant="outline">
  {person.role.toUpperCase()}
</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{person.email}</span>
                  </div>
                  {person.employee_airports && person.employee_airports.length > 0 && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <Building2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-xs">
                          {person.employee_airports.map((ea: any) => ea.airport?.code).join(", ")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Link href={`/dashboard/personnel/${person.id}`}>View Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No personnel found</h3>
              <p className="mt-2 text-sm text-muted-foreground">Start by adding your first employee</p>
              <Button className="mt-4" size="sm">
                <Users className="mr-2 h-4 w-4" />
                Add Personnel
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}