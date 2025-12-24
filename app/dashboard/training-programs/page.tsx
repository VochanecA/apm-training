import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, 
  Download, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react"
import Link from "next/link"
import { AddTrainingProgramDialog } from "@/components/add-training-program-dialog"
import { TrainingProgramsList } from "@/components/training-programs-list"

export default async function TrainingProgramsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Dohvatanje programa sa ugnježdenim kategorijama poslova
  const { data: programs } = await supabase
    .from("training_programs")
    .select(`
      *,
      job_category:job_categories(name_en, name_me, code)
    `)
    .order("title")

  // Izračunavanje statistike
  const stats = {
    total: programs?.length || 0,
    active: programs?.filter(p => p.is_active).length || 0,
    totalHours: programs?.reduce((acc, p) => acc + (p.total_hours || 0), 0) || 0
  }

  return (
    <div className="space-y-8 p-6 font-sans max-w-[1600px] mx-auto">
      
      {/* Gornja Navigacija */}
      <div className="flex items-center">
        <Link 
          href="/dashboard" 
          className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Training Programs</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            Curriculum management and certification standards.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="h-10">
            <Download className="mr-2 h-4 w-4" />
            Export Catalog
          </Button>
          <AddTrainingProgramDialog />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Total Programs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase">Registered Curriculums</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Status</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.active} Active</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase">Ready for enrollment</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Knowledge Base</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}h</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase">Total training duration</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area - Interaktivna lista sa pretragom */}
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <div className="mb-6 border-b pb-4">
          <h2 className="text-lg font-semibold tracking-tight">Program Catalog</h2>
        </div>
        
        {/* Pozivamo klijentsku komponentu za listanje i pretragu */}
        <TrainingProgramsList initialPrograms={programs || []} />
      </div>
    </div>
  )
}