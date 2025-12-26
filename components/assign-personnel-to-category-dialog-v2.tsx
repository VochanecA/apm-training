// components/assign-personnel-to-category-dialog-v2.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { 
  Search,
  Check,
  X,
  Users,
  AlertCircle
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { addPersonnelToCategory } from "@/app/actions/job-categories"
import { createClient } from "@/lib/supabase/client"

interface Personnel {
  id: string
  full_name: string
  email: string
  role: string
  is_active: boolean
  job_category_id: string | null
}

interface AssignPersonnelToCategoryDialogV2Props {
  jobCategoryId: string
  jobCategoryName: string
  trigger: React.ReactNode
}

export function AssignPersonnelToCategoryDialogV2({
  jobCategoryId,
  jobCategoryName,
  trigger,
}: AssignPersonnelToCategoryDialogV2Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [selectedPersonnel, setSelectedPersonnel] = useState<string[]>([])
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true)
  const [showConfirmation, setShowConfirmation] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  // Učitavanje osoblja
  useEffect(() => {
    if (!open) return
    
    const fetchPersonnel = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, is_active, job_category_id')
          .order('full_name')
        
        if (error) throw error
        
        setPersonnel(data || [])
      } catch (error) {
        console.error("Error fetching personnel:", error)
        toast.error("Failed to load personnel")
      } finally {
        setLoading(false)
      }
    }
    
    fetchPersonnel()
  }, [open, supabase])

  // Filtriraj osoblje
  const filteredPersonnel = personnel.filter(person => {
    // Filter po pretrazi
    const matchesSearch = 
      person.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Filter po dostupnosti
    const matchesAvailability = !showOnlyAvailable || !person.job_category_id
    
    // Filter aktivnih korisnika
    const isActive = person.is_active
    
    return matchesSearch && matchesAvailability && isActive
  })

  // Selekcija
  const toggleSelection = (personId: string) => {
    setSelectedPersonnel(prev => 
      prev.includes(personId) 
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    )
  }

  // Potvrda dodele
  const handleConfirmAssignment = async () => {
    if (selectedPersonnel.length === 0) {
      toast.error("Please select at least one person")
      return
    }

    setSubmitting(true)
    try {
      const result = await addPersonnelToCategory(jobCategoryId, selectedPersonnel)
      
      if (!result.success) {
        toast.error(result.error || "Failed to assign personnel")
        return
      }

      toast.success(result.message || `Successfully assigned ${selectedPersonnel.length} personnel`)
      
      // Reset i zatvori dialog
      setSelectedPersonnel([])
      setSearchQuery("")
      setShowOnlyAvailable(true)
      setOpen(false)
      
      // Refrešuj stranicu
      router.refresh()
      
    } catch (error: any) {
      console.error("Error assigning personnel:", error)
      toast.error(error.message || "Failed to assign personnel")
    } finally {
      setSubmitting(false)
      setShowConfirmation(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Assign Personnel to {jobCategoryName}
            </DialogTitle>
            <DialogDescription>
              Select personnel to assign to this job category. Only active personnel without existing assignments are shown by default.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-only-available"
                  checked={showOnlyAvailable}
                  onCheckedChange={setShowOnlyAvailable}
                />
                <Label htmlFor="show-only-available" className="text-sm">
                  Show only unassigned
                </Label>
              </div>
            </div>

            {/* Selection Info */}
            {selectedPersonnel.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-600">
                      {selectedPersonnel.length} selected
                    </Badge>
                    <span className="text-sm text-blue-700">
                      Click on personnel to select/deselect
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPersonnel([])}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            )}

            {/* Personnel List */}
            <ScrollArea className="h-[400px] border rounded-lg">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredPersonnel.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mb-2" />
                  <p>No personnel found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredPersonnel.map((person) => {
                    const isSelected = selectedPersonnel.includes(person.id)
                    const isAssigned = !!person.job_category_id
                    
                    return (
                      <div
                        key={person.id}
                        className={`p-4 cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-primary/10 border-l-4 border-l-primary' 
                            : 'hover:bg-muted/50'
                        } ${isAssigned && !isSelected ? 'opacity-60' : ''}`}
                        onClick={() => !isAssigned && toggleSelection(person.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                              }`}>
                                {isSelected ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Users className="h-4 w-4" />
                                )}
                              </div>
                              
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {person.full_name}
                                  {!person.is_active && (
                                    <Badge variant="outline" className="text-xs">
                                      Inactive
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {person.email}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="capitalize">
                              {person.role}
                            </Badge>
                            
                            {isAssigned && (
                              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                                Already Assigned
                              </Badge>
                            )}
                            
                            {isSelected && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleSelection(person.id)
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={() => setShowConfirmation(true)}
                disabled={selectedPersonnel.length === 0 || submitting}
              >
                {submitting ? "Assigning..." : `Assign ${selectedPersonnel.length} Personnel`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to assign {selectedPersonnel.length} personnel 
              to the "{jobCategoryName}" job category?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAssignment}
              disabled={submitting}
            >
              {submitting ? "Assigning..." : "Confirm Assignment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}