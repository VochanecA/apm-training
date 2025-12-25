import Link from "next/link"
import CreateJobCategoryForm from "@/components/create-job-category-form"

export default function CreateJobCategoryPage() {
  return (
    <div className="space-y-6 p-6 font-sans max-w-4xl mx-auto">
      
      {/* Back Link */}
      <div className="flex items-center">
        <Link 
          href="/dashboard/job-categories" 
          className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Categories
        </Link>
      </div>

      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Job Category</h1>
        <p className="text-muted-foreground mt-1">
          Define a new job classification for personnel
        </p>
      </div>

      {/* Create Form */}
      <CreateJobCategoryForm />
    </div>
  )
}