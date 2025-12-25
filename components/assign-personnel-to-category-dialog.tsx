"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Users, Plus, X, Check, Filter } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

interface Personnel {
  id: string
  full_name: string
  email: string
  role: string
  is_active: boolean
  job_category_id: string | null
}

interface AssignPersonnelToCategoryDialogProps {
  jobCategoryId: string
  jobCategoryName: string
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function AssignPersonnelToCategoryDialog({ 
  jobCategoryId, 
  jobCategoryName,
  trigger,
  onSuccess 
}: AssignPersonnelToCategoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [allPersonnel, setAllPersonnel] = useState<Personnel[]>([])
  const [selectedPersonnel, setSelectedPersonnel] = useState<string[]>([])
  const [isFetching, setIsFetching] = useState(false)

  // Fetch personnel when dialog opens
  useEffect(() => {
    if (open) {
      fetchPersonnel()
    }
  }, [open])

  const fetchPersonnel = async () => {
    setIsFetching(true)
    try {
      const supabase = createClient()
      
      // Fetch all personnel except those already in this category
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, is_active, job_category_id")
        .order("full_name")

      if (error) throw error

      setAllPersonnel(data || [])
      setSelectedPersonnel([])
    } catch (error: any) {
      console.error("Error fetching personnel:", error)
      toast.error("Failed to load personnel")
    } finally {
      setIsFetching(false)
    }
  }

  // Filter personnel based on search query and category
  const filteredPersonnel = allPersonnel.filter(person => {
    const matchesSearch = 
      person.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.role?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  // Personnel not in any category
  const unassignedPersonnel = filteredPersonnel.filter(p => !p.job_category_id)

  // Personnel in other categories
  const otherCategoryPersonnel = filteredPersonnel.filter(p => 
    p.job_category_id && p.job_category_id !== jobCategoryId
  )

  // Personnel already in this category
  const currentCategoryPersonnel = filteredPersonnel.filter(p => 
    p.job_category_id === jobCategoryId
  )

  const togglePersonnelSelection = (personnelId: string) => {
    setSelectedPersonnel(prev => 
      prev.includes(personnelId)
        ? prev.filter(id => id !== personnelId)
        : [...prev, personnelId]
    )
  }

  const handleAssignPersonnel = async () => {
    if (selectedPersonnel.length === 0) {
      toast.error("Please select at least one personnel")
      return
    }

    setLoading(true)
    try {
      const { addPersonnelToCategory } = await import("@/app/actions/job-categories")
      const result = await addPersonnelToCategory(jobCategoryId, selectedPersonnel)

      if (!result.success) {
        toast.error(result.error || "Failed to assign personnel")
        return
      }

      toast.success(result.message || "Personnel assigned successfully")
      setOpen(false)
      setSelectedPersonnel([])
      onSuccess?.()
    } catch (error: any) {
      console.error("Error assigning personnel:", error)
      toast.error(error.message || "Failed to assign personnel")
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-500/10 text-purple-600"
      case "instructor":
        return "bg-blue-500/10 text-blue-600"
      case "employee":
        return "bg-green-500/10 text-green-600"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Users className="mr-2 h-4 w-4" />
            Assign Personnel
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Assign Personnel to Category</DialogTitle>
          <DialogDescription>
            Select personnel to assign to <span className="font-semibold">{jobCategoryName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search personnel by name, email, or role..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Selected Personnel */}
          {selectedPersonnel.length > 0 && (
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Selected ({selectedPersonnel.length})</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPersonnel([])}
                  className="h-6 px-2 text-xs"
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedPersonnel.map(id => {
                  const person = allPersonnel.find(p => p.id === id)
                  if (!person) return null
                  
                  return (
                    <Badge key={id} variant="secondary" className="pl-2 pr-1">
                      {person.full_name}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => togglePersonnelSelection(id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}

          {/* Personnel Lists */}
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {/* Currently in this category */}
            {currentCategoryPersonnel.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600">
                    Already Assigned
                  </Badge>
                  <span className="text-muted-foreground">({currentCategoryPersonnel.length})</span>
                </h4>
                <div className="space-y-2">
                  {currentCategoryPersonnel.map(person => (
                    <div
                      key={person.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-emerald-200 bg-emerald-50/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-emerald-500 text-white">
                            {getInitials(person.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{person.full_name}</div>
                          <div className="text-xs text-muted-foreground">{person.email}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600">
                        Already Assigned
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unassigned personnel */}
            {unassignedPersonnel.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Available Personnel
                  <span className="text-muted-foreground">({unassignedPersonnel.length})</span>
                </h4>
                <div className="space-y-2">
                  {unassignedPersonnel.map(person => (
                    <div
                      key={person.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPersonnel.includes(person.id)
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => togglePersonnelSelection(person.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(person.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          {selectedPersonnel.includes(person.id) && (
                            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{person.full_name}</div>
                          <div className="text-xs text-muted-foreground">{person.email}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getRoleColor(person.role)}>
                              {person.role}
                            </Badge>
                            {!person.is_active && (
                              <Badge variant="outline" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {!person.is_active && (
                        <Badge variant="outline" className="text-amber-600">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personnel in other categories */}
            {otherCategoryPersonnel.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Assigned to Other Categories
                  <span className="text-muted-foreground">({otherCategoryPersonnel.length})</span>
                </h4>
                <div className="space-y-2">
                  {otherCategoryPersonnel.map(person => (
                    <div
                      key={person.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPersonnel.includes(person.id)
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => togglePersonnelSelection(person.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-amber-500 text-white">
                              {getInitials(person.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          {selectedPersonnel.includes(person.id) && (
                            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{person.full_name}</div>
                          <div className="text-xs text-muted-foreground">{person.email}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getRoleColor(person.role)}>
                              {person.role}
                            </Badge>
                            {!person.is_active && (
                              <Badge variant="outline" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600">
                        Other Category
                      </Badge>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Note: Assigning personnel from other categories will remove them from their current category.
                </p>
              </div>
            )}

            {/* No results */}
            {filteredPersonnel.length === 0 && !isFetching && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <h3 className="mt-4 font-medium">No personnel found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery 
                    ? `No personnel match "${searchQuery}"`
                    : "No personnel available to assign"
                  }
                </p>
              </div>
            )}

            {/* Loading state */}
            {isFetching && (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="mt-2 text-sm text-muted-foreground">Loading personnel...</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="sm:order-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAssignPersonnel} 
            disabled={loading || selectedPersonnel.length === 0}
            className="w-full sm:w-auto sm:order-2"
          >
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Assigning...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Assign Selected ({selectedPersonnel.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}