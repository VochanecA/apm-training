import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, AlertCircle, Download, Search } from "lucide-react"
import Link from "next/link"
import { AddCertificateDialog } from "@/components/add-certificate-dialog"

export default async function CertificatesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch certificates for the current user
  const [{ data: certificates }, { data: completedTrainings }] = await Promise.all([
    supabase
      .from("certificates")
      .select(`
        *,
        trainee:profiles!certificates_trainee_id_fkey(full_name, email),
        training:trainings(training_program:training_programs(name, code))
      `)
      .eq("trainee_id", user.id)
      .order("issue_date", { ascending: false }),
    supabase
      .from("trainings")
      .select(`
        id,
        trainee:profiles!trainings_trainee_id_fkey(id, full_name),
        training_program:training_programs(name, code)
      `)
      .eq("status", "completed"),
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "expired":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      case "suspended":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      case "revoked":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const isExpiringSoon = (expiryDate: string) => {
    const daysUntilExpiry = Math.floor((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 90 && daysUntilExpiry >= 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Certificates</h1>
          <p className="mt-1 text-sm text-muted-foreground">View and manage your aviation certificates</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" size="sm">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
          <AddCertificateDialog trainings={completedTrainings || []} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificates?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {certificates?.filter((c) => c.status === "valid").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {certificates?.filter((c) => isExpiringSoon(c.expiry_date)).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {certificates?.filter((c) => c.status === "expired").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificates List */}
      <div className="space-y-4">
        {certificates && certificates.length > 0 ? (
          certificates.map((certificate) => (
            <Card key={certificate.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        {certificate.training?.training_program?.name || "Certificate"}
                      </CardTitle>
                      {isExpiringSoon(certificate.expiry_date) && certificate.status === "valid" && (
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                    <CardDescription>Certificate #: {certificate.certificate_number}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(certificate.status)} variant="outline">
                    {certificate.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Issued: {new Date(certificate.issue_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Expires: {new Date(certificate.expiry_date).toLocaleDateString()}</span>
                  </div>
                  {certificate.training?.training_program?.code && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Code: {certificate.training.training_program.code}</span>
                    </div>
                  )}
                </div>
                {isExpiringSoon(certificate.expiry_date) && certificate.status === "valid" && (
                  <div className="mt-3 flex items-center gap-2 rounded-md bg-amber-500/10 p-3 text-sm text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>This certificate expires in less than 90 days. Please renew soon.</span>
                  </div>
                )}
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none bg-transparent">
                    <Link href={`/dashboard/certificates/${certificate.id}`}>View Details</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none bg-transparent">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No certificates found</h3>
              <p className="mt-2 text-sm text-muted-foreground">Complete trainings to earn certificates</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
