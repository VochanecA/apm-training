// components/training-program-instructor.tsx
import { User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Instructor {
  id: string
  full_name: string
  email: string
  role: string
}

interface TrainingProgramInstructorProps {
  instructor: Instructor | null
}

export function TrainingProgramInstructor({ instructor }: TrainingProgramInstructorProps) {
  if (!instructor) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <User className="h-4 w-4" />
        <span className="italic">No instructor assigned</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
        <User className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="font-medium">{instructor.full_name}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{instructor.email}</span>
          <Badge variant="outline" className="text-xs capitalize">
            {instructor.role}
          </Badge>
        </div>
      </div>
    </div>
  )
}