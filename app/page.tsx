// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Plane, GraduationCap, Shield, FileCheck, Users, MapPin, Sun, Moon } from "lucide-react"
// import Link from "next/link"
// import { ModeToggle } from "@/components/mode-toggle"

// export default function HomePage() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
//       {/* Header */}
//       <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
//         <div className="container mx-auto flex items-center justify-between px-4 py-4">
//           <div className="flex items-center gap-3">
//             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
//               <Plane className="h-6 w-6 text-primary-foreground" />
//             </div>
//             <div>
//               <h1 className="text-lg font-bold text-foreground">Airport Training Management</h1>
//               <p className="text-xs text-muted-foreground">Tivat Airport Training Center</p>
//             </div>
//           </div>
//           <div className="flex gap-2">
//             <ModeToggle />
//             <Button asChild variant="ghost">
//               <Link href="/auth/login">Login</Link>
//             </Button>
//             <Button asChild>
//               <Link href="/auth/sign-up">Sign Up</Link>
//             </Button>
//           </div>
//         </div>
//       </header>

//       {/* Hero Section */}
//       <section className="container mx-auto px-4 py-16 md:py-24">
//         <div className="mx-auto max-w-3xl text-center">
//           <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
//             <Shield className="h-4 w-4" />
//             CAA Montenegro Approved Training Center
//           </div>
//           <h2 className="mb-6 text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
//             Professional Airport Training Management
//           </h2>
//           <p className="mb-8 text-lg leading-relaxed text-muted-foreground md:text-xl">
//             Comprehensive training, certification, and compliance tracking for airport personnel across multiple
//             facilities. Built for regulatory compliance and operational excellence.
//           </p>
//           <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
//             <Button asChild size="lg" className="text-base">
//               <Link href="/auth/sign-up">Get Started</Link>
//             </Button>
//             <Button asChild size="lg" variant="outline" className="text-base bg-transparent">
//               <Link href="/auth/login">Login to Dashboard</Link>
//             </Button>
//           </div>
//         </div>
//       </section>

//       {/* Features Grid */}
//       <section className="container mx-auto px-4 py-16">
//         <div className="mb-12 text-center">
//           <h3 className="mb-4 text-3xl font-bold text-foreground">Key Features</h3>
//           <p className="text-lg text-muted-foreground">Everything you need for airport training compliance</p>
//         </div>

//         <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//           <Card>
//             <CardHeader>
//               <GraduationCap className="mb-2 h-8 w-8 text-primary" />
//               <CardTitle>Training Programs</CardTitle>
//               <CardDescription>
//                 Manage approved training curricula with theoretical, practical, and on-the-job training modules
//               </CardDescription>
//             </CardHeader>
//           </Card>

//           <Card>
//             <CardHeader>
//               <FileCheck className="mb-2 h-8 w-8 text-primary" />
//               <CardTitle>Certificate Management</CardTitle>
//               <CardDescription>
//                 Issue, track, and export professional competence certificates with automatic expiry alerts
//               </CardDescription>
//             </CardHeader>
//           </Card>

//           <Card>
//             <CardHeader>
//               <Users className="mb-2 h-8 w-8 text-primary" />
//               <CardTitle>Personnel Tracking</CardTitle>
//               <CardDescription>
//                 Complete employee records with multi-airport assignments and role-based access control
//               </CardDescription>
//             </CardHeader>
//           </Card>

//           <Card>
//             <CardHeader>
//               <MapPin className="mb-2 h-8 w-8 text-primary" />
//               <CardTitle>Multi-Airport Support</CardTitle>
//               <CardDescription>
//                 Manage training across multiple airports, heliodromes, and external facilities
//               </CardDescription>
//             </CardHeader>
//           </Card>

//           <Card>
//             <CardHeader>
//               <Shield className="mb-2 h-8 w-8 text-primary" />
//               <CardTitle>Compliance Audits</CardTitle>
//               <CardDescription>
//                 Complete audit trails with 5-year data retention for regulatory inspections
//               </CardDescription>
//             </CardHeader>
//           </Card>

//           <Card>
//             <CardHeader>
//               <FileCheck className="mb-2 h-8 w-8 text-primary" />
//               <CardTitle>PDF Export</CardTitle>
//               <CardDescription>Export certificates, training records, and reports as professional PDFs</CardDescription>
//             </CardHeader>
//           </Card>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="container mx-auto px-4 py-16">
//         <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-gray-800">
//           <CardHeader className="text-center">
//             <CardTitle className="mb-4 text-3xl">Ready to Get Started?</CardTitle>
//             <CardContent>
//               <p className="mb-6 text-lg text-muted-foreground">
//                 Join the Airport Training Management system trusted by Montenegro's leading airports
//               </p>
//               <Button asChild size="lg">
//                 <Link href="/auth/sign-up">Create Your Account</Link>
//               </Button>
//             </CardContent>
//           </CardHeader>
//         </Card>
//       </section>

