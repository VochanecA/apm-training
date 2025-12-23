import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Calendar, User, Download, Search, BookOpen } from "lucide-react"
import Link from "next/link"
import { AddTrainingDialog } from "@/components/add-training-dialog"
import { AddTrainingProgramDialog } from "@/components/add-training-program-dialog" // DODATO

export default async function TrainingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch trainings for the current user
  const [{ data: trainings }, { data: programs }, { data: trainees }, { data: instructors }] = await Promise.all([
    supabase
      .from("trainings")
      .select(`
        *,
        training_program:training_programs(name, code),
        instructor:profiles!trainings_instructor_id_fkey(full_name),
        trainee:profiles!trainings_trainee_id_fkey(full_name)
      `)
      .or(`trainee_id.eq.${user.id},instructor_id.eq.${user.id}`)
      .order("start_date", { ascending: false }),
    supabase.from("training_programs").select("id, name, code").order("name"),
    supabase.from("profiles").select("id, full_name").eq("role", "employee").order("full_name"),
    supabase.from("profiles").select("id, full_name").eq("role", "instructor").order("full_name"),
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "in_progress":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "scheduled":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      case "cancelled":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trainings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your training programs and sessions</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" size="sm">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          {/* DODATO: Dugme za dodavanje novog programa */}
          <AddTrainingProgramDialog />
          <AddTrainingDialog 
            programs={programs || []} 
            trainees={trainees || []} 
            instructors={instructors || []} 
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Trainings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainings?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainings?.filter((t) => t.status === "in_progress").length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainings?.filter((t) => t.status === "completed").length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Training Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programs?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Training Programs Quick Access */}
      {programs && programs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Training Programs
            </CardTitle>
            <CardDescription>Available training programs in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {programs.slice(0, 6).map((program) => (
                <div key={program.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{program.name}</h4>
                      <p className="text-sm text-muted-foreground">Code: {program.code}</p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      Active
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-3 w-full h-8 text-xs"
                    asChild
                  >
                    <Link href={`/dashboard/training-programs/${program.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
            {programs.length > 6 && (
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/training-programs">
                    View All Programs ({programs.length})
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Trainings List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">My Training Sessions</h2>
        
        {trainings && trainings.length > 0 ? (
          trainings.map((training) => (
            <Card key={training.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-1">
                    <CardTitle className="text-lg">{training.training_program?.name || "Training"}</CardTitle>
                    <CardDescription>Code: {training.training_program?.code || "N/A"}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(training.status)} variant="outline">
                    {training.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Start: {new Date(training.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>End: {new Date(training.end_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Trainee: {training.trainee?.full_name || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Instructor: {training.instructor?.full_name || "N/A"}</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none bg-transparent">
                    <Link href={`/dashboard/trainings/${training.id}`}>View Details</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none bg-transparent">
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No trainings found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You don't have any assigned trainings yet
              </p>
              <div className="mt-4 flex gap-2">
                <AddTrainingProgramDialog />
                <AddTrainingDialog 
                  programs={programs || []} 
                  trainees={trainees || []} 
                  instructors={instructors || []} 
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}