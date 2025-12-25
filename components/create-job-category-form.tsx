"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createJobCategory } from "@/app/actions/job-categories"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Briefcase, Save, Plus } from "lucide-react"

export default function CreateJobCategoryForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    name_en: "",
    name_me: "",
    description: "",
    requires_certificate: true,
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
      formDataObj.append("code", formData.code.toUpperCase())
      formDataObj.append("name_en", formData.name_en)
      formDataObj.append("name_me", formData.name_me || formData.name_en)
      formDataObj.append("description", formData.description)
      formDataObj.append("requires_certificate", formData.requires_certificate.toString())

      const result = await createJobCategory(formDataObj)

      if (!result.success) {
        toast.error(result.error || "Failed to create job category")
        return
      }

      toast.success("Job category created successfully!")
      router.push("/dashboard/job-categories")
      router.refresh()
    } catch (error: any) {
      console.error("Error creating job category:", error)
      toast.error(`Failed to create job category: ${error.message}`)
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
            New Job Category
          </CardTitle>
          <CardDescription>Define a new job classification for personnel management</CardDescription>
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
              <p className="text-xs text-muted-foreground">Unique identifier (uppercase recommended)</p>
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
                placeholder="Local language name (optional)"
              />
              <p className="text-xs text-muted-foreground">Leave empty to use English name</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
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
          onClick={() => router.push("/dashboard/job-categories")}
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
              <Plus className="mr-2 h-4 w-4" />
              Create Category
            </>
          )}
        </Button>
      </div>
    </form>
  )
}