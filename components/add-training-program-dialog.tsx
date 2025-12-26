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
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  User, 
  Users,
  Award,
  RefreshCw,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
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

interface TrainingVariant {
  variant_type: 'initial' | 'recurrent' | 'requalification' | 'extension' | 'refresher'
  variant_name: string
  description?: string
  theoretical_hours: number
  practical_hours: number
  ojt_hours: number
  validity_months: number
  is_active: boolean
}

export function AddTrainingProgramDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [jobCategories, setJobCategories] = useState<JobCategory[]>([])
  const [personnel, setPersonnel] = useState<Profile[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingPersonnel, setLoadingPersonnel] = useState(false)
  
  // State za varijante
  const [showVariants, setShowVariants] = useState(false)
  const [variants, setVariants] = useState<TrainingVariant[]>([
    {
      variant_type: 'initial',
      variant_name: 'Sticanje sertifikata',
      description: 'Početno sticanje sertifikata',
      theoretical_hours: 0,
      practical_hours: 0,
      ojt_hours: 0,
      validity_months: 24,
      is_active: true
    }
  ])

  const [formData, setFormData] = useState({
    title: "",
    code: "",
    job_category_id: "no-category",
    primary_instructor_id: "no-instructor",
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
        primary_instructor_id: "no-instructor",
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
      // Reset varijante
      setVariants([
        {
          variant_type: 'initial',
          variant_name: 'Sticanje sertifikata',
          description: 'Početno sticanje sertifikata',
          theoretical_hours: 0,
          practical_hours: 0,
          ojt_hours: 0,
          validity_months: 24,
          is_active: true
        }
      ])
      setShowVariants(false)
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

  // Funkcije za upravljanje varijantama
  const addVariant = () => {
    const newVariant: TrainingVariant = {
      variant_type: 'recurrent',
      variant_name: '',
      theoretical_hours: 0,
      practical_hours: 0,
      ojt_hours: 0,
      validity_months: parseInt(formData.validity_months) || 24,
      is_active: true
    }
    setVariants([...variants, newVariant])
  }

  const removeVariant = (index: number) => {
    if (variants.length === 1) {
      toast.error("Morate imati barem jednu varijantu")
      return
    }
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: keyof TrainingVariant, value: any) => {
    const updatedVariants = [...variants]
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value
    }
    setVariants(updatedVariants)
  }

  const getVariantTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'initial': 'Sticanje',
      'recurrent': 'Obnavljanje',
      'requalification': 'Ponovna kvalifikacija',
      'extension': 'Produženje',
      'refresher': 'Osvežavajući'
    }
    return labels[type] || type
  }

  const getVariantTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'initial': 'bg-blue-100 text-blue-800',
      'recurrent': 'bg-emerald-100 text-emerald-800',
      'requalification': 'bg-amber-100 text-amber-800',
      'extension': 'bg-purple-100 text-purple-800',
      'refresher': 'bg-cyan-100 text-cyan-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      // Prvo kreiraj glavni program
      const submitFormData = new FormData()
      
      // Add all form values
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          submitFormData.append(key, value.toString())
        }
      })

      const result = await addTrainingProgram(submitFormData)
      
      if (result.success && result.programId) {
        // Sada kreiraj varijante
        const createdProgramId = result.programId
        
        for (const variant of variants) {
          const { error: variantError } = await supabase
            .from('training_program_variants')
            .insert({
              program_id: createdProgramId,
              variant_type: variant.variant_type,
              variant_name: variant.variant_name || `${formData.title} - ${getVariantTypeLabel(variant.variant_type)}`,
              description: variant.description,
              theoretical_hours: variant.theoretical_hours,
              practical_hours: variant.practical_hours,
              ojt_hours: variant.ojt_hours,
              total_hours: variant.theoretical_hours + variant.practical_hours + variant.ojt_hours,
              validity_months: variant.validity_months,
              is_active: variant.is_active
            })
          
          if (variantError) {
            console.error("Error creating variant:", variantError)
            toast.error(`Greška pri kreiranju varijante ${variant.variant_type}`)
          }
        }
        
        toast.success("Training program sa varijantama uspješno kreiran!")
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

  // Preporučene konfiguracije za varijante
  const suggestedVariants = [
    {
      type: 'initial' as const,
      name: 'Sticanje sertifikata',
      description: 'Početno sticanje sertifikata',
      theoretical_hours: parseInt(formData.theoretical_hours) || 0,
      practical_hours: parseInt(formData.practical_hours) || 0,
      ojt_hours: parseInt(formData.ojt_hours) || 0,
      validity_months: parseInt(formData.validity_months) || 24
    },
    {
      type: 'recurrent' as const,
      name: 'Obnavljanje sertifikata',
      description: 'Redovno obnavljanje sertifikata',
      theoretical_hours: Math.max(0, Math.floor((parseInt(formData.theoretical_hours) || 0) * 0.5)),
      practical_hours: Math.max(0, Math.floor((parseInt(formData.practical_hours) || 0) * 0.5)),
      ojt_hours: Math.max(0, Math.floor((parseInt(formData.ojt_hours) || 0) * 0.3)),
      validity_months: parseInt(formData.validity_months) || 24
    },
    {
      type: 'requalification' as const,
      name: 'Ponovna kvalifikacija',
      description: 'Ponovna kvalifikacija nakon isteka sertifikata',
      theoretical_hours: Math.max(0, Math.floor((parseInt(formData.theoretical_hours) || 0) * 0.7)),
      practical_hours: Math.max(0, Math.floor((parseInt(formData.practical_hours) || 0) * 0.7)),
      ojt_hours: Math.max(0, Math.floor((parseInt(formData.ojt_hours) || 0) * 0.5)),
      validity_months: parseInt(formData.validity_months) || 24
    }
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Program
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px] lg:max-w-[700px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Training Program</DialogTitle>
            <DialogDescription>
              Define a new training program with its variants for different certification types
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Osnovne informacije o programu */}
            <div className="space-y-4">
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

              {/* Primary Instructor */}
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
                    <SelectItem value="no-instructor">No instructor assigned</SelectItem>
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
                  <Label htmlFor="theoretical_hours">Theoretical Hours (Osnovni)</Label>
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
                  <Label htmlFor="practical_hours">Practical Hours (Osnovni)</Label>
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
                  <Label htmlFor="ojt_hours">OJT Hours (Osnovni)</Label>
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
                  Certificate Validity Period (Osnovni)
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
            </div>

            {/* Sekcija za varijante */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Program Variants
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Define different variants for initial certification, renewal, etc.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVariants(!showVariants)}
                >
                  {showVariants ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {showVariants ? "Hide" : "Show"} Variants
                </Button>
              </div>

              {showVariants && (
                <div className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <p className="text-sm font-medium">Preporučene varijante</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Sistem će automatski predložiti varijante na osnovu osnovnog programa. Možete ih prilagoditi.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedVariants.map((suggested, index) => (
                        <Button
                          key={suggested.type}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            const existingIndex = variants.findIndex(v => v.variant_type === suggested.type)
                            if (existingIndex >= 0) {
                              updateVariant(existingIndex, 'theoretical_hours', suggested.theoretical_hours)
                              updateVariant(existingIndex, 'practical_hours', suggested.practical_hours)
                              updateVariant(existingIndex, 'ojt_hours', suggested.ojt_hours)
                              updateVariant(existingIndex, 'validity_months', suggested.validity_months)
                            } else {
                              setVariants([...variants, {
                                variant_type: suggested.type,
                                variant_name: suggested.name,
                                description: suggested.description,
                                theoretical_hours: suggested.theoretical_hours,
                                practical_hours: suggested.practical_hours,
                                ojt_hours: suggested.ojt_hours,
                                validity_months: suggested.validity_months,
                                is_active: true
                              }])
                            }
                          }}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {getVariantTypeLabel(suggested.type)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Lista varijanti */}
                  <div className="space-y-3">
                    {variants.map((variant, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={getVariantTypeColor(variant.variant_type)}>
                              {getVariantTypeLabel(variant.variant_type)}
                            </Badge>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={variant.is_active}
                                onCheckedChange={(checked) => updateVariant(index, 'is_active', checked)}
                              
                              />
                              <span className="text-xs text-muted-foreground">
                                {variant.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          {variants.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                      
                              onClick={() => removeVariant(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid gap-3">
                          <div className="grid gap-2">
                            <Label className="text-xs">Variant Name</Label>
                            <Input
                              value={variant.variant_name}
                              onChange={(e) => updateVariant(index, 'variant_name', e.target.value)}
                              placeholder={`e.g., ${formData.title} - ${getVariantTypeLabel(variant.variant_type)}`}
                              className="text-sm"
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label className="text-xs">Variant Type</Label>
                            <Select
                              value={variant.variant_type}
                              onValueChange={(value: any) => updateVariant(index, 'variant_type', value)}
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="initial">
                                  <div className="flex items-center gap-2">
                                    <Award className="h-4 w-4 text-blue-600" />
                                    <span>Initial - Sticanje</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="recurrent">
                                  <div className="flex items-center gap-2">
                                    <RefreshCw className="h-4 w-4 text-emerald-600" />
                                    <span>Recurrent - Obnavljanje</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="requalification">
                                  <div className="flex items-center gap-2">
                                    <Award className="h-4 w-4 text-amber-600" />
                                    <span>Requalification - Ponovna kvalifikacija</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="extension">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-purple-600" />
                                    <span>Extension - Produženje</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="refresher">
                                  <div className="flex items-center gap-2">
                                    <RefreshCw className="h-4 w-4 text-cyan-600" />
                                    <span>Refresher - Osvežavajući</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-2">
                            <Label className="text-xs">Description (Optional)</Label>
                            <Textarea
                              value={variant.description || ''}
                              onChange={(e) => updateVariant(index, 'description', e.target.value)}
                              placeholder="Describe this variant..."
                              rows={2}
                              className="text-sm"
                            />
                          </div>

                          <div className="grid grid-cols-4 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Theoretical</Label>
                              <Input
                                type="number"
                                min="0"
                                value={variant.theoretical_hours}
                                onChange={(e) => updateVariant(index, 'theoretical_hours', parseInt(e.target.value) || 0)}
                                className="text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Practical</Label>
                              <Input
                                type="number"
                                min="0"
                                value={variant.practical_hours}
                                onChange={(e) => updateVariant(index, 'practical_hours', parseInt(e.target.value) || 0)}
                                className="text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">OJT</Label>
                              <Input
                                type="number"
                                min="0"
                                value={variant.ojt_hours}
                                onChange={(e) => updateVariant(index, 'ojt_hours', parseInt(e.target.value) || 0)}
                                className="text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Validity (months)</Label>
                              <Input
                                type="number"
                                min="1"
                                max="60"
                                value={variant.validity_months}
                                onChange={(e) => updateVariant(index, 'validity_months', parseInt(e.target.value) || 24)}
                                className="text-sm"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-xs text-muted-foreground">
                              Total hours: {variant.theoretical_hours + variant.practical_hours + variant.ojt_hours}h
                            </span>
                            <span className="text-xs font-medium">
                              Valid for: {variant.validity_months} months
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addVariant}
                    className="w-full border-dashed"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Variant
                  </Button>
                </div>
              )}
            </div>

            {/* Approval Information */}
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
                  Create Program with Variants
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}