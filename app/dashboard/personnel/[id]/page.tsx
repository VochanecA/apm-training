import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  Building2, 
  User, 
  Shield,
  ArrowLeft,
  Edit,
  Download,
  GraduationCap,
  FileText,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { format, isAfter, parseISO } from "date-fns"

interface PersonnelProfilePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PersonnelProfilePage({ params }: PersonnelProfilePageProps) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Unwrap params promise
  const { id } = await params

  // Fetch personnel data
  const { data: personnel, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !personnel) {
    console.error("Error fetching personnel:", error)
    redirect("/dashboard/personnel")
  }

  // Fetch all related data in parallel
  const [
    jobCategoriesData,
    airportsData,
    trainingsData,
    certificatesData,
    examinationsData,
    skillChecksData,
    moduleCompletionsData
  ] = await Promise.all([
    personnel.job_category_id 
      ? supabase
          .from("job_categories")
          .select("name_en, name_me, code")
          .eq("id", personnel.job_category_id)
          .single()
      : Promise.resolve({ data: null, error: null }),
    
    supabase
      .from("employee_airports")
      .select(`
        airport_id,
        is_primary,
        start_date,
        airports!inner(name, code, location)
      `)
      .eq("employee_id", id),
    
    // Fetch trainings with program details
    supabase
      .from("trainings")
      .select(`
        *,
        training_programs!trainings_program_id_fkey(title, code),
        airports!trainings_airport_id_fkey(name, code),
        instructor:profiles!trainings_instructor_id_fkey(full_name)
      `)
      .eq("trainee_id", id)
      .order("start_date", { ascending: false }),
    
    // Fetch certificates with related data
    supabase
      .from("certificates")
      .select(`
        *,
        job_categories!certificates_job_category_id_fkey(name_en, name_me, code),
        airports!certificates_airport_id_fkey(name, code),
        training:trainings!certificates_training_id_fkey(id, start_date),
        theoretical_exam:examinations!certificates_theoretical_exam_id_fkey(score, passed),
        practical_exam:examinations!certificates_practical_exam_id_fkey(score, passed)
      `)
      .eq("trainee_id", id)
      .order("issue_date", { ascending: false }),
    
    // Fetch examinations
    supabase
      .from("examinations")
      .select(`
        *,
        exam_commissions!examinations_commission_id_fkey(name),
        airports!examinations_airport_id_fkey(name, code),
        training:trainings!examinations_training_id_fkey(
          id,
          training_programs!trainings_program_id_fkey(title, code)
        )
      `)
      .eq("training.trainee_id", id)
      .order("exam_date", { ascending: false }),
    
    // Fetch skill checks
    supabase
      .from("skill_checks")
      .select(`
        *,
        certificates!skill_checks_certificate_id_fkey(certificate_number),
        airports!skill_checks_airport_id_fkey(name, code),
        examiner:profiles!skill_checks_examiner_id_fkey(full_name)
      `)
      .eq("trainee_id", id)
      .order("check_date", { ascending: false }),
    
    // Fetch module completions
    supabase
      .from("module_completions")
      .select(`
        *,
        training:trainings!module_completions_training_id_fkey(id),
        training_modules!module_completions_module_id_fkey(title, module_type),
        instructor:profiles!module_completions_instructor_id_fkey(full_name)
      `)
      .eq("training.trainee_id", id)
      .order("completed_date", { ascending: false })
  ])

  // Helper functions
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'valid':
      case 'passed':
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case 'in_progress':
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case 'scheduled':
        return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      case 'failed':
      case 'expired':
      case 'revoked':
      case 'suspended':
        return "bg-red-500/10 text-red-600 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Process data
  const jobCategory = jobCategoriesData.data
  const assignedAirports = airportsData.data || []
  const trainings = trainingsData.data || []
  const certificates = certificatesData.data || []
  const examinations = examinationsData.data || []
  const skillChecks = skillChecksData.data || []
  const moduleCompletions = moduleCompletionsData.data || []

  // Sort certificates: valid first, then by expiry date
  const sortedCertificates = [...certificates].sort((a, b) => {
    const aValid = isCertificateValid(a.expiry_date)
    const bValid = isCertificateValid(b.expiry_date)
    
    if (aValid && !bValid) return -1
    if (!aValid && bValid) return 1
    return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
  })

  // Statistics
  const stats = {
    totalTrainings: trainings.length,
    activeTrainings: trainings.filter(t => t.status === 'in_progress').length,
    completedTrainings: trainings.filter(t => t.status === 'completed').length,
    totalCertificates: certificates.length,
    validCertificates: certificates.filter(c => isCertificateValid(c.expiry_date) && c.status === 'valid').length,
    expiringCertificates: certificates.filter(c => {
      const expiryDate = parseISO(c.expiry_date)
      const now = new Date()
      const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
      return expiryDate > now && expiryDate <= ninetyDaysFromNow
    }).length,
    totalExams: examinations.length,
    passedExams: examinations.filter(e => e.passed).length,
    totalSkillChecks: skillChecks.length,
    passedSkillChecks: skillChecks.filter(s => s.passed).length,
    completionRate: trainings.length > 0 
      ? Math.round((trainings.filter(t => t.status === 'completed').length / trainings.length) * 100)
      : 0
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/personnel">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Personnel
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Personnel Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Detailed information about {personnel.full_name || "this person"}
          </p>
        </div>
<div className="flex gap-2">
  <Button variant="outline" size="sm" asChild>
    <Link href={`/dashboard/personnel/${id}/edit`}>
      <Edit className="mr-2 h-4 w-4" />
      Edit
    </Link>
  </Button>
  <Button variant="outline" size="sm">
    <Download className="mr-2 h-4 w-4" />
    Export
  </Button>
</div>
      </div>

      {/* Training Statistics */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trainings</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTrainings}</div>
            <p className="text-xs text-muted-foreground">{stats.activeTrainings} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCertificates}</div>
            <p className="text-xs text-muted-foreground">{stats.validCertificates} valid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Examinations</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExams}</div>
            <p className="text-xs text-muted-foreground">{stats.passedExams} passed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skill Checks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSkillChecks}</div>
            <p className="text-xs text-muted-foreground">{stats.passedSkillChecks} passed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">Training success</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {getInitials(personnel.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div>
                      <h2 className="text-2xl font-bold">{personnel.full_name || "Unknown Name"}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(personnel.role)}>
                          {personnel.role?.toUpperCase() || "UNKNOWN"}
                        </Badge>
                        {personnel.is_active ? (
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Inactive
                          </Badge>
                        )}
                        {personnel.needs_auth_setup && (
                          <Badge variant="outline" className="text-amber-600 border-amber-500/20">
                            Pending Signup
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Employee since {formatDate(personnel.created_at)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{personnel.email || "No email"}</p>
                      </div>
                    </div>
                    
                    {personnel.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{personnel.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {personnel.date_of_birth && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Date of Birth</p>
                          <p className="font-medium">{formatDate(personnel.date_of_birth)}</p>
                        </div>
                      </div>
                    )}
                    
                    {personnel.nationality && (
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Nationality</p>
                          <p className="font-medium">{personnel.nationality}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Training History Section */}
          <div className="space-y-4">
            {/* Certificates Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Certificates History
                  {stats.expiringCertificates > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {stats.expiringCertificates} expiring
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sortedCertificates.length > 0 ? (
                  <div className="space-y-3">
                    {sortedCertificates.map((certificate) => {
                      const isValid = isCertificateValid(certificate.expiry_date) && certificate.status === 'valid'
                      const isExpiring = isValid && 
                        (new Date(certificate.expiry_date).getTime() - new Date().getTime()) < (90 * 24 * 60 * 60 * 1000)
                      
                      return (
                        <div key={certificate.id} className={`p-4 rounded-lg border ${isValid ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">
                                  {certificate.job_categories?.name_en || certificate.job_categories?.name_me}
                                </h3>
                                <Badge className={getStatusColor(certificate.status)}>
                                  {certificate.status}
                                </Badge>
                                {isValid && (
                                  <Badge className={isExpiring ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-green-500/10 text-green-600 border-green-500/20"}>
                                    {isExpiring ? "Expiring Soon" : "Valid"}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {certificate.certificate_number}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  {certificate.airports?.name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Issued: {formatDate(certificate.issue_date)}
                                </span>
                                <span className="flex items-center gap-1">
                                  {isValid ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                  Expires: {formatDate(certificate.expiry_date)}
                                </span>
                              </div>
                              {certificate.theoretical_exam && (
                                <div className="text-xs">
                                  Theoretical: {certificate.theoretical_exam.score}/{certificate.theoretical_exam.max_score || 100} 
                                  ({certificate.theoretical_exam.passed ? 'Passed' : 'Failed'})
                                </div>
                              )}
                              {certificate.practical_exam && (
                                <div className="text-xs">
                                  Practical: {certificate.practical_exam.score}/{certificate.practical_exam.max_score || 100}
                                  ({certificate.practical_exam.passed ? 'Passed' : 'Failed'})
                                </div>
                              )}
                            </div>
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <h3 className="mt-4 font-medium">No Certificates</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      This personnel has no certificates yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trainings Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Training History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trainings.length > 0 ? (
                  <div className="space-y-3">
                    {trainings.map((training) => (
                      <div key={training.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {training.training_programs?.title}
                              </h3>
                              <Badge className={getStatusColor(training.status)}>
                                {training.status.replace('_', ' ')}
                              </Badge>
                              {training.completion_percentage > 0 && (
                                <div className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                  {training.completion_percentage}% complete
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" />
                                {training.training_programs?.code}
                              </span>
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {training.airports?.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(training.start_date)} - {formatDate(training.end_date) || 'Ongoing'}
                              </span>
                              {training.instructor && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  Instructor: {training.instructor.full_name}
                                </span>
                              )}
                            </div>
                            {training.notes && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {training.notes}
                              </p>
                            )}
                          </div>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <h3 className="mt-4 font-medium">No Trainings</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      This personnel has no training records yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Examinations Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Examination History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {examinations.length > 0 ? (
                  <div className="space-y-3">
                    {examinations.map((exam) => (
                      <div key={exam.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold capitalize">
                                {exam.exam_type} Examination
                              </h3>
                              <Badge className={exam.passed ? getStatusColor('passed') : getStatusColor('failed')}>
                                {exam.passed ? 'Passed' : 'Failed'}
                              </Badge>
                              {exam.training?.training_programs && (
                                <Badge variant="outline">
                                  {exam.training.training_programs.code}
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(exam.exam_date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {exam.airports?.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <ClipboardCheck className="h-3 w-3" />
                                Commission: {exam.exam_commissions?.name}
                              </span>
                              <span className="flex items-center gap-1">
                                Score: {exam.score}/{exam.max_score}
                              </span>
                            </div>
                            {exam.notes && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {exam.notes}
                              </p>
                            )}
                          </div>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <h3 className="mt-4 font-medium">No Examinations</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      No examination records found.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skill Checks Table */}
            {skillChecks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Skill Check History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {skillChecks.map((check) => (
                      <div key={check.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                Skill Check
                              </h3>
                              <Badge className={check.passed ? getStatusColor('passed') : getStatusColor('failed')}>
                                {check.passed ? 'Passed' : 'Failed'}
                              </Badge>
                              {check.certificates && (
                                <Badge variant="outline">
                                  Cert: {check.certificates.certificate_number.substring(0, 8)}...
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(check.check_date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {check.airports?.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Examiner: {check.examiner?.full_name}
                              </span>
                              {check.score && (
                                <span className="flex items-center gap-1">
                                  Score: {check.score}
                                </span>
                              )}
                            </div>
                            {check.notes && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {check.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-6">
          {/* Job Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobCategory && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Job Category</p>
                      <p className="font-medium">
                        {jobCategory.name_en || jobCategory.name_me} 
                        ({jobCategory.code})
                      </p>
                    </div>
                  </div>
                )}

                {personnel.employee_id && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Employee ID</p>
                      <p className="font-medium">{personnel.employee_id}</p>
                    </div>
                  </div>
                )}

                {/* Airport Assignments */}
                {assignedAirports.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Airport Assignments</p>
                    <div className="space-y-2">
                      {assignedAirports.map((assignment: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded bg-muted">
                          <div>
                            <p className="text-sm font-medium">{assignment.airports?.name}</p>
                            <p className="text-xs text-muted-foreground">{assignment.airports?.code}</p>
                          </div>
                          <Badge variant={assignment.is_primary ? "default" : "outline"}>
                            {assignment.is_primary ? "Primary" : "Secondary"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Account Status</p>
                    <p className={`text-lg font-semibold ${personnel.is_active ? 'text-green-600' : 'text-amber-600'}`}>
                      {personnel.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Auth Setup</p>
                    <p className={`text-lg font-semibold ${personnel.needs_auth_setup ? 'text-amber-600' : 'text-green-600'}`}>
                      {personnel.needs_auth_setup ? 'Pending' : 'Complete'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-medium">{formatDate(personnel.created_at)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-medium">{formatDate(personnel.updated_at)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Training Completion</span>
                    <span className="font-medium">{stats.completionRate}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Profile
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Assign Training
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Issue Certificate
                </Button>
                {personnel.needs_auth_setup && (
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    Resend Invitation
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}