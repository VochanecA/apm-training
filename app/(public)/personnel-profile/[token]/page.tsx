import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  User, 
  Mail, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Clock,
  Calendar,
  Building2,
  Shield,
  CheckCircle,
  XCircle,
  ArrowRight,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { format, isAfter, parseISO } from "date-fns"

interface QRProfilePageProps {
  params: Promise<{
    token: string
  }>
}

export default async function QRProfilePage({ params }: QRProfilePageProps) {
  try {
    console.log("=== QR PROFILE PAGE START ===")
    
    const supabase = await createClient()
    const { token } = await params
    
    console.log("Token from params:", token)
    
    // Pronađi osoblje po QR tokenu
    const { data: personnel, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("qr_code_token", token)
   
      .single()

    console.log("Personnel query result:", { personnel, error })

    if (error || !personnel) {
      console.log("Personnel not found or error:", error?.message)
      
      // Proveri da li token uopšte postoji u bazi
      const { data: allTokens } = await supabase
        .from("profiles")
        .select("qr_code_token, full_name")
        .not("qr_code_token", "is", null)
      
      console.log("All QR tokens in database:", allTokens)
      
      // Vrati 404 stranicu umesto notFound()
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md p-8">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
            <p className="text-gray-600 mb-6">
              The QR code you scanned is invalid or has expired.
              Please check the QR code and try again.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Token: {token.substring(0, 20)}...
              </p>
              <Button asChild variant="outline">
                <Link href="/">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Return to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )
    }

    // Ažuriraj vreme poslednjeg pristupa
    await supabase
      .from("profiles")
      .update({ qr_code_last_accessed: new Date().toISOString() })
      .eq("id", personnel.id)

    console.log("Personnel found:", personnel.full_name)

    // Dohvati osnovne podatke
    const [
      certificatesData,
      trainingsData,
      jobCategoryData,
      airportsData
    ] = await Promise.all([
      supabase
        .from("certificates")
        .select(`
          *,
          job_categories!certificates_job_category_id_fkey(name_en, code),
          airports!certificates_airport_id_fkey(name, code)
        `)
        .eq("trainee_id", personnel.id)
        .order("issue_date", { ascending: false }),
      
      supabase
        .from("trainings")
        .select(`
          *,
          training_programs!trainings_program_id_fkey(title, code),
          airports!trainings_airport_id_fkey(name, code)
        `)
        .eq("trainee_id", personnel.id)
        .order("start_date", { ascending: false })
        .limit(5),
      
      personnel.job_category_id ? 
        supabase
          .from("job_categories")
          .select("name_en, code")
          .eq("id", personnel.job_category_id)
          .single() :
        Promise.resolve({ data: null, error: null }),
      
      supabase
        .from("employee_airports")
        .select("airports!inner(name, code), is_primary")
        .eq("employee_id", personnel.id)
    ])

    // Helper funkcije
    const formatDate = (dateString: string | null) => {
      if (!dateString) return "N/A"
      try {
        return format(new Date(dateString), "dd/MM/yyyy")
      } catch {
        return "Invalid date"
      }
    }

    const isCertificateValid = (expiryDate: string) => {
      return isAfter(parseISO(expiryDate), new Date())
    }

    const certificates = certificatesData.data || []
    const trainings = trainingsData.data || []
    const jobCategory = jobCategoryData.data
    const airports = airportsData.data || []

    // Broj validnih sertifikata
    const validCertificates = certificates.filter(c => 
      isCertificateValid(c.expiry_date) && c.status === 'valid'
    ).length

    console.log("=== QR PROFILE PAGE RENDERING ===")

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Personnel Training Profile</h1>
            <p className="text-muted-foreground mt-2">
              This information is publicly accessible via QR code
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Token: {token.substring(0, 8)}...
            </p>
          </div>

          {/* Basic Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personnel Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{personnel.full_name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{personnel.role}</Badge>
                      {personnel.is_active && (
                        <Badge className="bg-green-500/10 text-green-600">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Last accessed</p>
                    <p className="text-sm font-medium">
                      {personnel.qr_code_last_accessed 
                        ? formatDate(personnel.qr_code_last_accessed)
                        : 'Never'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{personnel.email}</span>
                    </div>
                    {personnel.phone && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{personnel.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {jobCategory && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {jobCategory.name_en} ({jobCategory.code})
                        </span>
                      </div>
                    )}
                    {airports.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {airports.map((a: any) => a.airports?.name).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{certificates.length}</div>
                <p className="text-xs text-muted-foreground">
                  {validCertificates} currently valid
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Trainings Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{trainings.length}</div>
                <p className="text-xs text-muted-foreground">
                  {trainings.filter(t => t.status === 'completed').length} finished
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Member Since</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{formatDate(personnel.created_at)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(personnel.updated_at)} last updated
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Certificates Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Certificates
                {validCertificates > 0 && (
                  <Badge className="ml-2 bg-green-500/10 text-green-600">
                    {validCertificates} valid
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {certificates.length > 0 ? (
                <div className="space-y-3">
                  {certificates.slice(0, 5).map((cert) => {
                    const isValid = isCertificateValid(cert.expiry_date) && cert.status === 'valid'
                    
                    return (
                      <div key={cert.id} className={`p-3 rounded-lg border ${isValid ? 'border-green-200' : 'border-red-200'}`}>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">
                                {cert.job_categories?.name_en}
                              </h3>
                              <Badge variant={isValid ? "default" : "destructive"}>
                                {cert.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                Issued: {formatDate(cert.issue_date)} • Expires: {formatDate(cert.expiry_date)}
                              </div>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-3 w-3" />
                                {cert.airports?.name} • {cert.certificate_number}
                              </div>
                            </div>
                          </div>
                          {isValid ? 
                            <CheckCircle className="h-5 w-5 text-green-500" /> : 
                            <XCircle className="h-5 w-5 text-red-500" />
                          }
                        </div>
                      </div>
                    )
                  })}
                  
                  {certificates.length > 5 && (
                    <div className="text-center pt-2">
                      <p className="text-sm text-muted-foreground">
                        ...and {certificates.length - 5} more certificates
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <p className="mt-2 text-muted-foreground">No certificates found</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Trainings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Recent Trainings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trainings.length > 0 ? (
                <div className="space-y-3">
                  {trainings.map((training) => (
                    <div key={training.id} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{training.training_programs?.title}</h3>
                          <div className="text-sm text-muted-foreground space-y-1 mt-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              {formatDate(training.start_date)} - {formatDate(training.end_date) || 'Ongoing'}
                            </div>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-3 w-3" />
                              {training.airports?.name} • {training.training_programs?.code}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline">{training.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <p className="mt-2 text-muted-foreground">No training records</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Airport Training Management System • Tivat Airport Training Center
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              This profile was accessed via QR code on {formatDate(new Date().toISOString())}
            </p>
            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Visit Main Website
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error: any) {
    console.error("Error in QRProfilePage:", error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
          <h2 className="text-xl font-bold mt-4">Error Loading Profile</h2>
          <p className="text-muted-foreground mt-2">
            {error.message}
          </p>
        </div>
      </div>
    )
  }
}