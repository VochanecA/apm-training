import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Briefcase, 
  Download, 
  ArrowLeft, 
  Users, 
  GraduationCap, 
  Search,
  FileText
} from "lucide-react"
import { JobCategoriesList } from "@/components/job-categories-list"

export default async function JobCategoriesPage() {
  const supabase = await createClient()

  // Provera autentifikacije
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Dobijanje svih job kategorija sa brojem osoblja i programa
  const { data: jobCategories } = await supabase
    .from("job_categories")
    .select(`
      *,
      profiles(count),
      training_programs(count)
    `)
    .order("code")

  // Kalkulacija statistike
  const stats = {
    total: jobCategories?.length || 0,
    totalPersonnel: jobCategories?.reduce((acc, cat) => acc + (cat.profiles?.[0]?.count || 0), 0) || 0,
    totalPrograms: jobCategories?.reduce((acc, cat) => acc + (cat.training_programs?.[0]?.count || 0), 0) || 0,
    requiresCertificate: jobCategories?.filter(cat => cat.requires_certificate).length || 0,
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Job Categories</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-blue-500" />
            Manage job classifications, roles, and associated personnel
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
          <Button className="h-10">
            <Briefcase className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Categories" 
          value={stats.total} 
          icon={<Briefcase className="h-5 w-5" />} 
          description="Job classifications"
        />
        <StatsCard 
          title="Assigned Personnel" 
          value={stats.totalPersonnel} 
          icon={<Users className="h-5 w-5" />} 
          color="text-emerald-600"
          description="Staff members"
        />
        <StatsCard 
          title="Training Programs" 
          value={stats.totalPrograms} 
          icon={<GraduationCap className="h-5 w-5" />} 
          color="text-blue-600"
          description="Linked programs"
        />
        <StatsCard 
          title="Require Certificates" 
          value={stats.requiresCertificate} 
          icon={<FileText className="h-5 w-5" />} 
          color="text-purple-600"
          description="Certified roles"
        />
      </div>

      {/* Interaktivna Lista sa Pretragom i Filterima */}
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <h2 className="text-lg font-semibold tracking-tight">Category Directory</h2>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] bg-muted px-2 py-1 rounded">
            Manage Classification
          </span>
        </div>
        
        <JobCategoriesList 
          initialCategories={jobCategories || []} 
        />
      </div>
    </div>
  )
}

function StatsCard({ title, value, icon, color = "text-muted-foreground", description }: {
  title: string
  value: number
  icon: React.ReactNode
  color?: string
  description: string
}) {
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