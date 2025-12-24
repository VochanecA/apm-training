"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Save, X, Plus, User, Building2, Briefcase, Calendar, Shield } from "lucide-react"

interface Personnel {
  id: string
  email: string
  full_name: string
  employee_id?: string
  role: string
  date_of_birth?: string
  place_of_birth?: string
  nationality?: string
  phone?: string
  is_active: boolean
  job_category_id?: string
  needs_auth_setup: boolean
}

interface JobCategory {
  id: string
  name_en: string
  name_me: string
  code: string
}

interface Airport {
  id: string
  name: string
  code: string
  location: string
}

interface AirportAssignment {
  airport_id: string
  is_primary: boolean
  start_date: string
}

interface EditPersonnelFormProps {
  personnelId: string
  personnel: Personnel
  jobCategories: JobCategory[]
  airports: Airport[]
  currentAssignments: AirportAssignment[]
}

export default function EditPersonnelForm({ 
  personnelId,
  personnel, 
  jobCategories, 
  airports,
  currentAssignments 
}: EditPersonnelFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  const [formData, setFormData] = useState<Personnel>(personnel)
  const [assignments, setAssignments] = useState<AirportAssignment[]>(currentAssignments)
  const [newAssignment, setNewAssignment] = useState({
    airport_id: airports.length > 0 ? airports[0].id : "", // Postavite prvi aerodrom kao default
    is_primary: false,
    start_date: new Date().toISOString().split('T')[0]
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value === "none" ? null : value
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const addAssignment = () => {
    if (!newAssignment.airport_id) {
      toast.error("Please select an airport")
      return
    }

    // Check if airport already assigned
    if (assignments.some(a => a.airport_id === newAssignment.airport_id)) {
      toast.error("This airport is already assigned")
      return
    }

    // If setting as primary, unset other primaries
    const updatedAssignments = newAssignment.is_primary
      ? assignments.map(a => ({ ...a, is_primary: false }))
      : [...assignments]

    updatedAssignments.push(newAssignment)
    setAssignments(updatedAssignments)
    
    // Reset new assignment form
    setNewAssignment({
      airport_id: airports.length > 0 ? airports[0].id : "",
      is_primary: false,
      start_date: new Date().toISOString().split('T')[0]
    })
  }

  const removeAssignment = (airportId: string) => {
    setAssignments(assignments.filter(a => a.airport_id !== airportId))
  }

  const setPrimaryAssignment = (airportId: string) => {
    setAssignments(assignments.map(a => ({
      ...a,
      is_primary: a.airport_id === airportId
    })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // Update personnel data
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          employee_id: formData.employee_id || null,
          role: formData.role,
          date_of_birth: formData.date_of_birth || null,
          place_of_birth: formData.place_of_birth || null,
          nationality: formData.nationality || null,
          phone: formData.phone || null,
          is_active: formData.is_active,
          job_category_id: formData.job_category_id || null,
          needs_auth_setup: formData.needs_auth_setup,
          updated_at: new Date().toISOString()
        })
        .eq("id", personnelId)

      if (updateError) throw updateError

      // Update airport assignments
      // First, delete existing assignments
      const { error: deleteError } = await supabase
        .from("employee_airports")
        .delete()
        .eq("employee_id", personnelId)

      if (deleteError) throw deleteError

      // Then, insert new assignments
      if (assignments.length > 0) {
        const { error: insertError } = await supabase
          .from("employee_airports")
          .insert(
            assignments.map(a => ({
              employee_id: personnelId,
              airport_id: a.airport_id,
              is_primary: a.is_primary,
              start_date: a.start_date
            }))
          )

        if (insertError) throw insertError
      }

      toast.success("Personnel updated successfully!")
      router.push(`/dashboard/personnel/${personnelId}`)
      router.refresh()
    } catch (error: any) {
      console.error("Error updating personnel:", error)
      toast.error(`Failed to update personnel: ${error.message || "Please try again"}`)
    } finally {
      setLoading(false)
    }
  }

  const getAirportName = (airportId: string) => {
    const airport = airports.find(a => a.id === airportId)
    return airport ? `${airport.name} (${airport.code})` : "Unknown Airport"
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="job">Job Details</TabsTrigger>
          <TabsTrigger value="airports">Airports</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Basic personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                    placeholder="+1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nationality"
                      name="nationality"
                      value={formData.nationality || ""}
                      onChange={handleInputChange}
                      placeholder="e.g., ME"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="place_of_birth">Place of Birth</Label>
                  <Input
                    id="place_of_birth"
                    name="place_of_birth"
                    value={formData.place_of_birth || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job Details Tab */}
        <TabsContent value="job">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Information
              </CardTitle>
              <CardDescription>Employment details and role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="employee_id">Employee ID</Label>
                  <Input
                    id="employee_id"
                    name="employee_id"
                    value={formData.employee_id || ""}
                    onChange={handleInputChange}
                    placeholder="e.g., EMP001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => handleSelectChange("role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                      <SelectItem value="trainee">Trainee</SelectItem>
                      <SelectItem value="inspector">Inspector</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job_category_id">Job Category</Label>
                  <Select 
                    value={formData.job_category_id || "none"} 
                    onValueChange={(value) => handleSelectChange("job_category_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {jobCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name_en} ({category.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Airports Tab */}
        <TabsContent value="airports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Airport Assignments
              </CardTitle>
              <CardDescription>Assign airports to this personnel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Assignments */}
              <div className="space-y-3">
                <h3 className="font-medium">Current Assignments</h3>
                {assignments.length > 0 ? (
                  <div className="space-y-2">
                    {assignments.map((assignment) => (
                      <div key={assignment.airport_id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{getAirportName(assignment.airport_id)}</p>
                            <p className="text-sm text-muted-foreground">
                              Started: {formatDate(assignment.start_date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={assignment.is_primary ? "default" : "outline"}>
                            {assignment.is_primary ? "Primary" : "Secondary"}
                          </Badge>
                          <div className="flex gap-1">
                            {!assignment.is_primary && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setPrimaryAssignment(assignment.airport_id)}
                              >
                                Set Primary
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAssignment(assignment.airport_id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-lg">
                    <p className="text-muted-foreground">No airport assignments</p>
                  </div>
                )}
              </div>

              {/* Add New Assignment */}
              <div className="space-y-3">
                <h3 className="font-medium">Add New Assignment</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="airport">Airport</Label>
                    <Select 
                      value={newAssignment.airport_id} 
                      onValueChange={(value) => setNewAssignment(prev => ({ ...prev, airport_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select airport" />
                      </SelectTrigger>
                      <SelectContent>
                        {airports.length > 0 ? (
                          airports.map((airport) => (
                            <SelectItem key={airport.id} value={airport.id}>
                              {airport.name} ({airport.code})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-airports" disabled>
                            No airports available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={newAssignment.start_date}
                      onChange={(e) => setNewAssignment(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-8">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_primary"
                        checked={newAssignment.is_primary}
                        onCheckedChange={(checked) => setNewAssignment(prev => ({ ...prev, is_primary: checked }))}
                      />
                      <Label htmlFor="is_primary">Primary Airport</Label>
                    </div>
                    <Button 
                      type="button" 
                      onClick={addAssignment} 
                      className="ml-auto"
                      disabled={!newAssignment.airport_id || airports.length === 0}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Status Tab */}
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Status & Settings</CardTitle>
              <CardDescription>Account status and system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_active">Account Active</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable access to the system
                    </p>
                  </div>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleSwitchChange("is_active", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="needs_auth_setup">Needs Auth Setup</Label>
                    <p className="text-sm text-muted-foreground">
                      User needs to complete authentication setup
                    </p>
                  </div>
                  <Switch
                    id="needs_auth_setup"
                    checked={formData.needs_auth_setup}
                    onCheckedChange={(checked) => handleSwitchChange("needs_auth_setup", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/personnel/${personnelId}`)}
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