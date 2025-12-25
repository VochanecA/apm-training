import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Shield, AlertTriangle, CheckCircle } from "lucide-react"

export default function TermsPage() {
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
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Terms & Conditions
            </h1>
            <p className="text-muted-foreground">
              Last updated: December 1, 2025
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground mb-4">
              By accessing and using the Airport Training Management System, you accept and agree to be bound by the terms and provision of this agreement. 
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>You must be at least 18 years old to use this service</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>You agree to provide accurate and complete information</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>You are responsible for maintaining the confidentiality of your account</span>
              </li>
            </ul>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-foreground mb-4">2. User Accounts</h2>
            <p className="text-muted-foreground mb-4">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms.
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-300">Important Security Notice</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    You are solely responsible for the activity that occurs on your account. Notify us immediately of any breach of security or unauthorized use of your account.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-foreground mb-4">3. Training Content</h2>
            <p className="text-muted-foreground mb-4">
              All training materials, certificates, and content provided through our platform are protected by intellectual property rights.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                <h4 className="font-medium mb-2">Allowed Uses</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Personal training and certification</li>
                  <li>• Airport compliance requirements</li>
                  <li>• Educational purposes</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                <h4 className="font-medium mb-2">Prohibited Uses</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Commercial redistribution</li>
                  <li>• Modification without permission</li>
                  <li>• Reverse engineering</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Data and Privacy</h2>
            <p className="text-muted-foreground mb-4">
              Your use of the Airport Training Management System is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.
            </p>
            <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <p className="text-blue-800 dark:text-blue-300">
                For detailed information about how we handle your data, please read our Privacy Policy.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/privacy">View Privacy Policy</Link>
              </Button>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Airport Training Management shall not be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect.
            </p>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-foreground mb-4">7. Contact Information</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
              <p className="font-medium">Airport Training Management</p>
              <p className="text-muted-foreground">Tivat Airport Training Center</p>
              <p className="text-muted-foreground">Email: legal@airporttraining.com</p>
              <p className="text-muted-foreground">Phone: +382 32 670 000</p>
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
              <Link href="/privacy">Privacy Policy</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/cookies">Cookie Policy</Link>
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