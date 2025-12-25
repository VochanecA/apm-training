"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateJobCategory } from "@/app/actions/job-categories"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Briefcase, Save, ArrowLeft } from "lucide-react"

interface JobCategory {
  id: string
  code: string
  name_en: string
  name_me: string
  description: string | null
  requires_certificate: boolean
}

interface EditJobCategoryFormProps {
  category: JobCategory
}

export default function EditJobCategoryForm({ category }: EditJobCategoryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<JobCategory>({
    ...category,
    name_me: category.name_me || category.name_en,
    description: category.description || "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      requires_certificate: checked
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append("code", formData.code)
      formDataObj.append("name_en", formData.name_en)
      formDataObj.append("name_me", formData.name_me)
      formDataObj.append("description", formData.description || "")
      formDataObj.append("requires_certificate", formData.requires_certificate.toString())

      const result = await updateJobCategory(category.id, formDataObj)

      if (!result.success) {
        toast.error(result.error || "Failed to update job category")
        return
      }

      toast.success("Job category updated successfully!")
      router.push(`/dashboard/job-categories/${category.id}`)
      router.refresh()
    } catch (error: any) {
      console.error("Error updating job category:", error)
      toast.error(`Failed to update job category: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job Category Information
          </CardTitle>
          <CardDescription>Update the classification details and requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code">Category Code *</Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                placeholder="e.g., APM-01"
                className="font-mono uppercase"
              />
              <p className="text-xs text-muted-foreground">Unique identifier for this category</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name_en">Name (English) *</Label>
              <Input
                id="name_en"
                name="name_en"
                value={formData.name_en}
                onChange={handleInputChange}
                required
                placeholder="e.g., Apron Manager"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name_me">Name (Local)</Label>
              <Input
                id="name_me"
                name="name_me"
                value={formData.name_me}
                onChange={handleInputChange}
                placeholder="Local language name"
              />
              <p className="text-xs text-muted-foreground">Leave empty to use English name</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              placeholder="Job category description, responsibilities, and requirements..."
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="space-y-0.5">
              <Label htmlFor="requires_certificate">Certificate Requirement</Label>
              <p className="text-sm text-muted-foreground">
                Does this job role require a certificate?
              </p>
            </div>
            <Switch
              id="requires_certificate"
              checked={formData.requires_certificate}
              onCheckedChange={handleSwitchChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/job-categories/${category.id}`)}
          disabled={loading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}