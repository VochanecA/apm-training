"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  GraduationCap,
  Clock,
  Calendar,
  BookOpen,
  Eye,
  Users,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import Link from "next/link"

interface TrainingProgram {
  id: string
  title: string
  code: string
  is_active: boolean
  total_hours: number
  validity_months: number | null
}

interface JobCategoryProgramsTableProps {
  programs: TrainingProgram[]
}

export function JobCategoryProgramsTable({ programs }: JobCategoryProgramsTableProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Format months to years/months string
  const formatValidityPeriod = (months: number | null) => {
    if (!months) return "24 months"
    
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

  // Group programs by status
  const activePrograms = programs.filter(p => p.is_active)
  const inactivePrograms = programs.filter(p => !p.is_active)

  // View Toggle Component
  const ViewToggle = () => (
    <div className="flex justify-end">
      <div className="inline-flex rounded-lg border p-1">
        <Button
          variant={viewMode === "grid" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewMode("grid")}
          className="h-8 px-3"
        >
          Grid
        </Button>
        <Button
          variant={viewMode === "list" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewMode("list")}
          className="h-8 px-3"
        >
          List
        </Button>
      </div>
    </div>
  )

  // No Programs Component
  const NoPrograms = () => (
    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-2xl bg-slate-50/50">
      <GraduationCap className="h-12 w-12 text-slate-300 mb-4" />
      <h3 className="text-lg font-semibold text-slate-900">No training programs linked</h3>
      <p className="text-sm text-slate-500">No training programs are currently associated with this job category</p>
      <Button asChild className="mt-4">
        <Link href="/dashboard/training-programs">
          <GraduationCap className="mr-2 h-4 w-4" />
          Browse Programs
        </Link>
      </Button>
    </div>
  )

  if (programs.length === 0) {
    return <NoPrograms />
  }

  return (
    <div className="space-y-6">
      <ViewToggle />
      
      {viewMode === "grid" ? (
        <GridView 
          activePrograms={activePrograms} 
          inactivePrograms={inactivePrograms} 
        />
      ) : (
        <ListView programs={programs} formatValidityPeriod={formatValidityPeriod} />
      )}
    </div>
  )
}

// Grid View Component
function GridView({ 
  activePrograms, 
  inactivePrograms 
}: { 
  activePrograms: TrainingProgram[]
  inactivePrograms: TrainingProgram[]
}) {
  return (
    <>
      {/* Active Programs */}
      {activePrograms.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Active Programs ({activePrograms.length})
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activePrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Programs */}
      {inactivePrograms.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <XCircle className="h-5 w-5 text-muted-foreground" />
              Inactive Programs ({inactivePrograms.length})
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inactivePrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// List View Component
function ListView({ 
  programs, 
  formatValidityPeriod 
}: { 
  programs: TrainingProgram[]
  formatValidityPeriod: (months: number | null) => string 
}) {
  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Program</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Duration</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Validity</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((program) => (
              <tr key={program.id} className="border-b hover:bg-muted/50 transition-colors">
                <td className="p-4 align-middle">
                  <div className="space-y-1">
                    <div className="font-medium">{program.title}</div>
                    <div className="text-sm text-muted-foreground font-mono">{program.code}</div>
                  </div>
                </td>
                <td className="p-4 align-middle">
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
                </td>
                <td className="p-4 align-middle">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{program.total_hours || 0}h</span>
                  </div>
                </td>
                <td className="p-4 align-middle">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatValidityPeriod(program.validity_months)}
                    </span>
                  </div>
                </td>
                <td className="p-4 align-middle">
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/training-programs/${program.id}`}>
                        <Eye className="mr-2 h-3.5 w-3.5" />
                        View
                      </Link>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Helper component for Grid View
function ProgramCard({ program }: { program: TrainingProgram }) {
  const formatValidityPeriod = (months: number | null) => {
    if (!months) return "24 months"
    
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
    <Card className="group hover:border-primary/40 transition-all duration-300 shadow-sm">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-lg leading-tight">{program.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                    {program.code}
                  </code>
                  {program.is_active ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-muted-foreground">Duration</span>
                </div>
                <div className="font-bold text-xl">{program.total_hours || 0}h</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-muted-foreground">Validity</span>
                </div>
                <div className="font-bold text-xl">
                  {formatValidityPeriod(program.validity_months)}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t">
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href={`/dashboard/training-programs/${program.id}`}>
                    <BookOpen className="mr-2 h-3.5 w-3.5" />
                    Details
                  </Link>
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/dashboard/trainings?program=${program.id}`}>
                    <Users className="mr-2 h-3.5 w-3.5" />
                    Enroll
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}