import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import EditJobCategoryForm from "@/components/edit-job-category-form"

export default async function EditJobCategoryPage({
  params,
}: {
  params: Promise<{ id: string }> // OVO JE PROMISE!
}) {
  const { id } = await params // AWAIT OVDE TAKOĐE!
  const supabase = await createClient()

  // Provera autentifikacije
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Dobijanje kategorije
  const { data: category, error } = await supabase
    .from("job_categories")
    .select("*")
    .eq("id", id) // Koristite `id` umesto `params.id`
    .single()

  if (error || !category) {
    notFound()
  }

  return (
    <div className="space-y-6 p-6 font-sans max-w-4xl mx-auto">
      
      {/* Back Link */}
      <div className="flex items-center">
        <Link 
          href={`/dashboard/job-categories/${id}`} 
          className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Category
        </Link>
      </div>

      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Job Category</h1>
        <p className="text-muted-foreground mt-1">
          Update the details of <span className="font-semibold">{category.name_en}</span>
        </p>
      </div>

      {/* Edit Form */}
      <EditJobCategoryForm category={category} />
    </div>
  )
}