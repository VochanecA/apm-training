"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ShieldCheck, Clock, GraduationCap } from "lucide-react"
import { average } from "@/lib/utils"

export function TrainingProgramsStats({ programs }: { programs: any[] }) {
  const stats = useMemo(() => ({
    total: programs.length,
    active: programs.filter(p => p.is_active).length,
    avgTotal: Math.round(average(programs.map(p => p.total_hours || 0))),
    approved: programs.filter(p => p.approval_number).length
  }), [programs])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 no-print">
      <StatsCard 
        title="Total Programs" 
        value={stats.total} 
        icon={<BookOpen className="h-4 w-4 text-blue-500" />} 
        description="Filtered curriculums"
      />
      <StatsCard 
        title="Compliance" 
        value={stats.approved} 
        icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />} 
        description="CAA Approved"
      />
      <StatsCard 
        title="Avg. Duration" 
        value={`${stats.avgTotal}h`} 
        icon={<Clock className="h-4 w-4 text-orange-500" />} 
        description="Per program"
      />
      <StatsCard 
        title="Active Status" 
        value={stats.active} 
        icon={<GraduationCap className="h-4 w-4 text-purple-500" />} 
        description="Ready for use"
      />
    </div>
  )
}

function StatsCard({ title, value, icon, description }: any) {
  return (
    <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <p className="text-[10px] text-muted-foreground mt-1 uppercase font-medium">{description}</p>
      </CardContent>
    </Card>
  )
}