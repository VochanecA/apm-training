"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plane, ArrowLeft, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push("/dashboard")
      router.refresh()
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
          src="/images/Virtual-management-training.webp" 
          className="h-full w-full object-cover" 
          alt="Background"
        />
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link 
          href="/" 
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Plane className="h-7 w-7 text-primary-foreground rotate-45" />
          </div>
          <h1 className="text-lg font-bold text-white uppercase tracking-tight">Airport Training Management</h1>
          <p className="text-xs text-slate-400 font-medium">Tivat Airport Training Center</p>
        </div>

        <Card className="border-white/10 bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl text-card-foreground shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-white">Login</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-200">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  className="bg-white/5 border-white/10 text-white focus:ring-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <div className="rounded-md bg-destructive/15 p-3 border border-destructive/20 text-center">
                  <p className="text-xs font-medium text-destructive-foreground">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md" disabled={isLoading}>
                {isLoading ? "Authenticating..." : "Sign In to Training Management"}
              </Button>

              <p className="text-center text-sm text-slate-400 pt-2">
                Don't have an account?{" "}
                <Link href="/auth/sign-up" className="font-semibold text-primary hover:underline underline-offset-4">
                  Register
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
        
        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          <ShieldCheck className="h-3 w-3" /> CAA Montenegro Secure Portal
        </div>
      </div>
    </div>
  )
}