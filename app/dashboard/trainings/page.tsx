// import { createClient } from "@/lib/supabase/server"
// import { redirect } from "next/navigation"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { GraduationCap, Calendar, User, Download, Search, BookOpen } from "lucide-react"
// import Link from "next/link"
// import { AddTrainingDialog } from "@/components/add-training-dialog"
// import { AddTrainingProgramDialog } from "@/components/add-training-program-dialog"

// export default async function TrainingsPage() {
//   const supabase = await createClient()

//   const {
//     data: { user },
//   } = await supabase.auth.getUser()

//   if (!user) {
//     redirect("/auth/login")
//   }

//   // Fetch trainings for the current user
//   const [{ data: trainings }, { data: programs }, { data: trainees }, { data: instructors }] = await Promise.all([
//     supabase
//       .from("trainings")
//       .select(`
//         *,
//         training_program:training_programs(title, code),
//         instructor:profiles!trainings_instructor_id_fkey(full_name),
//         trainee:profiles!trainings_trainee_id_fkey(full_name)
//       `)
//       .or(`trainee_id.eq.${user.id},instructor_id.eq.${user.id}`)
//       .order("start_date", { ascending: false }),
//     supabase
//       .from("training_programs")
//       .select("id, title, code")
//       .eq("is_active", true)
//       .order("title"),
//     supabase
//       .from("profiles")
//       .select("id, full_name")
//       .eq("role", "employee")
//       .order("full_name"),
//     supabase
//       .from("profiles")
//       .select("id, full_name")
//       .eq("role", "instructor")
//       .order("full_name"),
//   ])

//   // Transform programs data for AddTrainingDialog (title -> name)
//   const programsForDialog = programs?.map(p => ({
//     id: p.id,
//     name: p.title,  // Mapiramo title u name
//     code: p.code
//   })) || []

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "completed":
//         return "bg-green-500/10 text-green-600 border-green-500/20"
//       case "in_progress":
//         return "bg-blue-500/10 text-blue-600 border-blue-500/20"
//       case "scheduled":
//         return "bg-amber-500/10 text-amber-600 border-amber-500/20"
//       case "cancelled":
//         return "bg-red-500/10 text-red-600 border-red-500/20"
//       default:
//         return "bg-muted text-muted-foreground"
//     }
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-foreground">Trainings</h1>
//           <p className="mt-1 text-sm text-muted-foreground">Manage your training programs and sessions</p>
//         </div>
//         <div className="flex flex-col gap-2 sm:flex-row">
//           <Button variant="outline" size="sm">
//             <Search className="mr-2 h-4 w-4" />
//             Search
//           </Button>
//           <Button variant="outline" size="sm">
//             <Download className="mr-2 h-4 w-4" />
//             Export PDF
//           </Button>
//           <AddTrainingProgramDialog />
//           <AddTrainingDialog 
//             programs={programsForDialog} 
//             trainees={trainees || []} 
//             instructors={instructors || []} 
//           />
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium">Total Trainings</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{trainings?.length || 0}</div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium">In Progress</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{trainings?.filter((t) => t.status === "in_progress").length || 0}</div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium">Completed</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{trainings?.filter((t) => t.status === "completed").length || 0}</div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium">Training Programs</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{programs?.length || 0}</div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Training Programs Quick Access */}
//       {programs && programs.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <BookOpen className="h-5 w-5" />
//               Training Programs
//             </CardTitle>
//             <CardDescription>Available training programs in the system</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
//               {programs.slice(0, 6).map((program) => (
//                 <div key={program.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1 min-w-0">
//                       <h4 className="font-medium truncate">{program.title}</h4>
//                       <p className="text-sm text-muted-foreground">Code: {program.code}</p>
//                     </div>
//                     <Badge variant="outline" className="ml-2 shrink-0">
//                       Active
//                     </Badge>
//                   </div>
//                   <Button 
//                     variant="ghost" 
//                     size="sm" 
//                     className="mt-3 w-full h-8 text-xs"
//                     asChild
//                   >
//                     <Link href={`/dashboard/training-programs/${program.id}`}>
//                       View Details
//                     </Link>
//                   </Button>
//                 </div>
//               ))}
//             </div>
//             {programs.length > 6 && (
//               <div className="mt-4 text-center">
//                 <Button variant="outline" size="sm" asChild>
//                   <Link href="/dashboard/training-programs">
//                     View All Programs ({programs.length})
//                   </Link>
//                 </Button>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       )}

