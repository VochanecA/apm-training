"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plane, ArrowLeft, UserPlus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: { full_name: fullName },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 font-sans antialiased">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/Training-management.jpg" 
          className="h-full w-full object-cover" 
          alt="Background"
        />
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link 
          href="/" 
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Plane className="h-7 w-7 text-primary-foreground rotate-45" />
          </div>
          <h1 className="text-lg font-bold text-white uppercase tracking-tight">Airport Training System</h1>
          <p className="text-xs text-slate-400 font-medium">Tivat Airport Training Center</p>
        </div>

        <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-white">Create Account</CardTitle>
            <CardDescription className="text-slate-400">
              Register for Training Management access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-200 text-sm">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200 text-sm">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@airport.com"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200 text-sm">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  className="bg-white/5 border-white/10 text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <div className="rounded-md bg-destructive/15 p-3 border border-destructive/20 text-center">
                  <p className="text-xs font-medium text-destructive-foreground">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Confirm Registration"}
              </Button>

              <div className="pt-2 text-center text-sm text-slate-400">
                Already have an account?{" "}
                <Link href="/auth/login" className="font-semibold text-primary hover:underline underline-offset-4">
                  Log in
                </Link>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <Link 
                  href="/auth/invited-signup" 
                  className="group flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <UserPlus className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
                  Have an invitation? Click here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}