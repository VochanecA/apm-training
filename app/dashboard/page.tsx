import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, FileText, Users, AlertCircle, CheckCircle, Clock, Building2, BookOpen } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  // Fetch statistics
  const [trainingsCount, certificatesCount, expiringCertificates, employeesCount, programsCount] = await Promise.all([
    supabase.from("trainings").select("*", { count: "exact", head: true }),
    supabase
      .from("certificates")
      .select("*", { count: "exact", head: true })
      .eq("status", "valid"),
    supabase
      .from("certificates")
      .select("*", { count: "exact", head: true })
      .gte("expiry_date", new Date().toISOString())
      .lte("expiry_date", new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("training_programs").select("*", { count: "exact", head: true })
  ])

  // Fetch recent trainings
  const { data: recentTrainings } = await supabase
    .from("trainings")
    .select(`
      *,
      training_program:training_programs(name, code),
      trainee:profiles!trainings_trainee_id_fkey(full_name),
      instructor:profiles!trainings_instructor_id_fkey(full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {profile?.full_name || user.email}</h1>
        <p className="mt-2 text-muted-foreground">Your Airport Training Management dashboard overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trainings</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainingsCount.count || 0}</div>
            <p className="text-xs text-muted-foreground">Active training sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Programs</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programsCount.count || 0}</div>
            <p className="text-xs text-muted-foreground">Available programs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valid Certificates</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificatesCount.count || 0}</div>
            <p className="text-xs text-muted-foreground">Currently valid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringCertificates.count || 0}</div>
            <p className="text-xs text-muted-foreground">Within 90 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Personnel</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeesCount.count || 0}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and operations</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button asChild variant="outline" className="justify-start bg-transparent">
              <Link href="/dashboard/training-programs">
                <BookOpen className="mr-2 h-4 w-4" />
                Training Programs
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start bg-transparent">
              <Link href="/dashboard/trainings">
                <GraduationCap className="mr-2 h-4 w-4" />
                View All Trainings
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start bg-transparent">
              <Link href="/dashboard/certificates">
                <FileText className="mr-2 h-4 w-4" />
                Manage Certificates
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start bg-transparent">
              <Link href="/dashboard/personnel">
                <Users className="mr-2 h-4 w-4" />
                Personnel Directory
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start bg-transparent">
              <Link href="/dashboard/airports">
                <Building2 className="mr-2 h-4 w-4" />
                Airport Facilities
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Trainings</CardTitle>
            <CardDescription>Latest training activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTrainings && recentTrainings.length > 0 ? (
                recentTrainings.map((training) => (
                  <div key={training.id} className="flex items-start gap-3">
                    <GraduationCap className="mt-0.5 h-4 w-4 text-primary" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {training.training_program?.name || "Training"}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(training.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {training.trainee?.full_name || "Trainee"} • {training.training_program?.code || "N/A"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No recent trainings found</p>
                  <Button asChild variant="outline" size="sm" className="mt-2">
                    <Link href="/dashboard/trainings">Start a Training</Link>
                  </Button>
                </div>
              )}
              {recentTrainings && recentTrainings.length > 0 && (
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link href="/dashboard/trainings">View All Trainings</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Platform details and resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Training Management</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Create and manage training programs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Schedule training sessions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Track progress and completion</span>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Certificate Management</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Issue and renew certificates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Monitor expiry dates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Generate compliance reports</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}