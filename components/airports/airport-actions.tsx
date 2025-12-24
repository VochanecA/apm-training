"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  deleteAirport, 
  toggleAirportStatus 
} from "@/app/actions/airports"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, MoreVertical, Eye } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Airport {
  id: string
  name: string
  code: string
  is_active: boolean
}

interface AirportActionsProps {
  airport: Airport
}

export function AirportActions({ airport }: AirportActionsProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteAirport(airport.id)

      if (!result.success) {
        toast.error(result.error || "Failed to delete airport")
        return
      }

      toast.success(`Airport ${airport.name} deleted successfully`)
      router.refresh()
    } catch (error: any) {
      console.error("Error deleting airport:", error)
      toast.error(`Failed to delete airport: ${error.message}`)
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleToggleActive = async () => {
    setIsToggling(true)
    try {
      const result = await toggleAirportStatus(airport.id, airport.is_active)

      if (!result.success) {
        toast.error(result.error || "Failed to update airport status")
        return
      }

      toast.success(`Airport ${airport.name} ${airport.is_active ? 'deactivated' : 'activated'} successfully`)
      router.refresh()
    } catch (error: any) {
      console.error("Error updating airport status:", error)
      toast.error(`Failed to update airport: ${error.message}`)
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/airports/${airport.id}`} className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/airports/${airport.id}/edit`} className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4" />
              Edit Airport
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleToggleActive} 
            className="cursor-pointer"
            disabled={isToggling}
          >
            {airport.is_active ? (
              <>
                <span className="text-destructive">Deactivate</span>
                {isToggling && "..."}
              </>
            ) : (
              <>
                <span className="text-green-600">Activate</span>
                {isToggling && "..."}
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="cursor-pointer text-destructive focus:text-destructive"
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Airport
            {isDeleting && "..."}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the airport 
              <span className="font-semibold"> {airport.name} ({airport.code})</span> 
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Airport"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}