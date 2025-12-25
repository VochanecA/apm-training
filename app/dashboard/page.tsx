import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, FileText, Users, AlertCircle, CheckCircle, Clock, Building2, BookOpen, Shield, Plane } from "lucide-react"
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

      {/* Footer */}
      <footer className="border-t bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="md:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Plane className="h-6 w-6 text-primary-foreground rotate-45" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Airport Training Management</h3>
                  <p className="text-sm text-muted-foreground">Tivat Airport Training Center</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Comprehensive training, certification, and compliance tracking system 
                for airport personnel. CAA Montenegro approved training center.
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Developed by</span>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">Alen</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Dashboard Links</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link 
                    href="/dashboard/trainings" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Trainings
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/dashboard/certificates" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Certificates
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/dashboard/personnel" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Personnel
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/dashboard/job-categories" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Job Categories
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link 
                    href="/api-status" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    API Status
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/documentation" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/help" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/changelog" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link 
                    href="/terms" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/privacy" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/cookies" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/compliance" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="my-8 h-px bg-border" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-sm text-muted-foreground text-center md:text-left">
              <p>© 2025 Tivat Airport Training Center. All rights reserved.</p>
              <p className="mt-1 text-xs">
                Compliant with Montenegro Civil Aviation Agency regulations
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                  <Shield className="h-3 w-3 text-white" />
                </div>
                <span className="text-xs text-muted-foreground">CAA Approved</span>
              </div>
              
              <div className="flex gap-4 text-sm">
                <Link 
                  href="/terms" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms
                </Link>
                <Link 
                  href="/privacy" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy
                </Link>
                <Link 
                  href="/contact" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground">
              Designed and developed with ❤️ by{" "}
              <span className="text-primary font-medium">Alen</span>
              {" • "}
              <a 
                href="mailto:alen@example.com" 
                className="text-primary hover:underline transition-colors"
              >
                Contact developer
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}