import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Shield, 
  FileCheck, 
  Award, 
  Clock, 
  Users, 
  Building2,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  BarChart,
  FileText,
  Settings,
  Globe
} from "lucide-react"

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            asChild
            variant="ghost"
            className="mb-6 group"
          >
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Return to Home
            </Link>
          </Button>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Regulatory Compliance
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Meeting and exceeding aviation training standards in accordance with Montenegro Civil Aviation Agency (CAA) and international regulations
            </p>
          </div>
        </div>

        {/* Compliance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Current Status</CardTitle>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Compliant
                </Badge>
              </div>
              <CardDescription>All systems operational</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Last audit completed: November 15, 2025
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Next audit due: May 15, 2026</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Certifications</CardTitle>
                <Award className="h-5 w-5 text-amber-600" />
              </div>
              <CardDescription>Active certifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">CAA Montenegro</span>
                  <Badge variant="outline" className="text-xs">Valid until 2026</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">ISO 9001:2015</span>
                  <Badge variant="outline" className="text-xs">Certified</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Audit History</CardTitle>
                <FileCheck className="h-5 w-5 text-blue-600" />
              </div>
              <CardDescription>Recent compliance checks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Annual Audit 2025</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
                    Passed
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Spot Check Q3 2025</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
                    Passed
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Regulatory Frameworks */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Regulatory Frameworks</h2>
                <p className="text-muted-foreground">
                  Our training programs comply with national and international aviation regulations
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  National Regulations
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Montenegro Civil Aviation Agency (CAA)</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Regulation No. 12/2019 on Aviation Personnel Training
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Airport Security Requirements</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        ICAO Annex 17 implementation for Montenegro
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  International Standards
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">ICAO Standards</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Annex 1 - Personnel Licensing, Annex 6 - Operation of Aircraft
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">EASA Regulations</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        EU Regulation 1178/2011 (aligned where applicable)
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Training Compliance */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <BookOpen className="h-7 w-7 text-primary" />
              Training Compliance Requirements
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 font-medium">Training Category</th>
                    <th className="text-left py-3 font-medium">Regulatory Requirement</th>
                    <th className="text-left py-3 font-medium">Frequency</th>
                    <th className="text-left py-3 font-medium">Our Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-4 font-medium">Security Awareness</td>
                    <td className="py-4">CAA Montenegro Regulation 12/2019</td>
                    <td className="py-4">Annual</td>
                    <td className="py-4">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        100% Compliant
                      </Badge>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 font-medium">Fire Safety</td>
                    <td className="py-4">ICAO Annex 14, Airport Services Manual</td>
                    <td className="py-4">Every 2 Years</td>
                    <td className="py-4">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        100% Compliant
                      </Badge>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 font-medium">Dangerous Goods</td>
                    <td className="py-4">IATA DGR, ICAO Technical Instructions</td>
                    <td className="py-4">Every 2 Years</td>
                    <td className="py-4">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        100% Compliant
                      </Badge>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 font-medium">First Aid</td>
                    <td className="py-4">Montenegro Health & Safety Regulations</td>
                    <td className="py-4">Every 3 Years</td>
                    <td className="py-4">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        100% Compliant
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 font-medium">Aviation English</td>
                    <td className="py-4">ICAO Language Proficiency Requirements</td>
                    <td className="py-4">Every 3 Years</td>
                    <td className="py-4">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        100% Compliant
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Data and Record Keeping */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Record Keeping Requirements
                </CardTitle>
                <CardDescription>
                  Regulatory data retention periods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div>
                      <h4 className="font-medium">Training Records</h4>
                      <p className="text-sm text-muted-foreground">Personnel training history</p>
                    </div>
                    <Badge variant="outline">7 Years</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div>
                      <h4 className="font-medium">Certificates Issued</h4>
                      <p className="text-sm text-muted-foreground">All training certificates</p>
                    </div>
                    <Badge variant="outline">7 Years</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div>
                      <h4 className="font-medium">Audit Reports</h4>
                      <p className="text-sm text-muted-foreground">Internal and external audits</p>
                    </div>
                    <Badge variant="outline">10 Years</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div>
                      <h4 className="font-medium">Safety Reports</h4>
                      <p className="text-sm text-muted-foreground">Incident and safety reports</p>
                    </div>
                    <Badge variant="outline">Permanent</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quality Assurance
                </CardTitle>
                <CardDescription>
                  Continuous improvement processes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Internal Audits</h4>
                      <p className="text-sm text-muted-foreground">
                        Quarterly audits conducted by certified internal auditors
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                      <BarChart className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Performance Metrics</h4>
                      <p className="text-sm text-muted-foreground">
                        Real-time tracking of compliance KPIs and training effectiveness
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Corrective Actions</h4>
                      <p className="text-sm text-muted-foreground">
                        Systematic process for addressing non-conformities
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Contact Information */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Compliance Contacts</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg border">
                <h3 className="font-medium mb-2">Compliance Officer</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Primary contact for regulatory compliance matters
                </p>
                <div className="text-sm">
                  <p className="text-foreground">Marko Petrović</p>
                  <p className="text-muted-foreground">compliance@airporttraining.com</p>
                  <p className="text-muted-foreground">+382 32 670 001</p>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border">
                <h3 className="font-medium mb-2">Quality Assurance</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Training quality and process improvement
                </p>
                <div className="text-sm">
                  <p className="text-foreground">Ana Marković</p>
                  <p className="text-muted-foreground">quality@airporttraining.com</p>
                  <p className="text-muted-foreground">+382 32 670 002</p>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border">
                <h3 className="font-medium mb-2">Regulatory Affairs</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Government and regulatory body liaison
                </p>
                <div className="text-sm">
                  <p className="text-foreground">Nikola Jovanović</p>
                  <p className="text-muted-foreground">regulatory@airporttraining.com</p>
                  <p className="text-muted-foreground">+382 32 670 003</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-300">Reporting Obligations</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    All incidents, non-compliances, and safety concerns must be reported immediately through the appropriate channels in accordance with CAA Montenegro reporting requirements.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Regulatory Updates */}
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Recent Regulatory Updates</h2>
            
            <div className="space-y-4">
              <div className="flex items-start justify-between p-4 rounded-lg border">
                <div>
                  <h3 className="font-medium">CAA Montenegro Circular 2025-04</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Updated security training requirements for airport personnel
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-900">
                      Effective: January 1, 2026
                    </span>
                    <span className="text-xs text-muted-foreground">Status: Implemented</span>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  Compliant
                </Badge>
              </div>
              
              <div className="flex items-start justify-between p-4 rounded-lg border">
                <div>
                  <h3 className="font-medium">ICAO Amendment 45</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    New provisions for aviation English language proficiency testing
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-900">
                      Effective: July 1, 2025
                    </span>
                    <span className="text-xs text-muted-foreground">Status: In Progress</span>
                  </div>
                </div>
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                  Reviewing
                </Badge>
              </div>
              
              <div className="flex items-start justify-between p-4 rounded-lg border">
                <div>
                  <h3 className="font-medium">EU Regulation 2024/987</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Alignment with EASA training requirements for third countries
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-900">
                      Effective: March 15, 2025
                    </span>
                    <span className="text-xs text-muted-foreground">Status: Implemented</span>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  Compliant
                </Badge>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button
            asChild
            variant="ghost"
            className="group"
          >
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Return to Home
            </Link>
          </Button>
          
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/terms">Terms & Conditions</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/privacy">Privacy Policy</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/cookies">Cookie Policy</Link>
            </Button>
            <Button asChild>
              <Link href="/api-status">System Status</Link>
            </Button>
          </div>
        </div>
      </div>


      {/* Footer */}
      <footer className="border-t bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-12">
          {/* Footer content - kao u originalu */}
          <div className="grid gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="md:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <FileText className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Legal Information</h3>
                  <p className="text-sm text-muted-foreground">Official Terms & Conditions</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                These terms govern your use of the Airport Training Management System.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal Documents</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link 
                    href="/terms" 
                    className="text-primary hover:underline transition-colors"
                  >
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/privacy" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/cookies" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/compliance" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link 
                    href="/" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/api-status" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    API Status
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/contact" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>legal@airporttraining.com</li>
                <li>+382 32 670 000</li>
                <li>Tivat Airport, Montenegro</li>
              </ul>
            </div>
          </div>

          <div className="my-8 h-px bg-border" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-sm text-muted-foreground text-center md:text-left">
              <p>© 2025 Tivat Airport Training Center. All rights reserved.</p>
              <p className="mt-1 text-xs">
                Compliant with Montenegro Civil Aviation Agency regulations
              </p>
            </div>
            
            <div className="flex gap-4 text-sm">
              <Link 
                href="/terms" 
                className="text-primary font-medium"
              >
                Terms
              </Link>
              <Link 
                href="/privacy" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link 
                href="/contact" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground">
              Designed and developed with ❤️ by{" "}
              <span className="text-primary font-medium">Alen</span>
              {" • "}
              <a 
                href="mailto:alen@example.com" 
                className="text-primary hover:underline transition-colors"
              >
                Contact developer
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}