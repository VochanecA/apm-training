import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plane, GraduationCap, Shield, FileCheck, Users, MapPin } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Plane className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Aviation Training</h1>
              <p className="text-xs text-muted-foreground">Tivat Airport Training Center</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="ghost">
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Shield className="h-4 w-4" />
            CAA Montenegro Approved Training Center
          </div>
          <h2 className="mb-6 text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
            Professional Aviation Safety Training Management
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground md:text-xl">
            Comprehensive training, certification, and compliance tracking for airport personnel across multiple
            facilities. Built for regulatory compliance and operational excellence.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="text-base">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base bg-transparent">
              <Link href="/auth/login">Login to Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h3 className="mb-4 text-3xl font-bold text-foreground">Key Features</h3>
          <p className="text-lg text-muted-foreground">Everything you need for aviation training compliance</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <GraduationCap className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Training Programs</CardTitle>
              <CardDescription>
                Manage approved training curricula with theoretical, practical, and on-the-job training modules
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileCheck className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Certificate Management</CardTitle>
              <CardDescription>
                Issue, track, and export professional competence certificates with automatic expiry alerts
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Personnel Tracking</CardTitle>
              <CardDescription>
                Complete employee records with multi-airport assignments and role-based access control
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <MapPin className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Multi-Airport Support</CardTitle>
              <CardDescription>
                Manage training across multiple airports, heliodromes, and external facilities
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Compliance Audits</CardTitle>
              <CardDescription>
                Complete audit trails with 5-year data retention for regulatory inspections
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileCheck className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>PDF Export</CardTitle>
              <CardDescription>Export certificates, training records, and reports as professional PDFs</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-blue-50">
          <CardHeader className="text-center">
            <CardTitle className="mb-4 text-3xl">Ready to Get Started?</CardTitle>
            <CardContent>
              <p className="mb-6 text-lg text-muted-foreground">
                Join the aviation training system trusted by Montenegro's leading airports
              </p>
              <Button asChild size="lg">
                <Link href="/auth/sign-up">Create Your Account</Link>
              </Button>
            </CardContent>
          </CardHeader>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Tivat Airport Training Center. All rights reserved.</p>
          <p className="mt-2">Compliant with Montenegro Civil Aviation Agency regulations</p>
        </div>
      </footer>
    </div>
  )
}
