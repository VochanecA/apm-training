"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Plane, 
  GraduationCap, 
  Shield, 
  FileCheck, 
  Users, 
  MapPin,
  User,
  LogOut,
  LayoutDashboard
} from "lucide-react"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { createClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

const HERO_IMAGES = [
  "/images/TRAINING-MANAGEMENT-SYSTEM-HEADER.jpg",
  "/images/Training-management.jpg",
  "/images/Virtual-management-training.webp"
]

export default function HomePage() {
  const [currentImage, setCurrentImage] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Error getting session:", error)
          return
        }
        
        if (session?.user) {
          console.log("User found in session:", session.user.email)
          
          // Dobij korisničke podatke iz profiles tabele
          const { data: userData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle() // Koristi maybeSingle umesto single da bi izbegao greške ako nema profila
          
          if (profileError) {
            console.error("Error fetching profile:", profileError)
          }
          
          setUser({
            ...session.user,
            profile: userData
          })
        } else {
          console.log("No user session found")
          setUser(null)
        }
      } catch (error) {
        console.error("Error in checkUser:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Pretplata na promene autentifikacije
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)
      
      if (session?.user) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()
        
        setUser({
          ...session.user,
          profile: userData
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error("Error logging out:", error)
      } else {
        console.log("Logout successful")
        setUser(null)
        router.refresh()
      }
    } catch (error) {
      console.error("Error in handleLogout:", error)
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Funkcija za dobijanje inicijala iz imena
  const getUserInitials = () => {
    if (user?.profile?.full_name) {
      const names = user.profile.full_name.split(' ')
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      }
      return names[0][0].toUpperCase()
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return 'U'
  }

  // Koristimo jednostavniji pristup kao u dashboard-nav.tsx
  const renderUserMenu = () => {
    if (loading) {
      return (
        <Button variant="ghost" size="icon" disabled>
          <User className="h-5 w-5 animate-pulse" />
        </Button>
      )
    }

    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <span className="text-sm font-semibold text-primary">
                  {getUserInitials()}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="cursor-pointer">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 hover:text-red-700">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    // Ako korisnik nije prijavljen
    return (
      <>
        <Button asChild variant="ghost" className="hidden sm:inline-flex">
          <Link href="/auth/login">Login</Link>
        </Button>
        <Button asChild className="rounded-md">
          <Link href="/auth/sign-up">Sign Up</Link>
        </Button>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {/* Header - Sa korisničkim menijem */}
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
          
          <div className="flex items-center gap-4">
            <ModeToggle />
            {renderUserMenu()}
          </div>
        </div>
      </header>

      {/* Ostali deo koda ostaje isti... */}
      <section className="relative h-[75vh] min-h-[550px] w-full overflow-hidden flex items-center">
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
              {!loading && !user ? (
                <>
                  <Button asChild size="lg" className="text-base h-12 px-8 rounded-md bg-primary hover:bg-primary/90">
                    <Link href="/auth/sign-up">Get Started</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="text-base h-12 px-8 rounded-md bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white">
                    <Link href="/auth/login">Login to Dashboard</Link>
                  </Button>
                </>
              ) : (
                <Button asChild size="lg" className="text-base h-12 px-8 rounded-md bg-primary hover:bg-primary/90">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              )}
            </div>

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

      <section className="container mx-auto px-4 py-16 font-sans">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-blue-50/50 dark:to-primary/10 rounded-xl overflow-hidden">
          <CardHeader className="text-center py-10">
            <CardTitle className="mb-4 text-3xl">Ready to Get Started?</CardTitle>
            <CardContent>
              <p className="mb-6 text-lg text-muted-foreground max-w-xl mx-auto">
                Join the Airport Training Management system trusted by Montenegro's leading airports
              </p>
              {!loading && !user ? (
                <Button asChild size="lg" className="h-12 px-8 rounded-md">
                  <Link href="/auth/sign-up">Create Your Account</Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="h-12 px-8 rounded-md">
                  <Link href="/dashboard">Access Dashboard</Link>
                </Button>
              )}
            </CardContent>
          </CardHeader>
        </Card>
      </section>
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