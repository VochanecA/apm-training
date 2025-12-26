// components/add-certificate-dialog.tsx - pojednostavljena verzija
"use client"

import type React from "react"
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
import { FileText } from "lucide-react"
import { addCertificate } from "@/app/actions/certificates"
import { useRouter } from "next/navigation"

interface AddCertificateDialogProps {
  trainings: Array<{
    id: string
    trainee: { id: string; full_name: string }
    training_program: { name: string; code: string }
  }>
}

export function AddCertificateDialog({ trainings }: AddCertificateDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await addCertificate(formData)

    if (result.success) {
      setOpen(false)
      router.refresh()
      alert("Certificate added and PDF generated successfully!")
    } else {
      alert(result.error || "Failed to add certificate")
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <FileText className="mr-2 h-4 w-4" />
          Add Certificate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Issue New Certificate</DialogTitle>
            <DialogDescription>
              A certificate PDF will be automatically generated upon creation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Training Selection */}
            <div className="grid gap-2">
              <Label htmlFor="training_id">Training *</Label>
              <Select name="training_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select completed training" />
                </SelectTrigger>
                <SelectContent>
                  {trainings.map((training) => (
                    <SelectItem key={training.id} value={training.id}>
                      {training.trainee.full_name} - {training.training_program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Certificate Number */}
            <div className="grid gap-2">
              <Label htmlFor="certificate_number">Certificate Number *</Label>
              <Input 
                id="certificate_number" 
                name="certificate_number" 
                placeholder="CERT-2025-001" 
                required 
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="issue_date">Issue Date *</Label>
                <Input id="issue_date" name="issue_date" type="date" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiry_date">Expiry Date *</Label>
                <Input id="expiry_date" name="expiry_date" type="date" required />
              </div>
            </div>

            {/* Status */}
            <div className="grid gap-2">
              <Label htmlFor="status">Status *</Label>
              <Select name="status" defaultValue="valid" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Info message about auto-generated PDF */}
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-sm text-blue-700">
                ✓ A professional PDF certificate will be automatically generated.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating Certificate...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Create Certificate
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}