//       {/* Trainings List */}
//       <div className="space-y-4">
//         <h2 className="text-xl font-semibold">My Training Sessions</h2>
        
//         {trainings && trainings.length > 0 ? (
//           trainings.map((training) => (
//             <Card key={training.id} className="hover:shadow-md transition-shadow">
//               <CardHeader>
//                 <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
//                   <div className="flex-1 space-y-1">
//                     <CardTitle className="text-lg">{training.training_program?.title || "Training"}</CardTitle>
//                     <CardDescription>Code: {training.training_program?.code || "N/A"}</CardDescription>
//                   </div>
//                   <Badge className={getStatusColor(training.status)} variant="outline">
//                     {training.status.replace("_", " ").toUpperCase()}
//                   </Badge>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
//                   <div className="flex items-center gap-2 text-muted-foreground">
//                     <Calendar className="h-4 w-4" />
//                     <span>Start: {new Date(training.start_date).toLocaleDateString()}</span>
//                   </div>
//                   <div className="flex items-center gap-2 text-muted-foreground">
//                     <Calendar className="h-4 w-4" />
//                     <span>End: {new Date(training.end_date).toLocaleDateString()}</span>
//                   </div>
//                   <div className="flex items-center gap-2 text-muted-foreground">
//                     <User className="h-4 w-4" />
//                     <span>Trainee: {training.trainee?.full_name || "N/A"}</span>
//                   </div>
//                   <div className="flex items-center gap-2 text-muted-foreground">
//                     <User className="h-4 w-4" />
//                     <span>Instructor: {training.instructor?.full_name || "N/A"}</span>
//                   </div>
//                 </div>
//                 <div className="mt-4 flex flex-col gap-2 sm:flex-row">
//                   <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none bg-transparent">
//                     <Link href={`/dashboard/trainings/${training.id}`}>View Details</Link>
//                   </Button>
//                   <Button variant="outline" size="sm" className="flex-1 sm:flex-none bg-transparent">
//                     <Download className="mr-2 h-4 w-4" />
//                     Export PDF
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           ))
//         ) : (
//           <Card>
//             <CardContent className="flex flex-col items-center justify-center py-12">
//               <GraduationCap className="h-12 w-12 text-muted-foreground" />
//               <h3 className="mt-4 text-lg font-semibold">No trainings found</h3>
//               <p className="mt-2 text-sm text-muted-foreground">
//                 You don't have any assigned trainings yet
//               </p>
//               <div className="mt-4 flex gap-2">
//                 <AddTrainingProgramDialog />
//                 <AddTrainingDialog 
//                   programs={programsForDialog} 
//                   trainees={trainees || []} 
//                   instructors={instructors || []} 
//                 />
//               </div>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   )
// }


import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  GraduationCap, 
  Calendar, 
  User, 
  Download, 
  Search, 
  BookOpen,
  PlusCircle,
  Filter,
  TrendingUp,
  Users,
  Clock,
  Award,
  ChevronRight,
  FileText,
  BarChart3,
  PlayCircle,
  CheckCircle,
  CalendarDays,
  UserCheck
} from "lucide-react"
import Link from "next/link"
import { AddTrainingDialog } from "@/components/add-training-dialog"
import { AddTrainingProgramDialog } from "@/components/add-training-program-dialog"

