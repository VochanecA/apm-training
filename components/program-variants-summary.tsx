// components/program-variants-summary.tsx (opciono)
"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, RefreshCw, Calendar, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ProgramVariantsSummaryProps {
  programId: string
}

export async function ProgramVariantsSummary({ programId }: ProgramVariantsSummaryProps) {
  const supabase = createClient()
  
  const { data: variants } = await supabase
    .from('training_program_variants')
    .select('*')
    .eq('program_id', programId)
    .order('variant_type')
  
  if (!variants || variants.length === 0) {
    return null
  }

  const getVariantIcon = (type: string) => {
    switch(type) {
      case 'initial': return <Award className="h-4 w-4" />
      case 'recurrent': return <RefreshCw className="h-4 w-4" />
      case 'requalification': return <Award className="h-4 w-4" />
      case 'extension': return <Calendar className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getVariantLabel = (type: string) => {
    const labels: Record<string, string> = {
      'initial': 'Sticanje',
      'recurrent': 'Obnavljanje',
      'requalification': 'Ponovna kvalifikacija',
      'extension': 'Produženje',
      'refresher': 'Osvežavajući'
    }
    return labels[type] || type
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Program Variants</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {variants.map((variant) => (
          <div key={variant.id} className="flex items-center justify-between border-b pb-2 last:border-0">
            <div className="flex items-center gap-2">
              {getVariantIcon(variant.variant_type)}
              <span className="text-sm">{getVariantLabel(variant.variant_type)}</span>
              {!variant.is_active && (
                <Badge variant="outline" className="text-xs">Inactive</Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {variant.total_hours}h • {variant.validity_months}m
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}