// app/dashboard/training-programs/[id]/edit/page.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  ArrowLeft, 
  Save, 
  Calendar, 
  CheckCircle2,
  XCircle,
  User,
  Users,
  Search,
  X
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface JobCategory {
  id: string
  name_en: string
  name_me: string
  code: string
}

interface Profile {
  id: string
  full_name: string
  email: string
  role: string
  is_active: boolean
}

export default function EditTrainingProgramPage({ 
  params 
}: { 
  params: Promise<{ id: string }> | { id: string } 
}) {
  const router = useRouter()
  const supabase = createClient()
  
  const [programId, setProgramId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [jobCategories, setJobCategories] = useState<JobCategory[]>([])
  const [personnel, setPersonnel] = useState<Profile[]>([])
  const [program, setProgram] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    description: "",
    job_category_id: "no-category",
    primary_instructor_id: "no-instructor",
    theoretical_hours: "0",
    practical_hours: "0",
    ojt_hours: "0",
    validity_months: "24",
    approval_number: "",
    approval_date: "",
    approved_by: "",
    version: "1.0",
    is_active: true
  })

  const [searchPersonnel, setSearchPersonnel] = useState("")
  const [isPersonnelSelectOpen, setIsPersonnelSelectOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filtriranje osoblja:
  const filteredPersonnel = personnel.filter(person => 
    person.full_name.toLowerCase().includes(searchPersonnel.toLowerCase()) ||
    person.email.toLowerCase().includes(searchPersonnel.toLowerCase()) ||
    person.role.toLowerCase().includes(searchPersonnel.toLowerCase())
  )

  // Grupisanje filtriranog osoblja po ulogama
  const instructors = filteredPersonnel.filter(p => p.role === "instructor")
  const otherPersonnel = filteredPersonnel.filter(p => p.role !== "instructor")

  useEffect(() => {
    // Handle params as Promise or object
    const getParams = async () => {
      if (params && typeof params === 'object' && 'then' in params) {
        // params is a Promise
        const resolvedParams = await params
        setProgramId(resolvedParams.id)
        fetchProgram(resolvedParams.id)
      } else {
        // params is already an object
        setProgramId((params as any).id)
        fetchProgram((params as any).id)
      }
    }
    
    getParams()
    fetchJobCategories()
    fetchPersonnel()
  }, [params])

  useEffect(() => {
    // Focus search input when select opens
    if (isPersonnelSelectOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [isPersonnelSelectOpen])

  const fetchProgram = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("training_programs")
        .select(`
          *,
          primary_instructor:profiles!training_programs_primary_instructor_id_fkey(id, full_name, email, role)
        `)
        .eq("id", id)
        .single()

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      if (data) {
        setProgram(data)
        setFormData({
          title: data.title,
          code: data.code,
          description: data.description || "",
          job_category_id: data.job_category_id || "no-category",
          primary_instructor_id: data.primary_instructor_id || "no-instructor",
          theoretical_hours: data.theoretical_hours?.toString() || "0",
          practical_hours: data.practical_hours?.toString() || "0",
          ojt_hours: data.ojt_hours?.toString() || "0",
          validity_months: data.validity_months?.toString() || "24",
          approval_number: data.approval_number || "",
          approval_date: data.approval_date || "",
          approved_by: data.approved_by || "",
          version: data.version || "1.0",
          is_active: data.is_active
        })
      } else {
        toast.error("Program not found")
      }
    } catch (error: any) {
      console.error("Error fetching program:", error)
      toast.error("Failed to load program details")
    } finally {
      setLoading(false)
    }
  }

  const fetchJobCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("job_categories")
        .select("id, name_en, name_me, code")
        .order("name_en")

      if (error) throw error
      setJobCategories(data || [])
    } catch (error) {
      console.error("Error fetching job categories:", error)
    }
  }

  const fetchPersonnel = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, is_active")
        .eq("is_active", true)
        .order("full_name")

      if (error) throw error
      setPersonnel(data || [])
    } catch (error) {
      console.error("Error fetching personnel:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (name === "primary_instructor_id") {
      setIsPersonnelSelectOpen(false)
      setSearchPersonnel("") // Reset search when selection is made
    }
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_active: checked
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!programId) return
    
    setSaving(true)

    try {
      const { error } = await supabase
        .from("training_programs")
        .update({
          title: formData.title.trim(),
          code: formData.code.trim().toUpperCase(),
          description: formData.description.trim() || null,
          job_category_id: formData.job_category_id === "no-category" ? null : formData.job_category_id,
          primary_instructor_id: formData.primary_instructor_id === "no-instructor" ? null : formData.primary_instructor_id,
          theoretical_hours: parseInt(formData.theoretical_hours) || 0,
          practical_hours: parseInt(formData.practical_hours) || 0,
          ojt_hours: parseInt(formData.ojt_hours) || 0,
          validity_months: parseInt(formData.validity_months) || 24,
          approval_number: formData.approval_number.trim() || null,
          approval_date: formData.approval_date || null,
          approved_by: formData.approved_by.trim() || null,
          version: formData.version.trim() || "1.0",
          is_active: formData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq("id", programId)

      if (error) throw error

      toast.success("Training program updated successfully")
      router.push(`/dashboard/training-programs/${programId}`)
      router.refresh()
    } catch (error: any) {
      console.error("Error updating program:", error)
      toast.error(error.message || "Failed to update training program")
    } finally {
      setSaving(false)
    }
  }

  // Funkcija za dobijanje imena trenutnog instruktora
  const getCurrentInstructorName = () => {
    if (formData.primary_instructor_id === "no-instructor" || !formData.primary_instructor_id) {
      return "Select instructor from personnel"
    }
    
    const selectedPerson = personnel.find(p => p.id === formData.primary_instructor_id)
    if (selectedPerson) {
      return `${selectedPerson.full_name} (${selectedPerson.role})`
    }
    
    return program?.primary_instructor?.full_name || "Select instructor from personnel"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Program not found</h1>
          <p className="text-muted-foreground mt-2">The training program you're looking for doesn't exist or you don't have permission to access it.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/training-programs">
              Back to Programs
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 font-sans max-w-[1600px] mx-auto">
      
      {/* Back Link */}
      <div className="flex items-center">
        <Link 
          href={`/dashboard/training-programs/${programId}`} 
          className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Program Details
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit {program.title}</h1>
            <Badge variant="outline" className="font-mono">
              {program.code}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            Update program details and configuration
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => router.push(`/dashboard/training-programs/${programId}`)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="edit-program-form"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <form id="edit-program-form" onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Leva kolona - Osnovne informacije */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Program Information</CardTitle>
              <CardDescription>Update the basic details of the training program</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Program Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    minLength={2}
                    placeholder="e.g., Airside Safety Training"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">
                    Program Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    minLength={2}
                    className="uppercase"
                    placeholder="e.g., AST-101"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Program objectives and overview..."
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="job_category_id">Job Category</Label>
                  <Select 
                    value={formData.job_category_id}
                    onValueChange={(value) => handleSelectChange("job_category_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-category">No category</SelectItem>
                      {jobCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name_en} ({cat.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primary_instructor_id" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Primary Instructor
                  </Label>
                  
                  <Select 
                    value={formData.primary_instructor_id}
                    onValueChange={(value) => handleSelectChange("primary_instructor_id", value)}
                    open={isPersonnelSelectOpen}
                    onOpenChange={setIsPersonnelSelectOpen}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={getCurrentInstructorName()} />
                    </SelectTrigger>
                    <SelectContent className="p-0">
                      {/* Custom dropdown with search */}
                      <div className="p-2 border-b">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            ref={searchInputRef}
                            placeholder="Search personnel by name, email, or role..."
                            value={searchPersonnel}
                            onChange={(e) => setSearchPersonnel(e.target.value)}
                            className="pl-9 h-9 text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                          {searchPersonnel && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 top-1 h-7 w-7 p-0"
                              onClick={() => setSearchPersonnel("")}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        {searchPersonnel && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Found {filteredPersonnel.length} result{filteredPersonnel.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                      
                      <ScrollArea className="h-[300px]">
                        <div className="p-1">
                          {/* No instructor option */}
                          <div 
                            className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                              formData.primary_instructor_id === "no-instructor" ? "bg-accent font-medium" : ""
                            }`}
                            onClick={() => handleSelectChange("primary_instructor_id", "no-instructor")}
                          >
                            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                              {formData.primary_instructor_id === "no-instructor" && (
                                <div className="h-2 w-2 rounded-full bg-primary" />
                              )}
                            </span>
                            <span className="font-medium">No instructor assigned</span>
                          </div>

                          <Separator className="my-2" />

                          {/* Instruktori */}
                          {instructors.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Users className="h-3 w-3" />
                                Instructors ({instructors.length})
                              </div>
                              {instructors.map((person) => (
                                <div 
                                  key={person.id}
                                  className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                                    formData.primary_instructor_id === person.id ? "bg-accent font-medium" : ""
                                  }`}
                                  onClick={() => handleSelectChange("primary_instructor_id", person.id)}
                                >
                                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                    {formData.primary_instructor_id === person.id && (
                                      <div className="h-2 w-2 rounded-full bg-primary" />
                                    )}
                                  </span>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{person.full_name}</span>
                                    <span className="text-xs text-muted-foreground">{person.email}</span>
                                  </div>
                                </div>
                              ))}
                            </>
                          )}

                          {/* Ostalo osoblje */}
                          {otherPersonnel.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mt-2">
                                <User className="h-3 w-3" />
                                Other Personnel ({otherPersonnel.length})
                              </div>
                              {otherPersonnel.map((person) => (
                                <div 
                                  key={person.id}
                                  className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                                    formData.primary_instructor_id === person.id ? "bg-accent font-medium" : ""
                                  }`}
                                  onClick={() => handleSelectChange("primary_instructor_id", person.id)}
                                >
                                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                    {formData.primary_instructor_id === person.id && (
                                      <div className="h-2 w-2 rounded-full bg-primary" />
                                    )}
                                  </span>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{person.full_name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {person.email} • {person.role}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </>
                          )}

                          {/* No results */}
                          {filteredPersonnel.length === 0 && searchPersonnel && (
                            <div className="py-4 text-center">
                              <p className="text-sm text-muted-foreground">No personnel found for "{searchPersonnel}"</p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="mt-2 h-7 text-xs"
                                onClick={() => setSearchPersonnel("")}
                              >
                                Clear search
                              </Button>
                            </div>
                          )}

                          {/* No personnel available */}
                          {personnel.length === 0 && !searchPersonnel && (
                            <div className="py-4 text-center">
                              <p className="text-sm text-muted-foreground">No personnel available</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select instructor from existing personnel. Search by name, email, or role.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="theoretical_hours">Theoretical Hours</Label>
                  <Input
                    id="theoretical_hours"
                    name="theoretical_hours"
                    type="number"
                    min="0"
                    value={formData.theoretical_hours}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="practical_hours">Practical Hours</Label>
                  <Input
                    id="practical_hours"
                    name="practical_hours"
                    type="number"
                    min="0"
                    value={formData.practical_hours}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ojt_hours">OJT Hours</Label>
                  <Input
                    id="ojt_hours"
                    name="ojt_hours"
                    type="number"
                    min="0"
                    value={formData.ojt_hours}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="validity_months" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Certificate Validity Period
                </Label>
                <Select 
                  value={formData.validity_months}
                  onValueChange={(value) => handleSelectChange("validity_months", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select validity period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months (1 year)</SelectItem>
                    <SelectItem value="18">18 months</SelectItem>
                    <SelectItem value="24">24 months (2 years)</SelectItem>
                    <SelectItem value="36">36 months (3 years)</SelectItem>
                    <SelectItem value="48">48 months (4 years)</SelectItem>
                    <SelectItem value="60">60 months (5 years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Program Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {formData.is_active ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Active - Available for enrollment
                      </span>
                    ) : (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Inactive - Not available for enrollment
                      </span>
                    )}
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={handleSwitchChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Desna kolona - Approval Info */}
          <Card>
            <CardHeader>
              <CardTitle>Approval Information</CardTitle>
              <CardDescription>Official approval details (optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="approval_number">Approval Number</Label>
                <Input
                  id="approval_number"
                  name="approval_number"
                  value={formData.approval_number}
                  onChange={handleInputChange}
                  placeholder="e.g., APM/2024/001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="approval_date">Approval Date</Label>
                <Input
                  id="approval_date"
                  name="approval_date"
                  type="date"
                  value={formData.approval_date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="approved_by">Approved By</Label>
                <Input
                  id="approved_by"
                  name="approved_by"
                  value={formData.approved_by}
                  onChange={handleInputChange}
                  placeholder="e.g., CAA Montenegro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  name="version"
                  value={formData.version}
                  onChange={handleInputChange}
                  placeholder="1.0"
                />
              </div>

              {/* Trenutni instruktor (read-only) */}
              {formData.primary_instructor_id !== "no-instructor" && program.primary_instructor && (
                <div className="pt-4 border-t space-y-2">
                  <Label className="text-muted-foreground">Selected Instructor</Label>
                  <div className="p-3 bg-slate-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{program.primary_instructor.full_name}</p>
                        <p className="text-sm text-muted-foreground">{program.primary_instructor.email}</p>
                        <Badge variant="outline" className="mt-1 text-xs capitalize">
                          {program.primary_instructor.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Read-only info */}
              <div className="pt-4 border-t space-y-2">
                <div className="text-sm">
                  <Label className="text-muted-foreground">Created</Label>
                  <p>{program.created_at ? new Date(program.created_at).toLocaleDateString() : "Unknown"}</p>
                </div>
                <div className="text-sm">
                  <Label className="text-muted-foreground">Last Updated</Label>
                  <p>{program.updated_at ? new Date(program.updated_at).toLocaleDateString() : "Never"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}