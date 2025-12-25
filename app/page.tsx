import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, GraduationCap, FileText, Plane,Users, Building2, Shield, CheckCircle, User, LogOut } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogoutButton } from "@/components/ui/logout-button"
import { HeroCarousel } from "@/components/ui/hero-carousel"
import { ModeToggle } from "@/components/mode-toggle"

const HERO_IMAGES = [
  "/images/TRAINING-MANAGEMENT-SYSTEM-HEADER.jpg",
  "/images/Training-management.jpg",
  "/images/Virtual-management-training.webp"
]

export default async function LandingPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
    profile = data
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold">Airport Training Management</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button asChild variant="ghost">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <ModeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {profile?.full_name || user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <LogoutButton />
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <ModeToggle />
              <Button asChild variant="ghost">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Hero Text */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              {user ? (
                <>Welcome back, {profile?.full_name || user.email?.split('@')[0]}</>
              ) : (
                <>
                  Comprehensive Training Management for{" "}
                  <span className="text-primary">Airport Professionals</span>
                </>
              )}
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              {user 
                ? 'Manage your training programs, certifications, and compliance tracking all in one place.'
                : 'Streamline aviation training, certifications, and compliance tracking for your airport personnel. Ensure regulatory compliance and maintain the highest safety standards.'
              }
            </p>
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-x-6">
              {user ? (
                <>
                  <Button asChild size="lg">
                    <Link href="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/dashboard/trainings">View Trainings</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link href="/auth/register">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Hero Images Carousel */}
          <div className="relative">
            <HeroCarousel images={HERO_IMAGES} />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <GraduationCap className="h-10 w-10 text-primary" />
              <CardTitle>Training Management</CardTitle>
              <CardDescription>
                Create, schedule, and track comprehensive training programs for all airport personnel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                  <span>Customizable training programs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                  <span>Automated scheduling</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                  <span>Progress tracking</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-primary" />
              <CardTitle>Certificate Management</CardTitle>
              <CardDescription>
                Issue, track, and manage all aviation certifications with automated expiry alerts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                  <span>Digital certificate generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                  <span>Expiry notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                  <span>Renewal workflows</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary" />
              <CardTitle>Personnel Directory</CardTitle>
              <CardDescription>
                Maintain detailed records of all airport staff with qualification tracking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                  <span>Comprehensive profiles</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                  <span>Qualification tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                  <span>Role-based access</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Building2 className="h-10 w-10 text-primary" />
              <CardTitle>Airport Facilities</CardTitle>
              <CardDescription>
                Manage multiple airport locations and their specific training requirements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                  <span>Multi-location support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                  <span>Facility-specific programs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                  <span>Resource allocation</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary" />
              <CardTitle>Compliance & Reporting</CardTitle>
              <CardDescription>
                Stay compliant with aviation regulations through automated reporting and audits.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                  <span>Regulatory compliance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                  <span>Automated reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                  <span>Audit trails</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <GraduationCap className="h-10 w-10 text-primary" />
              <CardTitle>Examination System</CardTitle>
              <CardDescription>
                Create and manage assessments to verify training effectiveness and competency.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                  <span>Custom exam creation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                  <span>Automated grading</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                  <span>Performance analytics</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Ready to streamline your airport training?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join leading airports in modernizing their training management.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            {user ? (
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link href="/auth/register">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
{/* Footer */}
<footer className="border-t bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm mt-20">
  <div className="container mx-auto px-4 py-12">
    <div className="grid gap-8 md:grid-cols-4 lg:grid-cols-5">
      {/* Company Info */}
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

      {/* Quick Links */}
      <div>
        <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
        <ul className="space-y-3 text-sm">
          <li>
            <Link 
              href="/dashboard" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
          </li>
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
        </ul>
      </div>

      {/* Resources */}
      <div>
        <h4 className="font-semibold text-foreground mb-4">Resources</h4>
        <ul className="space-y-3 text-sm">
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
              href="/documentation" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Documentation
            </Link>
          </li>
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
              href="/changelog" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Changelog
            </Link>
          </li>
        </ul>
      </div>

      {/* Legal */}
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

    {/* Divider */}
    <div className="my-8 h-px bg-border" />

    {/* Bottom Section */}
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

    {/* Developer Credit */}
    <div className="mt-8 pt-6 border-t border-border/50 text-center">
      <p className="text-xs text-muted-foreground">
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
  </div>
</footer>
    </div>
  )
}