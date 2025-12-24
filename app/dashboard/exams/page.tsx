import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClipboardCheck, Calendar, User, Trophy, Search, Download } from "lucide-react"
import Link from "next/link"
import { AddExamDialog } from "@/components/add-exam-dialog"

export default async function ExamsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [{ data: examinations }, { data: trainings }] = await Promise.all([
    supabase
      .from("examinations")
      .select(`
        *,
        training:trainings(
          training_program:training_programs(name, code),
          instructor:profiles!trainings_instructor_id_fkey(full_name)
        )
      `)
      .eq("trainings.trainee_id", user.id)
      .order("exam_date", { ascending: false }),
    supabase
      .from("trainings")
      .select("id, training_program:training_programs(name, code)")
      .eq("trainee_id", user.id)
      .eq("status", "in_progress"),
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "failed":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      case "scheduled":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "cancelled":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-blue-600"
    if (score >= 50) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Examinations</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track your examination results and schedules</p>
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
          <AddExamDialog trainings={trainings || []} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{examinations?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Passed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {examinations?.filter((e) => e.status === "passed").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {examinations?.filter((e) => e.status === "scheduled").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {examinations && examinations.length > 0
                ? Math.round(
                    examinations.filter((e) => e.score).reduce((acc, e) => acc + (e.score || 0), 0) /
                      examinations.filter((e) => e.score).length,
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Examinations List */}
      <div className="space-y-4">
        {examinations && examinations.length > 0 ? (
          examinations.map((exam) => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-1">
                    <CardTitle className="text-lg">{exam.training?.training_program?.name || "Examination"}</CardTitle>
                    <CardDescription>{exam.exam_type.replace("_", " ").toUpperCase()}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {exam.score !== null && (
                      <Badge variant="outline" className="font-mono">
                        <Trophy className="mr-1 h-3 w-3" />
                        <span className={getScoreColor(exam.score)}>{exam.score}%</span>
                      </Badge>
                    )}
                    <Badge className={getStatusColor(exam.status)} variant="outline">
                      {exam.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Date: {new Date(exam.exam_date).toLocaleDateString()}</span>
                  </div>
                  {exam.training?.instructor && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Examiner: {exam.training.instructor.full_name}</span>
                    </div>
                  )}
                  {exam.training?.training_program?.code && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ClipboardCheck className="h-4 w-4" />
                      <span>Code: {exam.training.training_program.code}</span>
                    </div>
                  )}
                </div>
                {exam.notes && (
                  <div className="mt-3 rounded-md bg-muted p-3 text-sm">
                    <p className="text-muted-foreground">{exam.notes}</p>
                  </div>
                )}
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none bg-transparent">
                    <Link href={`/dashboard/exams/${exam.id}`}>View Details</Link>
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
              <ClipboardCheck className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No examinations found</h3>
              <p className="mt-2 text-sm text-muted-foreground">Schedule your first examination</p>
              <Button className="mt-4" size="sm">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Schedule Exam
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
