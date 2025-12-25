"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AssignPersonnelToCategoryDialog } from "./assign-personnel-to-category-dialog"
import { 
  Search, 
  ExternalLink, 
  Download, 
  Printer, 
  FilterX,
  Briefcase,
  Users,
  GraduationCap,
  FileText,
  Edit,
  Trash2,
  Plus
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface JobCategory {
  id: string
  code: string
  name_en: string
  name_me: string
  description: string | null
  requires_certificate: boolean
  created_at: string
  profiles: { count: number }[] | null
  training_programs: { count: number }[] | null
}

interface JobCategoriesListProps {
  initialCategories: JobCategory[]
}

export function JobCategoriesList({ initialCategories }: JobCategoriesListProps) {
  const [query, setQuery] = useState("")
  const [categories, setCategories] = useState<JobCategory[]>(initialCategories)
  const [categoryToDelete, setCategoryToDelete] = useState<JobCategory | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // 1. Logika filtriranja
  const filtered = categories.filter(cat => 
    cat.code.toLowerCase().includes(query.toLowerCase()) || 
    cat.name_en.toLowerCase().includes(query.toLowerCase()) ||
    (cat.name_me?.toLowerCase().includes(query.toLowerCase()) || false) ||
    (cat.description?.toLowerCase().includes(query.toLowerCase()) || false)
  )

  // 2. Export u CSV
  const exportToCSV = () => {
    const headers = ["Code", "Name (EN)", "Name (Local)", "Description", "Requires Certificate", "Personnel Count", "Programs Count"]
    const rows = filtered.map(cat => [
      `"${cat.code}"`, 
      `"${cat.name_en}"`, 
      `"${cat.name_me}"`,
      `"${cat.description || 'N/A'}"`,
      cat.requires_certificate ? "Yes" : "No",
      cat.profiles?.[0]?.count || 0,
      cat.training_programs?.[0]?.count || 0
    ].join(","))

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.setAttribute("download", `job_categories_export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 3. Funkcija za brisanje kategorije
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return

    setIsDeleting(true)
    try {
      const { deleteJobCategory } = await import("@/app/actions/job-categories")
      const result = await deleteJobCategory(categoryToDelete.id)

      if (!result.success) {
        toast.error(result.error || "Failed to delete job category")
        return
      }

      toast.success(`Job category "${categoryToDelete.name_en}" deleted successfully`)
      // Ukloni kategoriju iz liste
      setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete.id))
    } catch (error: any) {
      console.error("Error deleting job category:", error)
      toast.error(error.message || "Failed to delete job category")
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* TOOLBAR ZA PRETRAGU I EXPORT */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between no-print bg-slate-50/50 p-4 rounded-xl border border-dashed">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search categories by code, name, or description..." 
            className="pl-10 h-11 bg-white shadow-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV} className="bg-white h-11 shadow-sm">
            <Download className="mr-2 h-4 w-4 text-blue-600" /> CSV
          </Button>
          <Button variant="outline" onClick={() => window.print()} className="bg-white h-11 shadow-sm">
            <Printer className="mr-2 h-4 w-4 text-slate-600" /> Print
          </Button>
          <Button asChild className="h-11">
            <Link href="/dashboard/job-categories/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Link>
          </Button>
        </div>
      </div>

      {/* INFO O FILTERU */}
      {query && (
        <div className="no-print">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-blue-700">
                Showing {filtered.length} of {categories.length} categories
              </span>
              <Badge variant="outline" className="bg-white">
                Search: "{query}"
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setQuery("")}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* LISTA KATEGORIJA */}
      <div className="grid gap-4 print:block">
        {filtered.length > 0 ? (
          filtered.map((category) => {
            const personnelCount = category.profiles?.[0]?.count || 0
            const programsCount = category.training_programs?.[0]?.count || 0
            
            return (
              <Card key={category.id} className="group hover:border-primary/40 transition-all duration-300 shadow-sm print:shadow-none print:mb-8">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl font-bold tracking-tight">{category.name_en}</CardTitle>
                        <Badge variant="outline" className="font-mono bg-slate-50 text-[10px]">
                          {category.code}
                        </Badge>
                        {category.requires_certificate && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                            <FileText className="mr-1 h-3 w-3" />
                            Certificate Required
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="font-medium text-slate-600">
                          {category.name_me}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm" className="no-print">
                          <Link href={`/dashboard/job-categories/${category.id}/edit`}>
                            <Edit className="mr-2 h-3.5 w-3.5" />
                            Edit
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="no-print text-destructive border-destructive/20 hover:bg-destructive/10"
                          onClick={() => {
                            setCategoryToDelete(category)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                      <Button asChild variant="secondary" size="sm" className="no-print group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        <Link href={`/dashboard/job-categories/${category.id}`}>
                          Details <ExternalLink className="ml-2 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t pt-4">
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {category.description || "No description available for this job category."}
                      </p>
                      
                      {/* Statistics */}
                      <div className="flex flex-wrap gap-4">
                        <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span className="text-lg font-bold text-blue-700">{personnelCount}</span>
                          </div>
                          <span className="text-xs text-blue-600 mt-1">Personnel</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-emerald-600" />
                            <span className="text-lg font-bold text-emerald-700">{programsCount}</span>
                          </div>
                          <span className="text-xs text-emerald-600 mt-1">Programs</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-purple-600" />
                            <span className="text-lg font-bold text-purple-700">
                              {new Date(category.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="text-xs text-purple-600 mt-1">Created</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-slate-50 p-4 rounded-lg border">
                        <h4 className="text-sm font-semibold mb-2 text-slate-700">Quick Actions</h4>
                        <div className="flex flex-wrap gap-2">
                          {personnelCount > 0 ? (
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/dashboard/job-categories/${category.id}#personnel`}>
                                <Users className="mr-2 h-3 w-3" />
                                View Personnel ({personnelCount})
                              </Link>
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" disabled>
                              <Users className="mr-2 h-3 w-3" />
                              No Personnel
                            </Button>
                          )}
                          {programsCount > 0 ? (
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/dashboard/training-programs?category=${category.id}`}>
                                <GraduationCap className="mr-2 h-3 w-3" />
                                View Programs ({programsCount})
                              </Link>
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" disabled>
                              <GraduationCap className="mr-2 h-3 w-3" />
                              No Programs
                            </Button>
                          )}
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
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-2xl bg-slate-50/50">
            <FilterX className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">No job categories found</h3>
            <p className="text-sm text-slate-500">
              {query ? `No categories match "${query}"` : "No job categories available yet"}
            </p>
            <Button variant="link" onClick={() => setQuery("")} className="mt-2">
              {query ? "Clear search" : "Add your first category"}
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job category 
              <span className="font-semibold"> {categoryToDelete?.name_en} ({categoryToDelete?.code})</span>.
              {categoryToDelete?.profiles?.[0]?.count && categoryToDelete.profiles[0].count > 0 && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                  <p className="text-amber-700 text-sm">
                    ⚠️ Warning: There are {categoryToDelete.profiles[0].count} personnel assigned to this category.
                    They will be unassigned from this category.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Category"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .print\\:block { display: block !important; }
          body { background: white !important; }
          .card { break-inside: avoid; }
        }
      `}</style>
    </div>
  )
}