//       {/* Footer */}
//       <footer className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
//         <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
//           <p>© 2025 Tivat Airport Training Center. All rights reserved.</p>
//           <p className="mt-2">Compliant with Montenegro Civil Aviation Agency regulations</p>
//         </div>
//       </footer>
//     </div>
//   )
// }

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plane, GraduationCap, Shield, FileCheck, Users, MapPin, ChevronRight, Activity } from "lucide-react"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"

const HERO_IMAGES = [
  "/images/TRAINING-MANAGEMENT-SYSTEM-HEADER.jpg",
  "/images/Training-management.jpg",
  "/images/Virtual-management-training.webp"
]

export default function HomePage() {
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {/* Header - Sa tvojim originalnim stilovima teksta */}
      <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm font-sans">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Plane className="h-6 w-6 text-primary-foreground rotate-45" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Airport Training Management</h1>
              <p className="text-xs text-muted-foreground">Tivat Airport Training Center</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild className="rounded-md">
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section with Slider */}
        <section className="relative h-[75vh] min-h-[550px] w-full overflow-hidden flex items-center">
          {/* Background Images */}
          {HERO_IMAGES.map((img, index) => (
            <div
              key={img}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentImage ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="absolute inset-0 bg-slate-950/65 z-10" />
              <img
                src={img}
                alt="Airport Training Background"
                className="h-full w-full object-cover"
              />
            </div>
          ))}

          {/* Hero Content - Original Text */}
          <div className="container relative z-20 mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center text-white font-sans">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 px-4 py-2 text-sm font-medium text-primary-foreground">
                <Shield className="h-4 w-4" />
                CAA Montenegro Approved Training Center
              </div>
              <h2 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl tracking-tight">
                Professional Airport Training Management
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-slate-200 md:text-xl max-w-2xl mx-auto">
                Comprehensive training, certification, and compliance tracking for airport personnel across multiple
                facilities. Built for regulatory compliance and operational excellence.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center items-center">
                <Button asChild size="lg" className="text-base h-12 px-8 rounded-md bg-primary hover:bg-primary/90">
                  <Link href="/auth/sign-up">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base h-12 px-8 rounded-md bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white">
                  <Link href="/auth/login">Login to Dashboard</Link>
                </Button>
              </div>

              {/* Slider Dots */}
              <div className="mt-12 flex justify-center gap-2">
                {HERO_IMAGES.map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`h-1.5 transition-all duration-300 rounded-full ${i === currentImage ? "w-8 bg-primary" : "w-2 bg-white/40"}`} 
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid - Original Content & Style */}
        <section className="container mx-auto px-4 py-20 font-sans">
          <div className="mb-12 text-center">
            <h3 className="mb-4 text-3xl font-bold text-foreground">Key Features</h3>
            <p className="text-lg text-muted-foreground">Everything you need for airport training compliance</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 font-sans">
            <FeatureCard 
              icon={<GraduationCap className="h-8 w-8" />}
              title="Training Programs"
              desc="Manage approved training curricula with theoretical, practical, and on-the-job training modules"
            />
            <FeatureCard 
              icon={<FileCheck className="h-8 w-8" />}
              title="Certificate Management"
              desc="Issue, track, and export professional competence certificates with automatic expiry alerts"
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8" />}
              title="Personnel Tracking"
              desc="Complete employee records with multi-airport assignments and role-based access control"
            />
            <FeatureCard 
              icon={<MapPin className="h-8 w-8" />}
              title="Multi-Airport Support"
              desc="Manage training across multiple airports, heliodromes, and external facilities"
            />
            <FeatureCard 
              icon={<Shield className="h-8 w-8" />}
              title="Compliance Audits"
              desc="Complete audit trails with 5-year data retention for regulatory inspections"
            />
            <FeatureCard 
              icon={<FileCheck className="h-8 w-8" />}
              title="PDF Export"
              desc="Export certificates, training records, and reports as professional PDFs"
            />
          </div>
        </section>

        {/* CTA Section - Original Text */}
        <section className="container mx-auto px-4 py-16 font-sans">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-blue-50/50 dark:to-primary/10 rounded-xl overflow-hidden">
            <CardHeader className="text-center py-10">
              <CardTitle className="mb-4 text-3xl">Ready to Get Started?</CardTitle>
              <CardContent>
                <p className="mb-6 text-lg text-muted-foreground max-w-xl mx-auto">
                  Join the Airport Training Management system trusted by Montenegro's leading airports
                </p>
                <Button asChild size="lg" className="h-12 px-8 rounded-md">
                  <Link href="/auth/sign-up">Create Your Account</Link>
                </Button>
              </CardContent>
            </CardHeader>
          </Card>
        </section>
      </main>

      {/* Footer - Original Text */}
      <footer className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm py-8 font-sans">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Tivat Airport Training Center. All rights reserved.</p>
          <p className="mt-2 text-xs">Compliant with Montenegro Civil Aviation Agency regulations</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <Card className="group hover:border-primary/50 transition-all duration-300">
      <CardHeader>
        <div className="mb-2 text-primary">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-sm pt-1">
          {desc}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}