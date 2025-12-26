// components/add-training-program-dialog.tsx
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Plus, Calendar, User, Users } from "lucide-react"
import { addTrainingProgram, getJobCategories } from "@/app/actions/training-programs"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

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

export function AddTrainingProgramDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [jobCategories, setJobCategories] = useState<JobCategory[]>([])
  const [personnel, setPersonnel] = useState<Profile[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingPersonnel, setLoadingPersonnel] = useState(false)
const [formData, setFormData] = useState({
  title: "",
  code: "",
  job_category_id: "no-category",
  primary_instructor_id: "no-instructor", // Promenjeno iz "" u "no-instructor"
  description: "",
  theoretical_hours: "0",
  practical_hours: "0",
  ojt_hours: "0",
  validity_months: "24",
  approval_number: "",
  approval_date: "",
  approved_by: "",
  version: "1.0"
})

  const router = useRouter()
  const supabase = createClient()

  // Fetch job categories and personnel when dialog opens
  useEffect(() => {
    if (open) {
      fetchJobCategories()
      fetchPersonnel()
    } else {
      // Reset form when dialog closes
setFormData({
  title: "",
  code: "",
  job_category_id: "no-category",
  primary_instructor_id: "no-instructor", // Promenjeno
  description: "",
  theoretical_hours: "0",
  practical_hours: "0",
  ojt_hours: "0",
  validity_months: "24",
  approval_number: "",
  approval_date: "",
  approved_by: "",
  version: "1.0"
})
    }
  }, [open])

  const fetchJobCategories = async () => {
    setLoadingCategories(true)
    try {
      const result = await getJobCategories()
      if (result.success && result.data) {
        setJobCategories(result.data)
      }
    } catch (error) {
      console.error("Error fetching job categories:", error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchPersonnel = async () => {
    setLoadingPersonnel(true)
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
      toast.error("Failed to load personnel")
    } finally {
      setLoadingPersonnel(false)
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
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const submitFormData = new FormData()
      
      // Add all form values
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          submitFormData.append(key, value.toString())
        }
      })

      const result = await addTrainingProgram(submitFormData)
      
      if (result.success) {
        toast.success(result.message || "Training program created successfully")
        setOpen(false)
        
        setTimeout(() => {
          window.location.href = "/dashboard/training-programs"
        }, 500)
        
      } else {
        toast.error(result.error || "Failed to create training program")
      }
    } catch (error: any) {
      console.error("Error in handleSubmit:", error)
      toast.error(error.message || "Failed to create training program")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Program
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Training Program</DialogTitle>
            <DialogDescription>
              Define a new training program with its modules and requirements
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">
                Program Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Airside Safety Training"
                required
                minLength={2}
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="code">
                Program Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                name="code"
                placeholder="e.g., AST-101"
                required
                minLength={2}
                className="uppercase"
                value={formData.code}
                onChange={handleInputChange}
              />
              <p className="text-xs text-muted-foreground">
                Unique code for identifying this program
              </p>
            </div>

            {/* Job Category */}
            <div className="grid gap-2">
              <Label htmlFor="job_category_id">Job Category (Optional)</Label>
              <Select 
                name="job_category_id" 
                disabled={loadingCategories}
                value={formData.job_category_id}
                onValueChange={(value) => handleSelectChange("job_category_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingCategories ? "Loading..." : "Select job category"} />
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

            {/* Primary Instructor - Bira se iz svih osoblja */}


{/* Primary Instructor - Bira se iz svih osoblja */}
<div className="grid gap-2">
  <Label htmlFor="primary_instructor_id" className="flex items-center gap-2">
    <User className="h-4 w-4" />
    Primary Instructor (Optional)
  </Label>
  <Select 
    name="primary_instructor_id" 
    disabled={loadingPersonnel}
    value={formData.primary_instructor_id}
    onValueChange={(value) => handleSelectChange("primary_instructor_id", value)}
  >
    <SelectTrigger>
      <SelectValue placeholder={loadingPersonnel ? "Loading personnel..." : "Select instructor"} />
    </SelectTrigger>
    <SelectContent>
      {/* Koristite posebnu vrednost umesto praznog stringa */}
      <SelectItem value="no-instructor">No instructor assigned</SelectItem>
      {/* Grupišemo osoblje po ulogama */}
      <SelectItem value="instructors-header" disabled className="font-semibold">
        Instructors
      </SelectItem>
      {personnel
        .filter(p => p.role === "instructor")
        .map((person) => (
          <SelectItem key={person.id} value={person.id}>
            {person.full_name} ({person.email})
          </SelectItem>
        ))}
      
      <SelectItem value="other-header" disabled className="font-semibold">
        Other Personnel
      </SelectItem>
      {personnel
        .filter(p => p.role !== "instructor")
        .map((person) => (
          <SelectItem key={person.id} value={person.id}>
            {person.full_name} ({person.role})
          </SelectItem>
        ))}
    </SelectContent>
  </Select>
  <p className="text-xs text-muted-foreground">
    Select the primary instructor responsible for this program
  </p>
</div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Program objectives and overview..."
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="theoretical_hours">Theoretical Hours</Label>
                <Input
                  id="theoretical_hours"
                  name="theoretical_hours"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.theoretical_hours}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="practical_hours">Practical Hours</Label>
                <Input
                  id="practical_hours"
                  name="practical_hours"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.practical_hours}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ojt_hours">OJT Hours</Label>
                <Input
                  id="ojt_hours"
                  name="ojt_hours"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.ojt_hours}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Validity Period */}
            <div className="grid gap-2 border-t pt-4">
              <Label htmlFor="validity_months" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Certificate Validity Period
              </Label>
              <Select 
                name="validity_months" 
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
              <p className="text-xs text-muted-foreground">
                How long the certificate is valid after successful completion
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-3">Approval Information (Optional)</h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="approval_number">Approval Number</Label>
                  <Input
                    id="approval_number"
                    name="approval_number"
                    placeholder="e.g., APM/2024/001"
                    value={formData.approval_number}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="approval_date">Approval Date</Label>
                    <Input
                      id="approval_date"
                      name="approval_date"
                      type="date"
                      value={formData.approval_date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="approved_by">Approved By</Label>
                    <Input
                      id="approved_by"
                      name="approved_by"
                      placeholder="e.g., CAA Montenegro"
                      value={formData.approved_by}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    name="version"
                    placeholder="1.0"
                    value={formData.version}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Create Program
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}