export default async function TrainingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch trainings for the current user
  const [
    { data: trainings }, 
    { data: programs }, 
    { data: trainees }, 
    { data: instructors },
    completedTrainingsResult,
    upcomingTrainingsResult
  ] = await Promise.all([
    supabase
      .from("trainings")
      .select(`
        *,
        training_program:training_programs(title, code, description),
        instructor:profiles!trainings_instructor_id_fkey(full_name, avatar_url),
        trainee:profiles!trainings_trainee_id_fkey(full_name, avatar_url)
      `)
      .or(`trainee_id.eq.${user.id},instructor_id.eq.${user.id}`)
      .order("start_date", { ascending: false }),
    supabase
      .from("training_programs")
      .select("id, title, code, description, theoretical_hours, practical_hours")
      .eq("is_active", true)
      .order("title"),
    supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .eq("role", "employee")
      .order("full_name"),
    supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .eq("role", "instructor")
      .order("full_name"),
    supabase
      .from("trainings")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed"),
    supabase
      .from("trainings")
      .select("*", { count: "exact", head: true })
      .eq("status", "scheduled")
  ])

  // Extract counts from the results
  const completedCount = completedTrainingsResult?.count || 0
  const upcomingCount = upcomingTrainingsResult?.count || 0

  // Transform programs data for AddTrainingDialog (title -> name)
  const programsForDialog = programs?.map(p => ({
    id: p.id,
    name: p.title,
    code: p.code
  })) || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-gradient-to-r from-green-500 to-emerald-600"
      case "in_progress":
        return "bg-gradient-to-r from-blue-500 to-cyan-600"
      case "scheduled":
        return "bg-gradient-to-r from-amber-500 to-orange-600"
      case "cancelled":
        return "bg-gradient-to-r from-red-500 to-rose-600"
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in_progress":
        return <PlayCircle className="h-4 w-4 text-blue-600" />
      case "scheduled":
        return <CalendarDays className="h-4 w-4 text-amber-600" />
      case "cancelled":
        return <CheckCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getHoursColor = (hours: number) => {
    if (hours >= 40) return "text-purple-600 bg-purple-100 dark:bg-purple-900/30"
    if (hours >= 20) return "text-blue-600 bg-blue-100 dark:bg-blue-900/30"
    if (hours >= 10) return "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30"
    return "text-amber-600 bg-amber-100 dark:bg-amber-900/30"
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Training Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage training programs, sessions, and track progress
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <AddTrainingProgramDialog />
          <AddTrainingDialog 
            programs={programsForDialog} 
            trainees={trainees || []} 
            instructors={instructors || []} 
          />
        </div>
      </div>

      {/* Stats Cards with Gradient Backgrounds */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="relative overflow-hidden border-blue-200/50 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-gray-900">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total Trainings
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {trainings?.length || 0}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              All sessions
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-gray-900">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              In Progress
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <PlayCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
              {trainings?.filter((t) => t.status === "in_progress").length || 0}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Active sessions
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-green-200/50 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-gray-900">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Completed
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              {completedCount}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Successfully finished
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-amber-200/50 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-gray-900">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Upcoming
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-amber-900 dark:text-amber-100">
              {upcomingCount}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Scheduled sessions
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-purple-200/50 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-gray-900">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Programs
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {programs?.length || 0}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Training Programs Quick Access */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-gray-900">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Training Programs</CardTitle>
                  <CardDescription>Available programs in the system</CardDescription>
                </div>
                <Badge variant="outline" className="gap-2">
                  <BookOpen className="h-3 w-3" />
                  {programs?.length || 0} Programs
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {programs && programs.length > 0 ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {programs.slice(0, 4).map((program) => {
                      const totalHours = (program.theoretical_hours || 0) + (program.practical_hours || 0)
                      return (
                        <Link 
                          key={program.id} 
                          href={`/dashboard/training-programs/${program.id}`}
                          className="group relative overflow-hidden rounded-xl border border-slate-200/50 bg-white dark:bg-slate-900/50 p-4 transition-all hover:scale-[1.02] hover:shadow-md hover:border-primary/30"
                        >
                          <div className="flex flex-col gap-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                  {program.title}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">Code: {program.code}</p>
                              </div>
                              <Badge className={`${getHoursColor(totalHours)} border-0`}>
                                {totalHours}h
                              </Badge>
                            </div>
                            
                            {program.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {program.description}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {program.theoretical_hours || 0}T
                                </span>
                                <span className="flex items-center gap-1">
                                  <UserCheck className="h-3 w-3" />
                                  {program.practical_hours || 0}P
                                </span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                  
                  {programs.length > 4 && (
                    <div className="mt-6 text-center">
                      <Button variant="outline" size="sm" asChild className="gap-2">
                        <Link href="/dashboard/training-programs">
                          View All Programs
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">No training programs available</p>
                  <AddTrainingProgramDialog />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats & Actions */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Quick Stats
            </CardTitle>
            <CardDescription>Training overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-300">Active Trainees</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">{trainees?.length || 0} personnel</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                    <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-emerald-800 dark:text-emerald-300">Certified Instructors</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">{instructors?.length || 0} available</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <Clock className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm font-medium">Avg. Duration</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-2xl font-bold">24.5h</p>
                    <p className="text-xs text-muted-foreground">Per program</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center">
                      <TrendingUp className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <span className="text-sm font-medium">Completion Rate</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-2xl font-bold">92%</p>
                    <p className="text-xs text-muted-foreground">Success rate</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Sessions List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">My Training Sessions</h2>
          <Badge variant="outline" className="gap-2">
            <GraduationCap className="h-3 w-3" />
            {trainings?.length || 0} Sessions
          </Badge>
        </div>
        
        {trainings && trainings.length > 0 ? (
          <div className="space-y-4">
            {trainings.map((training) => (
              <Card key={training.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                            {training.training_program?.title || "Training Session"}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="font-mono">
                              {training.training_program?.code || "N/A"}
                            </Badge>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(training.status)}
                              <span className="text-sm text-muted-foreground capitalize">
                                {training.status.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-24 rounded-full overflow-hidden`}>
                            <div 
                              className={`h-full ${getStatusColor(training.status)}`}
                              style={{ 
                                width: training.status === 'completed' ? '100%' : 
                                       training.status === 'in_progress' ? '60%' : '30%'
                              }}
                            ></div>
                          </div>
                          <Badge className={`${getStatusColor(training.status)} text-white border-0 px-3 py-1`}>
                            {training.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">Start Date</span>
                          </div>
                          <p className="font-medium">
                            {new Date(training.start_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">End Date</span>
                          </div>
                          <p className="font-medium">
                            {training.end_date ? new Date(training.end_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'TBD'}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span className="font-medium">Trainee</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">
                              {training.trainee?.full_name?.charAt(0) || 'T'}
                            </div>
                            <p className="font-medium">{training.trainee?.full_name || "N/A"}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span className="font-medium">Instructor</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
                              {training.instructor?.full_name?.charAt(0) || 'I'}
                            </div>
                            <p className="font-medium">{training.instructor?.full_name || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 lg:w-48 lg:pl-4 lg:border-l">
                      <Button asChild variant="outline" className="w-full justify-center gap-2">
                        <Link href={`/dashboard/trainings/${training.id}`}>
                          <FileText className="h-4 w-4" />
                          View Details
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-center gap-2">
                        <Download className="h-4 w-4" />
                        Export PDF
                      </Button>
                      <Button asChild variant="ghost" size="sm" className="w-full justify-center gap-2 mt-2">
                        <Link href={`/dashboard/trainings/${training.id}/progress`}>
                          <TrendingUp className="h-4 w-4" />
                          Track Progress
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="relative mb-6">
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center">
                  <GraduationCap className="h-10 w-10 text-blue-600" />
                </div>
                <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 flex items-center justify-center">
                  <PlusCircle className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <h3 className="mt-4 text-xl font-bold text-foreground">No trainings found</h3>
              <p className="mt-2 text-center text-muted-foreground max-w-md">
                You don't have any assigned trainings yet. Create a new training program or schedule a training session.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <AddTrainingProgramDialog />
                <AddTrainingDialog 
                  programs={programsForDialog} 
                  trainees={trainees || []} 
                  instructors={instructors || []} 
                />
                <Button variant="outline" asChild>
                  <Link href="/dashboard/training-programs">
                    Browse Programs
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}