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
import { Building2 } from "lucide-react"
import { addAirport } from "@/app/actions/airports"
import { useRouter } from "next/navigation"

export function AddAirportDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await addAirport(formData)

    if (result.success) {
      setOpen(false)
      router.refresh()
    } else {
      alert(result.error || "Failed to add airport")
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Building2 className="mr-2 h-4 w-4" />
          Add Airport
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Airport</DialogTitle>
            <DialogDescription>Add a new airport or heliodrome to the system</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Airport Name *</Label>
              <Input id="name" name="name" placeholder="John F. Kennedy International Airport" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Code *</Label>
              <Input id="code" name="code" placeholder="JFK" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="icao_code">ICAO Code *</Label>
              <Input id="icao_code" name="icao_code" placeholder="KJFK" maxLength={4} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="iata_code">IATA Code</Label>
              <Input id="iata_code" name="iata_code" placeholder="JFK" maxLength={3} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="airport_type">Type *</Label>
              <Select name="airport_type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="international">International</SelectItem>
                  <SelectItem value="regional">Regional</SelectItem>
                  <SelectItem value="heliport">Heliport</SelectItem>
                  <SelectItem value="military">Military</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">City *</Label>
              <Input id="city" name="city" placeholder="New York" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" placeholder="United States" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Airport"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
