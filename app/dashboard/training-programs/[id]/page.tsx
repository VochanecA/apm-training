// app/dashboard/training-programs/[id]/page.tsx
import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  GraduationCap,
  Users,
  FileText,
  Edit,
  Download,
  Link as LinkIcon,
  Building,
  User,
  CheckCircle2,
  XCircle,
  Award
} from "lucide-react"
import { TrainingProgramModules } from "@/components/training-program-modules"
import { TrainingProgramInstructor } from "@/components/training-program-instructor"

export default async function TrainingProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Provera autentifikacije
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Dobijanje detalja programa sa svim povezanim podacima
  const { data: program, error } = await supabase
    .from("training_programs")
    .select(`
      *,
      job_category:job_categories(name_en, name_me, code),
      primary_instructor:profiles!training_programs_primary_instructor_id_fkey(id, full_name, email, role),
      training_modules(id, title, module_type, duration_hours, sequence_number),
      trainings(id, status, start_date, trainee:profiles!trainings_trainee_id_fkey(full_name)),
      variants:training_program_variants(count)
    `)
    .eq("id", id)
    .single()

  if (error || !program) {
    notFound()
  }

  // Broj varijanti
  const totalVariants = program?.variants?.[0]?.count || 0

  // Računanje statistike
  const activeTrainings = program.trainings?.filter((t: any) => 
    t.status === 'in_progress' || t.status === 'scheduled'
  ).length || 0

  const completedTrainings = program.trainings?.filter((t: any) => 
    t.status === 'completed'
  ).length || 0

  const totalModules = program.training_modules?.length || 0
  const theoreticalHours = program.training_modules
    ?.filter((m: any) => m.module_type === 'theoretical')
    .reduce((acc: number, m: any) => acc + (m.duration_hours || 0), 0) || 0

  const practicalHours = program.training_modules
    ?.filter((m: any) => m.module_type === 'practical')
    .reduce((acc: number, m: any) => acc + (m.duration_hours || 0), 0) || 0

  const ojtHours = program.training_modules
    ?.filter((m: any) => m.module_type === 'ojt')
    .reduce((acc: number, m: any) => acc + (m.duration_hours || 0), 0) || 0

  const formatValidityPeriod = (months: number) => {
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    
    if (years === 0) {
      return `${months} month${months > 1 ? 's' : ''}`
    } else if (remainingMonths === 0) {
      return `${years} year${years > 1 ? 's' : ''}`
    } else {
      return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
    }
  }

  return (
    <div className="space-y-6 p-6 font-sans max-w-[1600px] mx-auto">
      
      {/* Back Link */}
      <div className="flex items-center">
        <Link 
          href="/dashboard/training-programs" 
          className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Programs
        </Link>
      </div>

      {/* Header Sekcija */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{program.title}</h1>
            <Badge variant="outline" className="font-mono">
              {program.code}
            </Badge>
            {program.is_active ? (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-muted text-muted-foreground">
                <XCircle className="mr-1 h-3 w-3" />
                Inactive
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            {program.job_category?.name_en || "No job category assigned"}
            {totalVariants > 0 && (
              <Badge variant="outline" className="ml-2">
                {totalVariants} variant{totalVariants !== 1 ? 's' : ''}
              </Badge>
            )}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="h-10">
            <Download className="mr-2 h-4 w-4" />
            Export Program
          </Button>
          <Button asChild className="h-10">
            <Link href={`/dashboard/training-programs/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Program
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            <Clock className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{program.total_hours || 0}h</div>
            <p className="text-xs text-muted-foreground mt-1">
              {theoreticalHours}h theoretical, {practicalHours}h practical, {ojtHours}h OJT
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Training Modules</CardTitle>
            <FileText className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalModules}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {program.training_modules?.length || 0} modules defined
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Trainings</CardTitle>
            <Users className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeTrainings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedTrainings} completed, {program.trainings?.length || 0} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Certificate Validity</CardTitle>
            <Calendar className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatValidityPeriod(program.validity_months || 24)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              After successful completion
            </p>
          </CardContent>
        </Card>

        {/* Nova kartica za varijante */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Variants</CardTitle>
            <Award className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalVariants}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Initial, recurrent, requalification
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Glavni sadržaj - 2 kolone */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Leva kolona - Detalji programa */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Program Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
              <p className="text-foreground">
                {program.description || "No description provided."}
              </p>
            </div>

            {/* Program Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Job Category</h3>
                <div className="flex items-center gap-2">
                  {program.job_category ? (
                    <>
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{program.job_category.name_en}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {program.job_category.code}
                      </Badge>
                    </>
                  ) : (
                    <span className="text-muted-foreground italic">Not assigned</span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Primary Instructor</h3>
                <TrainingProgramInstructor instructor={program.primary_instructor} />
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Version</h3>
                <Badge variant="outline">{program.version || "1.0"}</Badge>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Created</h3>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(program.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Approval Information */}
            {(program.approval_number || program.approval_date || program.approved_by) && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Approval Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {program.approval_number && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-1">Approval Number</h4>
                      <p className="font-medium">{program.approval_number}</p>
                    </div>
                  )}
                  {program.approval_date && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-1">Approval Date</h4>
                      <p className="font-medium">{new Date(program.approval_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {program.approved_by && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-1">Approved By</h4>
                      <p className="font-medium">{program.approved_by}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Training Modules Section */}
            {totalModules > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Training Modules</h3>
                <TrainingProgramModules modules={program.training_modules || []} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Desna kolona - Quick Actions i Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href={`/dashboard/trainings?program=${id}`}>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Schedule Training
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href={`/dashboard/training-programs/${id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Program
                </Link>
              </Button>
              {/* NOVO DUGME ZA VARIJANTE */}
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href={`/dashboard/training-programs/${id}/variants`}>
                  <Award className="mr-2 h-4 w-4" />
                  Manage Variants
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href={`/dashboard/training-programs/${id}/modules`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Manage Modules
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Related Trainings */}
          {program.trainings && program.trainings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Trainings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {program.trainings.slice(0, 3).map((training: any) => (
                    <div key={training.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{training.trainee?.full_name || "Unknown trainee"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(training.start_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={
                            training.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' :
                            training.status === 'in_progress' ? 'bg-blue-500/10 text-blue-600' :
                            'bg-muted'
                          }
                        >
                          {training.status}
                        </Badge>
                      </div>
                      <Button asChild size="sm" variant="ghost" className="w-full mt-2 h-7 text-xs">
                        <Link href={`/dashboard/trainings/${training.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  ))}
                  {program.trainings.length > 3 && (
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href={`/dashboard/trainings?program=${id}`}>
                        View All ({program.trainings.length})
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}