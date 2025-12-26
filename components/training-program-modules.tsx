// components/training-program-modules.tsx
import { BookOpen, Clock, CheckCircle, Circle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TrainingModule {
  id: string
  title: string
  module_type: string
  duration_hours: number
  sequence_number: number
}

interface TrainingProgramModulesProps {
  modules: TrainingModule[]
}

export function TrainingProgramModules({ modules }: TrainingProgramModulesProps) {
  const sortedModules = [...modules].sort((a, b) => a.sequence_number - b.sequence_number)

  const getModuleTypeColor = (type: string) => {
    switch (type) {
      case 'theoretical':
        return 'bg-blue-100 text-blue-800'
      case 'practical':
        return 'bg-emerald-100 text-emerald-800'
      case 'ojt':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (modules.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed rounded-lg">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold">No modules defined</h3>
        <p className="text-muted-foreground">Add training modules to this program</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sortedModules.map((module, index) => (
        <div key={module.id} className="p-4 border rounded-lg hover:border-primary/40 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{module.sequence_number}</span>
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="font-medium">{module.title}</h4>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={getModuleTypeColor(module.module_type)}>
                    {module.module_type}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{module.duration_hours}h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}