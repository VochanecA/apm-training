// app/dashboard/certificates/[id]/page.tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Calendar, 
  User, 
  Building2, 
  GraduationCap, 
  Download,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { CertificateActions } from "@/components/certificate-actions"
import { getCertificateDetails } from "@/app/actions/certificates"

interface PageProps {
  params: {
    id: string
  }
}

export default async function CertificateDetailPage({ params }: PageProps) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch certificate details using server action
  const result = await getCertificateDetails(params.id)
  
  if (!result.success || !result.certificate) {
    redirect("/dashboard/certificates")
  }

  const certificate = result.certificate

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "expired":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      case "suspended":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const isExpiringSoon = (expiryDate: string) => {
    const daysUntilExpiry = Math.floor(
      (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysUntilExpiry <= 90 && daysUntilExpiry >= 0
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/dashboard/certificates">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Certificates
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Certificate Details</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Certificate #{certificate.certificate_number}
          </p>
        </div>
        
        <CertificateActions
          certificateId={certificate.id}
          trainingId={certificate.training_id}
          certificateNumber={certificate.certificate_number}
          hasPDF={!!certificate.pdf_url}
          pdfUrl={certificate.pdf_url || undefined}
        />
      </div>

      {/* Certificate Status Banner */}
      {isExpiringSoon(certificate.expiry_date) && certificate.status === "valid" && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <p className="text-sm font-medium text-amber-700">
                This certificate expires in less than 90 days. Please plan for renewal.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Certificate Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Certificate Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Certificate Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {certificate.training?.training_program?.title || "Training Certificate"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {certificate.training?.training_program?.code || "N/A"}
                    </p>
                  </div>
                  <Badge className={getStatusColor(certificate.status)}>
                    {certificate.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Issue Date</p>
                        <p className="font-medium">{formatDate(certificate.issue_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Expiry Date</p>
                        <p className="font-medium">{formatDate(certificate.expiry_date)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Issuing Airport</p>
                        <p className="font-medium">
                          {certificate.airports?.name} ({certificate.airports?.code})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Job Category</p>
                        <p className="font-medium">
                          {certificate.job_categories?.name_en || certificate.job_categories?.name_me} 
                          ({certificate.job_categories?.code})
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {certificate.notes && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="mt-1">{certificate.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Trainee Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Trainee Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium text-lg">
                        {certificate.trainee?.full_name}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Employee ID</p>
                        <p className="font-medium">{certificate.trainee?.employee_id || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Nationality</p>
                        <p className="font-medium">{certificate.trainee?.nationality || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/personnel/${certificate.trainee_id}`}>
                      View Profile
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Training Details */}
          {certificate.training && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Training Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Training Period</p>
                      <p className="font-medium">
                        {formatDate(certificate.training.start_date)} -{" "}
                        {certificate.training.end_date 
                          ? formatDate(certificate.training.end_date)
                          : "Ongoing"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Hours</p>
                      <p className="font-medium">
                        {certificate.training.training_program?.total_hours || 0} hours
                      </p>
                    </div>
                  </div>
                  
                  {certificate.training.instructor && (
                    <div>
                      <p className="text-sm text-muted-foreground">Instructor</p>
                      <p className="font-medium">
                        {certificate.training.instructor.full_name}
                      </p>
                    </div>
                  )}

                  {certificate.training.training_program?.description && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="mt-1">{certificate.training.training_program.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Actions & Status */}
        <div className="space-y-6">
          {/* Certificate Status */}
          <Card>
            <CardHeader>
              <CardTitle>Certificate Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={getStatusColor(certificate.status)}>
                    {certificate.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Validity Period</span>
                  <span className="font-medium">
                    {Math.floor(
                      (new Date(certificate.expiry_date).getTime() - new Date(certificate.issue_date).getTime()) 
                      / (1000 * 60 * 60 * 24 * 30)
                    )} months
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Days Remaining</span>
                  <span className="font-medium">
                    {Math.floor(
                      (new Date(certificate.expiry_date).getTime() - new Date().getTime()) 
                      / (1000 * 60 * 60 * 24)
                    )}
                  </span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Issued</span>
                  <span>Expires</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary"
                    style={{
                      width: `${Math.min(
                        ((new Date().getTime() - new Date(certificate.issue_date).getTime()) 
                        / (new Date(certificate.expiry_date).getTime() - new Date(certificate.issue_date).getTime())) 
                        * 100, 100
                      )}%`
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Examination Results */}
          {(certificate.theoretical_exam || certificate.practical_exam) && (
            <Card>
              <CardHeader>
                <CardTitle>Examination Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {certificate.theoretical_exam && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Theoretical Exam</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {certificate.theoretical_exam.score}/{certificate.theoretical_exam.max_score}
                      </span>
                      {certificate.theoretical_exam.passed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                )}
                {certificate.practical_exam && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Practical Exam</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {certificate.practical_exam.score}/{certificate.practical_exam.max_score}
                      </span>
                      {certificate.practical_exam.passed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download Certificate
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Renew Certificate
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <AlertCircle className="mr-2 h-4 w-4" />
                Report Issue
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Clock className="mr-2 h-4 w-4" />
                View History
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}