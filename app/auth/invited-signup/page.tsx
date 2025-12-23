import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import InvitedSignupContent from "./invited-signup-content"

export default function InvitedSignupPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <InvitedSignupContent />
    </Suspense>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading invitation...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}