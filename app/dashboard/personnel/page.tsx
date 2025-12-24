import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Download, 
  Briefcase, 
  GraduationCap, 
  ShieldCheck, 
  FileText,
  ArrowLeft
} from "lucide-react"
import { AddPersonnelDialog } from "@/components/add-personnel-dialog"
import { PersonnelList } from "@/components/personnel-list"

export default async function PersonnelPage() {
  const supabase = await createClient()

  // Provera autentifikacije
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Paralelno povlačenje svih podataka
  const [
    { data: personnel }, 
    { data: jobCategories }, 
    { data: airports }
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(`
        *,
        employee_airports(airport:airports(id, name, code))
      `)
      .order("created_at", { ascending: false }),
    supabase.rpc('get_job_categories_formatted'),
    supabase.from("airports").select("id, name, code").order("name"),
  ])

  // Kalkulacija statistike
  const stats = {
    total: personnel?.length || 0,
    instructors: personnel?.filter(p => p.role === "instructor").length || 0,
    employees: personnel?.filter(p => p.role === "employee").length || 0,
    admins: personnel?.filter(p => p.role === "admin").length || 0,
  }

  return (
    <div className="space-y-6 p-6 font-sans max-w-[1600px] mx-auto">
      
      {/* Back to Dashboard Link */}
      <div className="flex items-center">
        <Link 
          href="/dashboard" 
          className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Link>
      </div>

      {/* Header Sekcija */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Personnel Directory</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Manage airport staff, roles, and certification compliance.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="h-10 border-dashed">
            <FileText className="mr-2 h-4 w-4" />
            Reports
          </Button>
          <Button variant="outline" className="h-10">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <AddPersonnelDialog 
            jobCategories={jobCategories || []} 
            airports={airports || []} 
          />
        </div>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Personnel" 
          value={stats.total} 
          icon={<Users className="h-5 w-5" />} 
          description="Registered staff members"
        />
        <StatsCard 
          title="Instructors" 
          value={stats.instructors} 
          icon={<GraduationCap className="h-5 w-5" />} 
          color="text-blue-600"
          description="Certified trainers"
        />
        <StatsCard 
          title="Employees" 
          value={stats.employees} 
          icon={<Briefcase className="h-5 w-5" />} 
          color="text-emerald-600"
          description="Operational staff"
        />
        <StatsCard 
          title="Admins" 
          value={stats.admins} 
          icon={<ShieldCheck className="h-5 w-5" />} 
          color="text-purple-600"
          description="System controllers"
        />
      </div>

      {/* Interaktivna Lista sa Pretragom i Filterima */}
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <h2 className="text-lg font-semibold tracking-tight">Staff List</h2>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] bg-muted px-2 py-1 rounded">
            Live Feed
          </span>
        </div>
        
        <PersonnelList 
          initialPersonnel={personnel || []} 
          airports={airports || []} 
        />
      </div>
    </div>
  )
}

function StatsCard({ title, value, icon, color = "text-muted-foreground", description }: any) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`${color} bg-current/10 p-2 rounded-lg`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tight font-medium">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}