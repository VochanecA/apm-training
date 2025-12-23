import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Search, Download, Plus } from "lucide-react"
import Link from "next/link"
import { AddTrainingProgramDialog } from "@/components/add-training-program-dialog"

export default async function TrainingProgramsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch training programs
  const { data: programs } = await supabase
    .from("training_programs")
    .select(`
      *,
      job_category:job_categories(name_en, code)
    `)
    .order("title")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Training Programs</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage training programs and their modules</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" size="sm">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <AddTrainingProgramDialog />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programs?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {programs?.filter((p) => p.is_active).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {programs && programs.length > 0 
                ? Math.round(programs.reduce((acc, p) => acc + (p.total_hours || 0), 0) / programs.length)
                : 0
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Programs List */}
      <div className="grid gap-4">
        {programs && programs.length > 0 ? (
          programs.map((program) => (
            <Card key={program.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <CardTitle>{program.title}</CardTitle>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="font-mono">
                        {program.code}
                      </Badge>
                      {program.job_category && (
                        <Badge variant="secondary">
                          {program.job_category.name_en} ({program.job_category.code})
                        </Badge>
                      )}
                      {program.is_active ? (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    {program.description && (
                      <CardDescription className="mt-2">
                        {program.description}
                      </CardDescription>
                    )}
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/training-programs/${program.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Theoretical</p>
                    <p className="text-lg font-semibold">{program.theoretical_hours || 0}h</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Practical</p>
                    <p className="text-lg font-semibold">{program.practical_hours || 0}h</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">OJT</p>
                    <p className="text-lg font-semibold">{program.ojt_hours || 0}h</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-lg font-semibold">{program.total_hours || 0}h</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No training programs found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Start by creating your first training program
              </p>
              <div className="mt-4">
                <AddTrainingProgramDialog />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}