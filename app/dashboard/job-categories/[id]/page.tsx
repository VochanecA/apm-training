import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Briefcase, 
  ArrowLeft, 
  Users, 
  GraduationCap, 
  FileText,
  Calendar,
  Edit
} from "lucide-react"
import { JobCategoryPersonnelTable } from "@/components/job-category-personnel-table"
import { JobCategoryProgramsTable } from "@/components/job-category-programs-table"
import { AssignPersonnelToCategoryDialog } from "@/components/assign-personnel-to-category-dialog" // DODAJTE OVAJ IMPORT

export default async function JobCategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }> // OVO JE PROMISE!
}) {
  const { id } = await params // OVO JE KLJUČNO - AWAIT!
  const supabase = await createClient()

  // Provera autentifikacije
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Dobijanje detalja kategorije sa povezanim podacima
  const { data: category, error } = await supabase
    .from("job_categories")
    .select(`
      *,
      profiles(
        id,
        full_name,
        email,
        role,
        is_active,
        phone,
        employee_airports(airport:airports(name, code))
      ),
      training_programs(
        id,
        title,
        code,
        is_active,
        total_hours,
        validity_months
      )
    `)
    .eq("id", id) // Koristite `id` umesto `params.id`
    .single()

  if (error || !category) {
    notFound()
  }

  const personnelCount = category.profiles?.length || 0
  const programsCount = category.training_programs?.length || 0
  const activePersonnel = category.profiles?.filter((p: { is_active: any }) => p.is_active).length || 0

  return (
    <div className="space-y-6 p-6 font-sans max-w-[1600px] mx-auto">
      
      {/* Back Link */}
      <div className="flex items-center">
        <Link 
          href="/dashboard/job-categories" 
          className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Categories
        </Link>
      </div>

      {/* Header Sekcija */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{category.name_en}</h1>
            <Badge variant="outline" className="font-mono">
              {category.code}
            </Badge>
            {category.requires_certificate && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                <FileText className="mr-1 h-3 w-3" />
                Certificate Required
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-blue-500" />
            <span className="text-lg text-slate-600">{category.name_me}</span>
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* DODAJTE ASSIGN PERSONNEL DIALOG OVDE */}
          <AssignPersonnelToCategoryDialog
            jobCategoryId={category.id}
            jobCategoryName={category.name_en}
            trigger={
              <Button variant="outline" size="sm">
                <Users className="mr-2 h-3 w-3" />
                Assign Personnel
              </Button>
            }
            onSuccess={() => window.location.reload()}
          />
          <Button variant="outline" className="h-10">
            <FileText className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button asChild className="h-10">
            <Link href={`/dashboard/job-categories/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Category
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assigned Personnel</CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{personnelCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activePersonnel} active, {personnelCount - activePersonnel} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Training Programs</CardTitle>
            <GraduationCap className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{programsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {category.training_programs?.filter((p: { is_active: any }) => p.is_active).length || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
            <Calendar className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {new Date(category.created_at).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.floor((Date.now() - new Date(category.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Details */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
              <p className="text-foreground">
                {category.description || "No description provided."}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Code</h3>
                <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                  {category.code}
                </code>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Requires Certificate</h3>
                <Badge variant={category.requires_certificate ? "default" : "outline"}>
                  {category.requires_certificate ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* TAKOĐE DODAJTE I U QUICK ACTIONS SEKCIJI */}
            <AssignPersonnelToCategoryDialog
              jobCategoryId={category.id}
              jobCategoryName={category.name_en}
              trigger={
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Assign Personnel
                </Button>
              }
              onSuccess={() => window.location.reload()}
            />
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href={`/dashboard/training-programs?category=${id}`}>
                <GraduationCap className="mr-2 h-4 w-4" />
                Link Training Program
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href={`/dashboard/job-categories/${id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Details
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Personnel */}
      {personnelCount > 0 ? (
        <Card id="personnel">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assigned Personnel ({personnelCount})
              </CardTitle>
              <div className="flex items-center gap-2">
                {/* DODAJTE I OVDE U HEADER SEKCIJI TABELE */}
                <AssignPersonnelToCategoryDialog
                  jobCategoryId={category.id}
                  jobCategoryName={category.name_en}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Users className="mr-2 h-3 w-3" />
                      Add Personnel
                    </Button>
                  }
                  onSuccess={() => window.location.reload()}
                />
                <Button asChild size="sm">
                  <Link href={`/dashboard/personnel?category=${id}`}>
                    View All
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <JobCategoryPersonnelTable 
              personnel={category.profiles || []} 
              jobCategoryId={id}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Assigned Personnel
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No personnel assigned</h3>
            <p className="text-muted-foreground mb-4">No personnel are currently assigned to this job category.</p>
            {/* DODAJTE I OVDE U EMPTY STATE SEKCIJI */}
            <AssignPersonnelToCategoryDialog
              jobCategoryId={category.id}
              jobCategoryName={category.name_en}
              trigger={
                <Button>
                  <Users className="mr-2 h-4 w-4" />
                  Assign Personnel
                </Button>
              }
              onSuccess={() => window.location.reload()}
            />
          </CardContent>
        </Card>
      )}

      {/* Linked Training Programs */}
      {programsCount > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Linked Training Programs ({programsCount})
              </CardTitle>
              <Button asChild size="sm">
                <Link href={`/dashboard/training-programs?category=${id}`}>
                  View All
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <JobCategoryProgramsTable 
              programs={category.training_programs || []} 
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Linked Training Programs
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No training programs linked</h3>
            <p className="text-muted-foreground mb-4">No training programs are currently linked to this job category.</p>
            <Button asChild>
              <Link href={`/dashboard/training-programs?category=${id}`}>
                <GraduationCap className="mr-2 h-4 w-4" />
                Link Training Program
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}