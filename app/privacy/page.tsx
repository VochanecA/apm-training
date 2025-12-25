import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Lock, Eye, Database,FileText, Mail } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: December 1, 2025
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  Our Commitment to Your Privacy
                </h2>
                <p className="text-muted-foreground">
                  At Airport Training Management, we take your privacy seriously. This Privacy Policy describes how we collect, use, and protect your personal information when you use our training management platform.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              1. Information We Collect
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Personal Information</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span>Full name and contact details</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span>Email address and phone number</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span>Professional qualifications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span>Training records and certifications</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Usage Data</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span>IP address and browser type</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span>Pages visited and time spent</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span>Training progress and completion</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span>Device information</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              2. How We Use Your Information
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <h3 className="font-medium text-green-800 dark:text-green-300 mb-2">Primary Purposes</h3>
                <ul className="space-y-2 text-sm text-green-700 dark:text-green-400">
                  <li>• Provide and maintain our training services</li>
                  <li>• Manage user accounts and authentication</li>
                  <li>• Process training certifications and records</li>
                  <li>• Send important notifications about your account</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Secondary Purposes</h3>
                <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                  <li>• Improve our platform and services</li>
                  <li>• Generate compliance reports for aviation authorities</li>
                  <li>• Conduct research and analysis (anonymized data)</li>
                  <li>• Prevent fraud and ensure platform security</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              3. Data Security
            </h2>
            <p className="text-muted-foreground mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
                <div className="text-2xl font-bold text-primary mb-1">256-bit</div>
                <p className="text-sm text-muted-foreground">SSL Encryption</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
                <div className="text-2xl font-bold text-primary mb-1">99.9%</div>
                <p className="text-sm text-muted-foreground">Uptime SLA</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
                <div className="text-2xl font-bold text-primary mb-1">ISO 27001</div>
                <p className="text-sm text-muted-foreground">Certified</p>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Data Retention</h2>
            <p className="text-muted-foreground mb-4">
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Data Type</th>
                    <th className="text-left py-2 font-medium">Retention Period</th>
                    <th className="text-left py-2 font-medium">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3">Training Records</td>
                    <td className="py-3">7 years</td>
                    <td className="py-3">Regulatory compliance</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">Account Information</td>
                    <td className="py-3">While active + 2 years</td>
                    <td className="py-3">Service continuity</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">Usage Data</td>
                    <td className="py-3">3 years</td>
                    <td className="py-3">Analytics and improvement</td>
                  </tr>
                  <tr>
                    <td className="py-3">Backup Data</td>
                    <td className="py-3">30 days</td>
                    <td className="py-3">Disaster recovery</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Your Rights</h2>
            <p className="text-muted-foreground mb-4">
              You have certain rights regarding your personal information, including:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border">
                <h3 className="font-medium mb-2">Access and Correction</h3>
                <p className="text-sm text-muted-foreground">
                  Right to access and correct your personal information
                </p>
              </div>
              <div className="p-4 rounded-lg border">
                <h3 className="font-medium mb-2">Data Portability</h3>
                <p className="text-sm text-muted-foreground">
                  Right to receive your data in a structured format
                </p>
              </div>
              <div className="p-4 rounded-lg border">
                <h3 className="font-medium mb-2">Deletion</h3>
                <p className="text-sm text-muted-foreground">
                  Right to request deletion of your personal information
                </p>
              </div>
              <div className="p-4 rounded-lg border">
                <h3 className="font-medium mb-2">Objection</h3>
                <p className="text-sm text-muted-foreground">
                  Right to object to processing of your data
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Contact Us</h2>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <p className="text-muted-foreground mb-4">
                  If you have any questions or concerns about this Privacy Policy or our data practices, please contact our Data Protection Officer:
                </p>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <span className="font-medium">Email: privacy@airporttraining.com</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Airport Training Management<br />
                    Tivat Airport Training Center<br />
                    Montenegro
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
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
          
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <Link href="/terms">Terms & Conditions</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/cookies">Cookie Policy</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer - isto kao u Terms stranici */}
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
                href="mailto:alen.vocanec@apm.co.me" 
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