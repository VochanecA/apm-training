import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Cookie, Settings, Eye,FileText, Shield, CheckCircle } from "lucide-react"

export default function CookiesPage() {
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
                <Cookie className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Cookie Policy
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
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Cookie className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  What Are Cookies?
                </h2>
                <p className="text-muted-foreground">
                  Cookies are small text files that are placed on your computer or mobile device when you visit our website. They help us provide you with a better experience and understand how you use our services.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              How We Use Cookies
            </h2>
            
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-medium text-blue-800 dark:text-blue-300">Essential Cookies</h3>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you such as logging in or filling in forms.
                </p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300">
                    Always active
                  </span>
                  <span className="text-blue-600 dark:text-blue-400">Examples: Session, Security</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                <div className="flex items-center gap-3 mb-2">
                  <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-medium text-green-800 dark:text-green-300">Analytics Cookies</h3>
                </div>
                <p className="text-sm text-green-700 dark:text-green-400">
                  These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are the most and least popular.
                </p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300">
                    Optional
                  </span>
                  <span className="text-green-600 dark:text-green-400">Examples: Google Analytics</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-2">
                  <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-medium text-purple-800 dark:text-purple-300">Preference Cookies</h3>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third party providers whose services we have added to our pages.
                </p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300">
                    Optional
                  </span>
                  <span className="text-purple-600 dark:text-purple-400">Examples: Theme, Language</span>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Cookie Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 font-medium">Cookie Name</th>
                    <th className="text-left py-3 font-medium">Purpose</th>
                    <th className="text-left py-3 font-medium">Duration</th>
                    <th className="text-left py-3 font-medium">Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 font-mono">auth_token</td>
                    <td className="py-3">User authentication and session management</td>
                    <td className="py-3">Session</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 text-xs">
                        Essential
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 font-mono">theme_preference</td>
                    <td className="py-3">Stores user's theme preference (light/dark)</td>
                    <td className="py-3">1 year</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 text-xs">
                        Preference
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 font-mono">_ga</td>
                    <td className="py-3">Google Analytics - distinguishes users</td>
                    <td className="py-3">2 years</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 text-xs">
                        Analytics
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 font-mono">_gid</td>
                    <td className="py-3">Google Analytics - distinguishes users</td>
                    <td className="py-3">24 hours</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 text-xs">
                        Analytics
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-mono">cookie_consent</td>
                    <td className="py-3">Stores user's cookie consent preferences</td>
                    <td className="py-3">1 year</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 text-xs">
                        Essential
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Managing Your Cookie Preferences
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                <h3 className="font-medium mb-2">Browser Settings</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Most web browsers allow you to control cookies through their settings preferences. However, limiting cookies may affect your experience on our website.
                </p>
                <div className="flex flex-wrap gap-2">
                  <a href="https://support.google.com/chrome/answer/95647" className="text-xs px-3 py-1 rounded-full border hover:bg-gray-100 dark:hover:bg-gray-800">
                    Google Chrome
                  </a>
                  <a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" className="text-xs px-3 py-1 rounded-full border hover:bg-gray-100 dark:hover:bg-gray-800">
                    Firefox
                  </a>
                  <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" className="text-xs px-3 py-1 rounded-full border hover:bg-gray-100 dark:hover:bg-gray-800">
                    Safari
                  </a>
                  <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-xs px-3 py-1 rounded-full border hover:bg-gray-100 dark:hover:bg-gray-800">
                    Microsoft Edge
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                <h3 className="font-medium mb-2">Cookie Consent Banner</h3>
                <p className="text-sm text-muted-foreground">
                  When you first visit our website, you will see a cookie consent banner where you can choose which categories of cookies you accept. You can change these preferences at any time by clicking the "Cookie Settings" link in the footer.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <div className="flex gap-3">
                  <Eye className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-300">Important Note</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                      Essential cookies cannot be disabled as they are necessary for the basic functionality of our platform. Disabling them may prevent you from using certain features.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Third-Party Cookies</h2>
            <p className="text-muted-foreground mb-4">
              Some cookies are placed by third party services that appear on our pages. We do not control the dissemination of these cookies. You should check the relevant third-party website for more information about these.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border text-center">
                <div className="font-medium mb-1">Google Analytics</div>
                <p className="text-xs text-muted-foreground">Website analytics and usage statistics</p>
              </div>
              <div className="p-4 rounded-lg border text-center">
                <div className="font-medium mb-1">Stripe</div>
                <p className="text-xs text-muted-foreground">Payment processing (if applicable)</p>
              </div>
              <div className="p-4 rounded-lg border text-center">
                <div className="font-medium mb-1">Cloudflare</div>
                <p className="text-xs text-muted-foreground">Security and performance optimization</p>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Contact Information</h2>
            <p className="text-muted-foreground">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
              <p className="font-medium">Data Protection Officer</p>
              <p className="text-muted-foreground">Airport Training Management</p>
              <p className="text-muted-foreground">Email: privacy@airporttraining.com</p>
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
              <Link href="/terms">Terms & Conditions</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/privacy">Privacy Policy</Link>
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