"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Copy, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AddJobCategoryDialog } from "@/components/add-job-category-dialog"
import Link from "next/link"

interface AddPersonnelDialogProps {
  jobCategories: Array<{ id: string; name: string; code: string; name_en?: string }>
  airports: Array<{ id: string; name: string; code: string }>
}

export function AddPersonnelDialog({ jobCategories, airports }: AddPersonnelDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const router = useRouter()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedLink(text)
    setTimeout(() => setCopiedLink(null), 2000)
    toast.success("Link copied to clipboard")
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      // Koristi glavni addPersonnel action
      const { addPersonnel } = await import("@/app/actions/personnel")
      const result = await addPersonnel(formData)

      // Type guard za TypeScript
      if (result.success) {
        // Ovo je PersonnelSuccess tip
        const successResult = result
        const { message, signupLink, invitationToken, person } = successResult
        
        // Prikaži signup link ako postoji
        if (signupLink) {
          toast.success(
            <div className="space-y-3">
              <p className="font-medium">{message}</p>
              <div className="text-sm bg-muted p-3 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-muted-foreground">Signup Link:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(signupLink)}
                    className="h-6 px-2"
                  >
                    {copiedLink === signupLink ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <Copy className="h-3 w-3 mr-1" />
                    )}
                    Copy
                  </Button>
                </div>
                <code className="block p-2 bg-background rounded text-xs break-all">
                  {signupLink}
                </code>
                {invitationToken && (
                  <div className="mt-2">
                    <span className="text-xs text-muted-foreground">Invitation Token: </span>
                    <code className="text-xs">{invitationToken.substring(0, 8)}...</code>
                  </div>
                )}
              </div>
              {person && (
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Link href={`/dashboard/personnel/${person.id}`}>View Profile</Link>
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Share this link with the user. They can use it to complete their registration.
              </p>
            </div>,
            { 
              duration: 15000,
              dismissible: true 
            }
          )
        } else {
          toast.success(message || "Personnel added successfully!")
        }
        
        setOpen(false)
        router.refresh()
      } else {
        // Ovo je PersonnelError tip
        const errorResult = result
        toast.error(errorResult.error || "Failed to add personnel")
      }
    } catch (error: any) {
      console.error("Error in handleSubmit:", error)
      toast.error(error.message || "Failed to add personnel")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Users className="mr-2 h-4 w-4" />
          Add Personnel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Personnel</DialogTitle>
            <DialogDescription>
              Add a new employee or staff member to the system. They will receive a signup link.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@example.com"
                required
                disabled={loading}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                User will sign up with this email address
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="full_name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="full_name"
                name="full_name"
                placeholder="John Doe"
                required
                disabled={loading}
                minLength={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">
                Role <span className="text-destructive">*</span>
              </Label>
              <Select name="role" required disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trainee">Trainee (Employee)</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="inspector">Inspector</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="job_category_id">Job Category (Optional)</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select name="job_category_id" key={refreshKey} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Koristi posebnu string vrednost umesto praznog stringa */}
                      <SelectItem value="no-category">No category</SelectItem>
                      {jobCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name_en || cat.name} ({cat.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <AddJobCategoryDialog
                  onSuccess={() => {
                    router.refresh()
                    setRefreshKey((prev) => prev + 1)
                  }}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="airport_id">Primary Airport (Optional)</Label>
              <Select name="airport_id" disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select airport (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {/* Koristi posebnu string vrednost umesto praznog stringa */}
                  <SelectItem value="no-airport">No airport</SelectItem>
                  {airports.map((airport) => (
                    <SelectItem key={airport.id} value={airport.id}>
                      {airport.name} ({airport.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-muted/50 rounded-md border">
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-sm">
                  <p className="font-medium">How it works:</p>
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    <li className="flex items-start gap-1">
                      <span className="mt-0.5">•</span>
                      <span>Profile will be created immediately</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="mt-0.5">•</span>
                      <span>You'll receive a signup link to share</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="mt-0.5">•</span>
                      <span>User will set their own password</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto sm:order-2"
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating Profile...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Create Profile
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}