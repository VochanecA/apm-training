"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  MoreVertical,
  User,
  Mail,
  Phone,
  Building2,
  Eye,
  X,
  Users
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
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
import { AssignPersonnelToCategoryDialog } from "./assign-personnel-to-category-dialog"

interface Personnel {
  id: string
  full_name: string
  email: string
  role: string
  is_active: boolean
  phone: string | null
  employee_airports: Array<{
    airport: {
      name: string
      code: string
    }
  }> | null
}

interface JobCategoryPersonnelTableProps {
  personnel: Personnel[]
  jobCategoryId: string
  jobCategoryName?: string
}

export function JobCategoryPersonnelTable({ 
  personnel, 
  jobCategoryId,
  jobCategoryName = "this category"
}: JobCategoryPersonnelTableProps) {
  const [personnelToRemove, setPersonnelToRemove] = useState<Personnel | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20"
      case "instructor":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "employee":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleRemovePersonnel = async () => {
    if (!personnelToRemove) return

    setIsRemoving(true)
    try {
      const { removePersonnelFromCategory } = await import("@/app/actions/job-categories")
      const result = await removePersonnelFromCategory(jobCategoryId, personnelToRemove.id)

      if (!result.success) {
        toast.error(result.error || "Failed to remove personnel")
        return
      }

      toast.success(`${personnelToRemove.full_name} removed from category`)
      window.location.reload() // Refresh page to update list
    } catch (error: any) {
      console.error("Error removing personnel:", error)
      toast.error(error.message || "Failed to remove personnel")
    } finally {
      setIsRemoving(false)
      setPersonnelToRemove(null)
    }
  }

  return (
    <>
      <div className="space-y-4">
        {/* Add Personnel Button */}
        <div className="flex justify-end">
          <AssignPersonnelToCategoryDialog
            jobCategoryId={jobCategoryId}
            jobCategoryName={jobCategoryName}
            trigger={
              <Button size="sm">
                <Users className="mr-2 h-4 w-4" />
                Add Personnel
              </Button>
            }
            onSuccess={() => window.location.reload()}
          />
        </div>

        {/* Personnel Table */}
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Contact</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role & Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Airport</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {personnel.map((person) => (
                  <tr key={person.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(person.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{person.full_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="truncate">{person.email}</span>
                        </div>
                        {person.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{person.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex flex-col gap-1">
                        <Badge className={getRoleColor(person.role)} variant="outline">
                          {person.role}
                        </Badge>
                        {!person.is_active && (
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      {person.employee_airports && person.employee_airports.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {person.employee_airports.map(ea => ea.airport?.code).join(", ")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No airport</span>
                      )}
                    </td>
                    <td className="p-4 align-middle">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/personnel/${person.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setPersonnelToRemove(person)}
                            className="text-destructive focus:text-destructive"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Remove from Category
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={!!personnelToRemove} onOpenChange={(open) => !open && setPersonnelToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-semibold">{personnelToRemove?.full_name}</span> from this job category?
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                <p className="text-amber-700 text-sm">
                  Note: The personnel will still exist in the system but will no longer be associated with this category.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemovePersonnel}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? "Removing..." : "Remove from Category"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}