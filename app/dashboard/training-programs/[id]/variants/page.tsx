// app/dashboard/training-programs/[id]/variants/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Award, 
  RefreshCw, 
  Calendar, 
  Clock,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TestTube
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { 
  addTrainingProgramVariant, 
  updateTrainingProgramVariant,
  deleteTrainingProgramVariant 
} from "@/app/actions/training-programs"

interface TrainingVariant {
  id?: string
  variant_type: 'initial' | 'recurrent' | 'requalification' | 'extension' | 'refresher'
  variant_name: string
  description?: string
  theoretical_hours: number
  practical_hours: number
  ojt_hours: number
  total_hours: number
  validity_months: number
  is_active: boolean
}

export default function ProgramVariantsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> | { id: string } 
}) {
  const router = useRouter()
  const supabase = createClient()
  
  const [programId, setProgramId] = useState("")
  const [program, setProgram] = useState<any>(null)
  const [variants, setVariants] = useState<TrainingVariant[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null)
  
  // Form state for new/edit variant
  const [variantForm, setVariantForm] = useState<TrainingVariant>({
    variant_type: 'initial',
    variant_name: '',
    description: '',
    theoretical_hours: 0,
    practical_hours: 0,
    ojt_hours: 0,
    total_hours: 0,
    validity_months: 24,
    is_active: true
  })

  // Fetch program and variants
  useEffect(() => {
    const getParams = async () => {
      if (params && typeof params === 'object' && 'then' in params) {
        const resolvedParams = await params
        setProgramId(resolvedParams.id)
        fetchData(resolvedParams.id)
      } else {
        setProgramId((params as any).id)
        fetchData((params as any).id)
      }
    }
    
    getParams()
  }, [params])

  const fetchData = async (id: string) => {
    try {
      // Fetch program
      const { data: programData, error: programError } = await supabase
        .from("training_programs")
        .select("title, code, theoretical_hours, practical_hours, ojt_hours, validity_months")
        .eq("id", id)
        .single()

      if (programError) throw programError

      // Fetch variants using client-side supabase
      const { data: variantsData, error: variantsError } = await supabase
        .from("training_program_variants")
        .select("*")
        .eq("program_id", id)
        .order("variant_type")

      if (variantsError) throw variantsError

      setProgram(programData)
      setVariants(variantsData || [])
      
      // Reset form with program defaults
      if (programData) {
        setVariantForm(prev => ({
          ...prev,
          theoretical_hours: programData.theoretical_hours || 0,
          practical_hours: programData.practical_hours || 0,
          ojt_hours: programData.ojt_hours || 0,
          validity_months: programData.validity_months || 24,
          total_hours: (programData.theoretical_hours || 0) + (programData.practical_hours || 0) + (programData.ojt_hours || 0)
        }))
      }
    } catch (error: any) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load variants: " + (error.message || "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  const handleVariantInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const numericFields = ['theoretical_hours', 'practical_hours', 'ojt_hours', 'validity_months', 'total_hours']
    
    const newFormData = {
      ...variantForm,
      [name]: numericFields.includes(name) 
        ? (parseInt(value) || 0)
        : value
    }
    
    // Auto-calculate total hours if one of the hour fields changes
    if (name === 'theoretical_hours' || name === 'practical_hours' || name === 'ojt_hours') {
      const theoretical = name === 'theoretical_hours' ? parseInt(value) || 0 : variantForm.theoretical_hours
      const practical = name === 'practical_hours' ? parseInt(value) || 0 : variantForm.practical_hours
      const ojt = name === 'ojt_hours' ? parseInt(value) || 0 : variantForm.ojt_hours
      
      newFormData.total_hours = theoretical + practical + ojt
    }
    
    setVariantForm(newFormData)
  }

  const handleVariantSelectChange = (name: keyof TrainingVariant, value: string) => {
    setVariantForm(prev => ({
      ...prev,
      [name]: name === 'variant_type' ? value : parseInt(value) || 0
    }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setVariantForm(prev => ({
      ...prev,
      is_active: checked
    }))
  }

  const resetVariantForm = () => {
    setVariantForm({
      variant_type: 'initial',
      variant_name: '',
      description: '',
      theoretical_hours: program?.theoretical_hours || 0,
      practical_hours: program?.practical_hours || 0,
      ojt_hours: program?.ojt_hours || 0,
      total_hours: (program?.theoretical_hours || 0) + (program?.practical_hours || 0) + (program?.ojt_hours || 0),
      validity_months: program?.validity_months || 24,
      is_active: true
    })
    setEditingVariantId(null)
  }

  // NOVO: Sa server akcijama
  const handleAddVariant = async () => {
    if (!variantForm.variant_name.trim()) {
      toast.error("Variant name is required")
      return
    }

    setSaving(true)
    
    try {
      // Create FormData object for server action
      const formData = new FormData()
      formData.append("program_id", programId)
      formData.append("variant_type", variantForm.variant_type)
      formData.append("variant_name", variantForm.variant_name)
      formData.append("description", variantForm.description || "")
      formData.append("theoretical_hours", variantForm.theoretical_hours.toString())
      formData.append("practical_hours", variantForm.practical_hours.toString())
      formData.append("ojt_hours", variantForm.ojt_hours.toString())
      formData.append("validity_months", variantForm.validity_months.toString())
      formData.append("is_active", variantForm.is_active.toString())

      let result
      
      if (editingVariantId) {
        // Update existing variant
        formData.append("variant_id", editingVariantId)
        result = await updateTrainingProgramVariant(formData)
      } else {
        // Create new variant
        result = await addTrainingProgramVariant(formData)
      }

      if (!result.success) {
        throw new Error(result.error || "Failed to save variant")
      }

      toast.success(result.message || (editingVariantId ? "Variant updated successfully" : "Variant added successfully"))
      
      // Refresh data
      await fetchData(programId)
      resetVariantForm()
      
    } catch (error: any) {
      console.error("Error saving variant:", error)
      toast.error(error.message || "Failed to save variant")
    } finally {
      setSaving(false)
    }
  }

  // NOVO: Sa server akcijom
  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm("Are you sure you want to delete this variant?")) return

    try {
      const result = await deleteTrainingProgramVariant(variantId)
      
      if (!result.success) {
        throw new Error(result.error || "Failed to delete variant")
      }

      toast.success(result.message || "Variant deleted successfully")
      
      // Refresh data
      await fetchData(programId)
      
    } catch (error: any) {
      console.error("Error deleting variant:", error)
      toast.error(error.message || "Failed to delete variant")
    }
  }

  // NOVO: Test funkcija za debug
  const testVariantCreation = async () => {
    console.log("Testing variant creation...")
    
    const testFormData = new FormData()
    testFormData.append("program_id", programId)
    testFormData.append("variant_type", "initial")
    testFormData.append("variant_name", "Test Variant " + new Date().getTime())
    testFormData.append("description", "This is a test variant")
    testFormData.append("theoretical_hours", "10")
    testFormData.append("practical_hours", "5")
    testFormData.append("ojt_hours", "3")
    testFormData.append("validity_months", "24")
    testFormData.append("is_active", "true")
    
    console.log("Test form data:")
    for (const [key, value] of testFormData.entries()) {
      console.log(`${key}: ${value}`)
    }
    
    const result = await addTrainingProgramVariant(testFormData)
    console.log("Test result:", result)
    
    if (result.success) {
      toast.success("Test variant created successfully")
      await fetchData(programId)
    } else {
      toast.error(`Test failed: ${result.error}`)
    }
  }

  const handleEditVariant = (variant: TrainingVariant) => {
    if (!variant.id) return
    
    setVariantForm({
      variant_type: variant.variant_type,
      variant_name: variant.variant_name,
      description: variant.description || '',
      theoretical_hours: variant.theoretical_hours,
      practical_hours: variant.practical_hours,
      ojt_hours: variant.ojt_hours,
      total_hours: variant.total_hours,
      validity_months: variant.validity_months,
      is_active: variant.is_active
    })
    setEditingVariantId(variant.id)
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
      'initial': 'bg-blue-100 text-blue-800 border-blue-200',
      'recurrent': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'requalification': 'bg-amber-100 text-amber-800 border-amber-200',
      'extension': 'bg-purple-100 text-purple-800 border-purple-200',
      'refresher': 'bg-cyan-100 text-cyan-800 border-cyan-200'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getVariantTypeIcon = (type: string) => {
    switch(type) {
      case 'initial': return <Award className="h-4 w-4" />
      case 'recurrent': return <RefreshCw className="h-4 w-4" />
      case 'requalification': return <Award className="h-4 w-4" />
      case 'extension': return <Calendar className="h-4 w-4" />
      case 'refresher': return <RefreshCw className="h-4 w-4" />
      default: return <Award className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
          Back to Program
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Variants</h1>
            <Badge variant="outline" className="font-mono">
              {program?.code}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            {program?.title}
            <Badge variant="outline">
              {variants.length} variant{variants.length !== 1 ? 's' : ''}
            </Badge>
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline"
            size="sm"
            onClick={testVariantCreation}
            className="flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            Test Variant
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push(`/dashboard/training-programs/${programId}`)}
          >
            View Program
          </Button>
        </div>
      </div>

      {/* Main Content - Two Columns */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column - Existing Variants */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Existing Variants</h2>
            <Badge variant="outline">
              {variants.length} variant{variants.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {variants.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No variants defined</h3>
                <p className="text-muted-foreground mb-4">
                  Add variants for different training types like initial certification, renewal, etc.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {variants.map((variant) => (
                <Card key={variant.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getVariantTypeColor(variant.variant_type).split(' ')[0]}`}>
                            {getVariantTypeIcon(variant.variant_type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{variant.variant_name}</h3>
                              <Badge className={getVariantTypeColor(variant.variant_type)}>
                                {getVariantTypeLabel(variant.variant_type)}
                              </Badge>
                              {variant.is_active ? (
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-muted text-muted-foreground">
                                  <XCircle className="mr-1 h-3 w-3" />
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            {variant.description && (
                              <p className="text-sm text-muted-foreground mt-1">{variant.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Theoretical</Label>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">{variant.theoretical_hours}h</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Practical</Label>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-emerald-600" />
                              <span className="font-medium">{variant.practical_hours}h</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">OJT</Label>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-amber-600" />
                              <span className="font-medium">{variant.ojt_hours}h</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Validity</Label>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-purple-600" />
                              <span className="font-medium">{variant.validity_months}m</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm text-muted-foreground">
                            Total: {variant.total_hours}h
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditVariant(variant)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/20 hover:bg-destructive/10"
                          onClick={() => handleDeleteVariant(variant.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Add/Edit Variant Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {editingVariantId ? 'Edit Variant' : 'Add New Variant'}
            </CardTitle>
            <CardDescription>
              {editingVariantId 
                ? 'Update variant details' 
                : 'Create a new variant for different training types'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="variant_name">
                Variant Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="variant_name"
                name="variant_name"
                value={variantForm.variant_name}
                onChange={handleVariantInputChange}
                placeholder="e.g., Initial Certification, Renewal Course"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="variant_type">Variant Type</Label>
                <Select
                  value={variantForm.variant_type}
                  onValueChange={(value: any) => handleVariantSelectChange('variant_type', value)}
                >
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label htmlFor="validity_months">Validity (Months)</Label>
                <Input
                  id="validity_months"
                  name="validity_months"
                  type="number"
                  min="1"
                  max="60"
                  value={variantForm.validity_months}
                  onChange={handleVariantInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={variantForm.description}
                onChange={handleVariantInputChange}
                placeholder="Describe this variant and its purpose..."
                rows={3}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Training Hours</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="theoretical_hours">Theoretical</Label>
                  <Input
                    id="theoretical_hours"
                    name="theoretical_hours"
                    type="number"
                    min="0"
                    value={variantForm.theoretical_hours}
                    onChange={handleVariantInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="practical_hours">Practical</Label>
                  <Input
                    id="practical_hours"
                    name="practical_hours"
                    type="number"
                    min="0"
                    value={variantForm.practical_hours}
                    onChange={handleVariantInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ojt_hours">OJT</Label>
                  <Input
                    id="ojt_hours"
                    name="ojt_hours"
                    type="number"
                    min="0"
                    value={variantForm.ojt_hours}
                    onChange={handleVariantInputChange}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Total Hours:</span>
                <span className="text-lg font-bold">{variantForm.total_hours}h</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Variant Status</Label>
                <p className="text-sm text-muted-foreground">
                  {variantForm.is_active ? 'Active - Available for scheduling' : 'Inactive - Not available'}
                </p>
              </div>
              <Switch
                id="is_active"
                checked={variantForm.is_active}
                onCheckedChange={handleSwitchChange}
              />
            </div>

            <div className="flex gap-2 pt-4">
              {editingVariantId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetVariantForm}
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel Edit
                </Button>
              )}
              <Button
                type="button"
                onClick={handleAddVariant}
                disabled={saving || !variantForm.variant_name.trim()}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {editingVariantId ? 'Update Variant' : 'Add Variant'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-medium text-blue-900">Recommended Variants</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Initial</strong>: Full training for new certification</li>
                <li>• <strong>Recurrent</strong>: Shorter training for renewal (50% of initial hours)</li>
                <li>• <strong>Requalification</strong>: For expired certificates (70% of initial hours)</li>
                <li>• <strong>Extension</strong>: Additional training for new equipment/procedures</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <TestTube className="h-5 w-5 text-slate-600 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-medium text-slate-900">Debug Information</h3>
              <div className="text-sm text-slate-700 space-y-1">
                <p><strong>Program ID:</strong> {programId}</p>
                <p><strong>Program Title:</strong> {program?.title}</p>
                <p><strong>Variants Count:</strong> {variants.length}</p>
                <p><strong>Editing Variant:</strong> {editingVariantId || 'None'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}