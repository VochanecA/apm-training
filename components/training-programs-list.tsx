"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ExternalLink, Download, Printer, FilterX } from "lucide-react"
import Link from "next/link"
import { TrainingProgramsStats } from "./training-programs-stats"

export function TrainingProgramsList({ initialPrograms }: { initialPrograms: any[] }) {
  const [query, setQuery] = useState("")

  // 1. Logika filtriranja koja napaja i statistiku i listu
  const filtered = initialPrograms.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) || 
    p.code.toLowerCase().includes(query.toLowerCase())
  )

  // 2. Export u CSV
  const exportToCSV = () => {
    const headers = ["Code", "Title", "Category", "Theory", "Practical", "OJT", "Total", "Status"]
    const rows = filtered.map(p => [
      `"${p.code}"`, `"${p.title}"`, `"${p.job_category?.name_en || 'N/A'}"`,
      p.theoretical_hours || 0, p.practical_hours || 0, p.ojt_hours || 0,
      p.total_hours || 0, p.is_active ? "Active" : "Inactive"
    ].join(","))

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.setAttribute("download", `programs_export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-8">
      {/* DINAMIČKA STATISTIKA */}
      <TrainingProgramsStats programs={filtered} />

      {/* TOOLBAR ZA PRETRAGU I EXPORT */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between no-print bg-slate-50/50 p-4 rounded-xl border border-dashed">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search programs..." 
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
            <Printer className="mr-2 h-4 w-4 text-slate-600" /> PDF
          </Button>
        </div>
      </div>

      {/* LISTA PROGRAMA */}
      <div className="grid gap-4 print:block">
        {filtered.length > 0 ? (
          filtered.map((program) => {
            const total = program.total_hours || 1
            return (
              <Card key={program.id} className="group hover:border-primary/40 transition-all duration-300 shadow-sm print:shadow-none print:mb-8">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl font-bold tracking-tight">{program.title}</CardTitle>
                        <Badge variant="outline" className="font-mono bg-slate-50 text-[10px]">
                          {program.code}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="font-medium text-slate-600">
                          {program.job_category?.name_en || "General Training"}
                        </span>
                        <span className="text-slate-300">|</span>
                        {program.is_active ? (
                          <span className="text-emerald-600 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                            <span className="h-1 w-1 rounded-full bg-emerald-600" /> Active
                          </span>
                        ) : (
                          <span className="text-red-400 text-[10px] uppercase tracking-wider italic">Inactive</span>
                        )}
                      </div>
                    </div>
                    <Button asChild variant="secondary" size="sm" className="no-print group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <Link href={`/dashboard/training-programs/${program.id}`}>
                        Details <ExternalLink className="ml-2 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t pt-4">
                    <div className="space-y-4">
                      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 border shadow-inner no-print">
                        <div 
                          className="bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                          style={{ width: `${((program.theoretical_hours || 0) / total) * 100}%` }} 
                        />
                        <div 
                          className="bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                          style={{ width: `${((program.practical_hours || 0) / total) * 100}%` }} 
                        />
                        <div 
                          className="bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
                          style={{ width: `${((program.ojt_hours || 0) / total) * 100}%` }} 
                        />
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold uppercase tracking-tight">
                        <div className="flex flex-col">
                          <span className="text-blue-600">Theory</span>
                          <span className="text-lg text-slate-800">{program.theoretical_hours || 0}h</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-emerald-600">Practical</span>
                          <span className="text-lg text-slate-800">{program.practical_hours || 0}h</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-orange-600">OJT</span>
                          <span className="text-lg text-slate-800">{program.ojt_hours || 0}h</span>
                        </div>
                        <div className="flex flex-col border-l pl-6 ml-auto">
                          <span className="text-slate-400">Total</span>
                          <span className="text-lg text-primary">{program.total_hours || 0}h</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed italic border-l pl-6 print:border-none">
                      {program.description || "No description available for this training curriculum."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-2xl bg-slate-50/50">
            <FilterX className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">No programs found</h3>
            <p className="text-sm text-slate-500">Try adjusting your search criteria or filters.</p>
            <Button variant="link" onClick={() => setQuery("")} className="mt-2">Clear search</Button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .print\:block { display: block !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  )
}