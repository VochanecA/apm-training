"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Mail, Building2, ExternalLink, Filter, Download } from "lucide-react"
import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Airport {
  id: string
  name: string
  code: string
}

export function PersonnelList({ 
  initialPersonnel, 
  airports 
}: { 
  initialPersonnel: any[], 
  airports: Airport[] 
}) {
  const [query, setQuery] = useState("")
  const [selectedAirport, setSelectedAirport] = useState<string>("all")

  // Kombinovano filtriranje (Pretraga + Aerodrom)
  const filtered = initialPersonnel.filter(person => {
    const matchesSearch = 
      person.full_name?.toLowerCase().includes(query.toLowerCase()) ||
      person.email?.toLowerCase().includes(query.toLowerCase());

    const personAirports = person.employee_airports?.map((ea: any) => ea.airport?.id) || [];
    const matchesAirport = selectedAirport === "all" || personAirports.includes(selectedAirport);

    return matchesSearch && matchesAirport;
  })

  // Funkcija za Export u CSV
  const exportToCSV = () => {
    // 1. Definišemo kolone
    const headers = ["Ime i Prezime", "Email", "Uloga", "Aerodromi", "Datum kreiranja"]
    
    // 2. Mapiramo filtrirane podatke u CSV redove
    const rows = filtered.map(person => [
      `"${person.full_name}"`,
      `"${person.email}"`,
      `"${person.role}"`,
      `"${person.employee_airports?.map((ea: any) => ea.airport?.code).join(", ") || "N/A"}"`,
      `"${new Date(person.created_at).toLocaleDateString('sr-ME')}"`
    ].join(","))

    // 3. Spajamo sve u finalni string
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n") // \uFEFF je za podršku naših slova u Excelu
    
    // 4. Kreiranje download linka
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `personnel_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search name or email..." 
              className="pl-10 h-11"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Airport Filter Dropdown */}
          <div className="w-full sm:w-[220px]">
            <Select onValueChange={setSelectedAirport} defaultValue="all">
              <SelectTrigger className="h-11">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="All Airports" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Airports</SelectItem>
                {airports.map((airport) => (
                  <SelectItem key={airport.id} value={airport.id}>
                    {airport.name} ({airport.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Export Button */}
        <Button 
          variant="outline" 
          className="h-11 shadow-sm border-primary/20 hover:bg-primary/5 transition-colors"
          onClick={exportToCSV}
          disabled={filtered.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV ({filtered.length})
        </Button>
      </div>

      {/* Grid Liste */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length > 0 ? (
          filtered.map((person) => (
            <Card key={person.id} className="group hover:ring-2 hover:ring-primary/20 transition-all duration-300 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border shadow-sm group-hover:border-primary/30 transition-colors">
                    <AvatarFallback className="bg-slate-50 font-bold text-primary">
                      {person.full_name?.split(" ").map((n: any) => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <CardTitle className="text-base truncate font-bold">{person.full_name}</CardTitle>
                    <Badge variant="outline" className={`text-[10px] uppercase font-bold mt-1 ${
                      person.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                      person.role === 'instructor' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      'bg-emerald-50 text-emerald-600 border-emerald-200'
                    }`}>
                      {person.role}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-2 text-muted-foreground border-t pt-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{person.email}</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-slate-700">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    <span className="truncate">
                      {person.employee_airports?.map((ea: any) => ea.airport?.code).join(", ") || "Unassigned"}
                    </span>
                  </div>
                </div>
                <Button asChild variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all font-semibold">
                  <Link href={`/dashboard/personnel/${person.id}`} className="flex items-center justify-center gap-2">
                    View Full Profile <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl bg-slate-50/50">
            <Filter className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-muted-foreground font-medium">No results match your search or filter.</p>
            <Button variant="link" onClick={() => {setQuery(""); setSelectedAirport("all")}} className="mt-2">
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}