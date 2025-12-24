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
import { BookOpen, Plus } from "lucide-react"
import { addTrainingProgram, getJobCategories } from "@/app/actions/training-programs"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface JobCategory {
  id: string
  name_en: string
  name_me: string
  code: string
}

export function AddTrainingProgramDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [jobCategories, setJobCategories] = useState<JobCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const router = useRouter()

  // Fetch job categories when dialog opens
  useEffect(() => {
    if (open) {
      fetchJobCategories()
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await addTrainingProgram(formData)

      if (result.success) {
        toast.success(result.message)
        setOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to create training program")
      }
    } catch (error: any) {
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
              />
              <p className="text-xs text-muted-foreground">
                Unique code for identifying this program
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="job_category_id">Job Category (Optional)</Label>
              <Select name="job_category_id" disabled={loadingCategories}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingCategories ? "Loading..." : "Select job category"} />
                </SelectTrigger>
                <SelectContent>
                  {/* Koristimo posebnu vrednost umesto praznog stringa */}
                  <SelectItem value="no-category">No category</SelectItem>
                  {jobCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name_en} ({cat.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Program objectives and overview..."
                rows={3}
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
                  defaultValue="0"
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="practical_hours">Practical Hours</Label>
                <Input
                  id="practical_hours"
                  name="practical_hours"
                  type="number"
                  min="0"
                  defaultValue="0"
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ojt_hours">OJT Hours</Label>
                <Input
                  id="ojt_hours"
                  name="ojt_hours"
                  type="number"
                  min="0"
                  defaultValue="0"
                  placeholder="0"
                />
              </div>
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
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="approval_date">Approval Date</Label>
                    <Input
                      id="approval_date"
                      name="approval_date"
                      type="date"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="approved_by">Approved By</Label>
                    <Input
                      id="approved_by"
                      name="approved_by"
                      placeholder="e.g., CAA Montenegro"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    name="version"
                    placeholder="1.0"
                    defaultValue="1.0"
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