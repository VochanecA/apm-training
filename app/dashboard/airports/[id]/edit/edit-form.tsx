"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateAirport } from "@/app/actions/airports"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Save, Building2, MapPin, Globe } from "lucide-react"

interface Airport {
  id: string
  code: string
  name: string
  type: string
  location: string
  country: string
  is_active: boolean
  icao_code?: string
  iata_code?: string
  description?: string
}

interface EditAirportFormProps {
  airport: Airport
}

export default function EditAirportForm({ airport }: EditAirportFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Airport>(airport)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_active: checked
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append("name", formData.name)
      formDataObj.append("code", formData.code)
      formDataObj.append("type", formData.type)
      formDataObj.append("location", formData.location)
      formDataObj.append("country", formData.country)
      formDataObj.append("icao_code", formData.icao_code || "")
      formDataObj.append("iata_code", formData.iata_code || "")
      formDataObj.append("description", formData.description || "")
      formDataObj.append("is_active", formData.is_active.toString())

      const result = await updateAirport(airport.id, formDataObj)

      if (!result.success) {
        toast.error(result.error || "Failed to update airport")
        return
      }

      toast.success("Airport updated successfully!")
      router.push(`/dashboard/airports/${airport.id}`)
      router.refresh()
    } catch (error: any) {
      console.error("Error updating airport:", error)
      toast.error(`Failed to update airport: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Airport Information
          </CardTitle>
          <CardDescription>Basic airport details and identification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code">Airport Code *</Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                placeholder="e.g., TGD"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Airport Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g., Podgorica Airport"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Facility Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleSelectChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="airport">Airport</SelectItem>
                  <SelectItem value="heliodrome">Heliodrome</SelectItem>
                  <SelectItem value="training_facility">Training Facility</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
                placeholder="e.g., ME"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icao_code">ICAO Code</Label>
              <Input
                id="icao_code"
                name="icao_code"
                value={formData.icao_code || ""}
                onChange={handleInputChange}
                placeholder="e.g., LYPG"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="iata_code">IATA Code</Label>
              <Input
                id="iata_code"
                name="iata_code"
                value={formData.iata_code || ""}
                onChange={handleInputChange}
                placeholder="e.g., TGD"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Details
          </CardTitle>
          <CardDescription>Geographic location information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              placeholder="e.g., Podgorica, Montenegro"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleTextareaChange}
              placeholder="Additional information about this facility"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Status & Settings
          </CardTitle>
          <CardDescription>Airport operational status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Active Status</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable this airport facility
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

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/airports/${airport.id}`)}
          disabled={loading}
        >
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