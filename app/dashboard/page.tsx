// app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  GraduationCap, 
  FileText, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Building2, 
  BookOpen, 
  Shield, 
  Plane, 
  PlusCircle,
  TrendingUp,
  Calendar,
  UserCheck,
  Award,
  Settings,
  Download,
  Bell,
  Search,
  BarChart3,
  Zap,
  ArrowRight,
  ChevronRight
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

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
  const [
    trainingsResult, 
    certificatesResult, 
    expiringCertificatesResult, 
    employeesResult, 
    programsResult,
    activeTrainingsResult
  ] = await Promise.all([
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
    supabase.from("training_programs").select("*", { count: "exact", head: true }),
    supabase
      .from("trainings")
      .select("*", { count: "exact", head: true })
      .eq("status", "in_progress")
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
    <div className="space-y-8 pb-12">
      {/* Header with Welcome & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Welcome back, {profile?.full_name || user.email?.split('@')[0] || 'User'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Here's what's happening with your airport training management today
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button size="sm" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            New Training
          </Button>
        </div>
      </div>

      {/* Stats Grid with Improved Design */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <Card className="relative overflow-hidden border-blue-200/50 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-gray-900">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total Trainings
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {trainingsResult.count || 0}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {activeTrainingsResult.count || 0} active sessions
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-gray-900">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Training Programs
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
              {programsResult.count || 0}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              Available programs
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-green-200/50 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-gray-900">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Valid Certificates
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              {certificatesResult.count || 0}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Currently valid
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-amber-200/50 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-gray-900">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Expiring Soon
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-amber-900 dark:text-amber-100">
              {expiringCertificatesResult.count || 0}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Within 90 days
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-purple-200/50 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-gray-900 sm:col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Total Personnel
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {employeesResult.count || 0}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Registered users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions - Redizajnirano sa bojama */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-gray-900">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
                  <CardDescription>Common tasks and operations</CardDescription>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Zap className="h-3 w-3" />
                  Fast Access
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Link 
                  href="/dashboard/training-programs" 
                  className="group relative overflow-hidden rounded-xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-slate-900 p-4 transition-all hover:scale-[1.02] hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-700 dark:text-blue-300">Training Programs</h3>
                      <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                        Manage & create
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="absolute top-3 right-3 h-4 w-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                <Link 
                  href="/dashboard/trainings" 
                  className="group relative overflow-hidden rounded-xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-slate-900 p-4 transition-all hover:scale-[1.02] hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-emerald-700 dark:text-emerald-300">View Trainings</h3>
                      <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">
                        All sessions
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="absolute top-3 right-3 h-4 w-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                <Link 
                  href="/dashboard/certificates" 
                  className="group relative overflow-hidden rounded-xl border border-green-200/50 bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-slate-900 p-4 transition-all hover:scale-[1.02] hover:shadow-md hover:border-green-300 dark:hover:border-green-700"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-700 dark:text-green-300">Certificates</h3>
                      <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
                        Issue & manage
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="absolute top-3 right-3 h-4 w-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                <Link 
                  href="/dashboard/personnel" 
                  className="group relative overflow-hidden rounded-xl border border-purple-200/50 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-slate-900 p-4 transition-all hover:scale-[1.02] hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-700 dark:text-purple-300">Personnel</h3>
                      <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
                        Directory
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="absolute top-3 right-3 h-4 w-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                <Link 
                  href="/dashboard/airports" 
                  className="group relative overflow-hidden rounded-xl border border-amber-200/50 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-slate-900 p-4 transition-all hover:scale-[1.02] hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-700 dark:text-amber-300">Airports</h3>
                      <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
                        Facilities
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="absolute top-3 right-3 h-4 w-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                <Link 
                  href="/dashboard/reports" 
                  className="group relative overflow-hidden rounded-xl border border-cyan-200/50 bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-950/30 dark:to-slate-900 p-4 transition-all hover:scale-[1.02] hover:shadow-md hover:border-cyan-300 dark:hover:border-cyan-700"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-md">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-cyan-700 dark:text-cyan-300">Reports</h3>
                      <p className="text-xs text-cyan-600/70 dark:text-cyan-400/70 mt-1">
                        Analytics
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="absolute top-3 right-3 h-4 w-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Trainings */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-gray-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">Recent Activities</CardTitle>
                <CardDescription>Latest training sessions</CardDescription>
              </div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTrainings && recentTrainings.length > 0 ? (
                <>
                  {recentTrainings.map((training) => (
                    <div 
                      key={training.id} 
                      className="group flex items-start gap-3 p-3 rounded-lg border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all"
                    >
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                          <GraduationCap className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold truncate">
                            {training.training_program?.name || "Training"}
                          </p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(training.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <UserCheck className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground truncate">
                            {training.trainee?.full_name || "Trainee"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Award className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            {training.training_program?.code || "N/A"}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                  <Button asChild variant="ghost" size="sm" className="w-full mt-4">
                    <Link href="/dashboard/trainings" className="gap-2">
                      View All Activities
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <GraduationCap className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">No recent activities found</p>
                  <Button asChild size="sm">
                    <Link href="/dashboard/trainings/new">Start New Training</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status & Compliance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              System Compliance
            </CardTitle>
            <CardDescription>Current compliance status and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-300">All Systems Operational</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Last updated: Today</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
                  Stable
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <FileText className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium">Compliance Rate</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-2xl font-bold">98.5%</p>
                    <p className="text-xs text-muted-foreground">Above target</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                      <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-sm font-medium">Avg. Training Time</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-2xl font-bold">14.2h</p>
                    <p className="text-xs text-muted-foreground">Per program</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Quick Settings
            </CardTitle>
            <CardDescription>Configure your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Bell className="mr-2 h-4 w-4" />
                Notification Preferences
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Search className="mr-2 h-4 w-4" />
                Search & Filters
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                Dashboard Layout
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Export Settings
              </Button>
            </div>
            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Need help? <Link href="/help" className="text-primary hover:underline">Visit our help center</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer - Modern Design */}
      <footer className="mt-12 pt-8 border-t">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-lg">
                <Plane className="h-6 w-6 text-white rotate-45" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Airport Training Management</h3>
                <p className="text-sm text-muted-foreground">Tivat Airport Training Center</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Comprehensive training, certification, and compliance tracking system 
              for airport personnel. CAA Montenegro approved training center.
            </p>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="gap-2">
                <Shield className="h-3 w-3" />
                CAA Approved
              </Badge>
              <span className="text-xs text-muted-foreground">
                Version 2.1.0 • Updated today
              </span>
            </div>
          </div>

          {[
            {
              title: "Dashboard Links",
              links: [
                { name: "Trainings", href: "/dashboard/trainings" },
                { name: "Certificates", href: "/dashboard/certificates" },
                { name: "Personnel", href: "/dashboard/personnel" },
                { name: "Job Categories", href: "/dashboard/job-categories" }
              ]
            },
            {
              title: "Resources",
              links: [
                { name: "API Status", href: "/api-status" },
                { name: "Documentation", href: "/documentation" },
                { name: "Help Center", href: "/help" },
                { name: "Changelog", href: "/changelog" }
              ]
            },
            {
              title: "Legal",
              links: [
                { name: "Terms & Conditions", href: "/terms" },
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Cookie Policy", href: "/cookies" },
                { name: "Compliance", href: "/compliance" }
              ]
            }
          ].map((section, idx) => (
            <div key={idx}>
              <h4 className="font-semibold text-foreground mb-4">{section.title}</h4>
              <ul className="space-y-3 text-sm">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link 
                      href={link.href} 
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                    >
                      <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 Tivat Airport Training Center. All rights reserved. • 
            Designed and developed with ❤️ by{" "}
            <span className="text-primary font-medium">Alen</span>
            {" • "}
            <a 
              href="mailto:alen.vocanec@apm.co.me" 
              className="text-primary hover:underline transition-colors"
            >
              Contact developer
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}