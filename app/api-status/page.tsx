"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Server, 
  Database, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Activity,
  Globe,
  Cpu
} from "lucide-react"
import { DashboardNav } from "@/components/dashboard-nav"
import { ModeToggle } from "@/components/mode-toggle"

type ServiceStatus = {
  name: string
  status: 'operational' | 'degraded' | 'down' | 'maintenance'
  responseTime: number
  lastChecked: string
}

type SystemMetric = {
  name: string
  value: string
  status: 'good' | 'warning' | 'critical'
  icon: React.ReactNode
}

export default function ApiStatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: "API Gateway",
      status: "operational",
      responseTime: 45,
      lastChecked: new Date().toISOString()
    },
    {
      name: "Authentication Service",
      status: "operational",
      responseTime: 32,
      lastChecked: new Date().toISOString()
    },
    {
      name: "Database Cluster",
      status: "operational",
      responseTime: 78,
      lastChecked: new Date().toISOString()
    },
    {
      name: "File Storage",
      status: "degraded",
      responseTime: 210,
      lastChecked: new Date().toISOString()
    },
    {
      name: "Email Service",
      status: "operational",
      responseTime: 65,
      lastChecked: new Date().toISOString()
    },
    {
      name: "PDF Generator",
      status: "operational",
      responseTime: 89,
      lastChecked: new Date().toISOString()
    }
  ])

  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    {
      name: "System Uptime",
      value: "99.98%",
      status: "good",
      icon: <Clock className="h-5 w-5" />
    },
    {
      name: "API Requests (24h)",
      value: "12,847",
      status: "good",
      icon: <Activity className="h-5 w-5" />
    },
    {
      name: "Database Connections",
      value: "42/100",
      status: "good",
      icon: <Database className="h-5 w-5" />
    },
    {
      name: "Memory Usage",
      value: "68%",
      status: "warning",
      icon: <Cpu className="h-5 w-5" />
    },
    {
      name: "SSL Certificate",
      value: "Valid",
      status: "good",
      icon: <Shield className="h-5 w-5" />
    },
    {
      name: "Data Center",
      value: "EU-West",
      status: "good",
      icon: <Globe className="h-5 w-5" />
    }
  ])

  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'degraded': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'down': return <XCircle className="h-5 w-5 text-red-500" />
      case 'maintenance': return <Clock className="h-5 w-5 text-blue-500" />
    }
  }

  const getMetricColor = (status: SystemMetric['status']) => {
    switch (status) {
      case 'good': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
    }
  }

  const refreshStatus = async () => {
    setIsRefreshing(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setLastUpdated(new Date().toLocaleTimeString())
    setIsRefreshing(false)
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const operationalCount = services.filter(s => s.status === 'operational').length
  const totalServices = services.length

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Navigation */}
      <DashboardNav />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              asChild
              variant="ghost"
              className="group"
            >
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Home
              </Link>
            </Button>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-muted-foreground">Last updated</p>
                <p className="text-sm font-medium">{lastUpdated}</p>
              </div>
              <ModeToggle />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Server className="h-8 w-8 text-primary" />
                System Status Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Real-time monitoring of all system services and API endpoints
              </p>
            </div>

            <Button 
              onClick={refreshStatus} 
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              {isRefreshing ? "Refreshing..." : "Refresh Now"}
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
              <CardDescription>System Health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className={`h-3 w-3 rounded-full ${operationalCount === totalServices ? 'bg-green-500' : operationalCount > totalServices / 2 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                <div className="text-2xl font-bold">
                  {operationalCount}/{totalServices}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {operationalCount === totalServices ? 'All systems operational' : 'Some services degraded'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <CardDescription>Across all services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="text-2xl font-bold">
                  {Math.round(services.reduce((acc, s) => acc + s.responseTime, 0) / services.length)}ms
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Lower is better
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <div className="text-2xl font-bold">99.98%</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                5m 12s downtime this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Incidents</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <div className="text-2xl font-bold">2</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Both resolved
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Services Status */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Service Status
                </CardTitle>
                <CardDescription>
                  Real-time status of all system services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.map((service) => (
                    <div 
                      key={service.name}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {getStatusIcon(service.status)}
                        <div>
                          <h3 className="font-medium">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Last checked: {new Date(service.lastChecked).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-medium">{service.responseTime}ms</div>
                          <div className="text-xs text-muted-foreground">Response time</div>
                        </div>
                        
                        <Badge 
                          variant="outline" 
                          className={`
                            ${service.status === 'operational' ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400' : ''}
                            ${service.status === 'degraded' ? 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : ''}
                            ${service.status === 'down' ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400' : ''}
                            ${service.status === 'maintenance' ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400' : ''}
                            capitalize
                          `}
                        >
                          {service.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Metrics */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Metrics
                </CardTitle>
                <CardDescription>
                  Current system performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemMetrics.map((metric) => (
                    <div 
                      key={metric.name}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                          {metric.icon}
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">{metric.name}</h3>
                        </div>
                      </div>
                      
                      <div className={`text-lg font-semibold ${getMetricColor(metric.status)}`}>
                        {metric.value}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* API Endpoints */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">API Endpoints</CardTitle>
                <CardDescription>
                  Key API endpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <code className="text-sm">POST /api/auth/login</code>
                    <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                      200 OK
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <code className="text-sm">GET /api/trainings</code>
                    <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                      200 OK
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <code className="text-sm">POST /api/certificates</code>
                    <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                      201 Created
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Legend */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Status Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <div>
                  <div className="font-medium">Operational</div>
                  <div className="text-sm text-muted-foreground">Service is working normally</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div>
                  <div className="font-medium">Degraded</div>
                  <div className="text-sm text-muted-foreground">Service is experiencing issues</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div>
                  <div className="font-medium">Down</div>
                  <div className="text-sm text-muted-foreground">Service is not available</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <div>
                  <div className="font-medium">Maintenance</div>
                  <div className="text-sm text-muted-foreground">Scheduled maintenance</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>This status page updates automatically every 30 seconds.</p>
          <p className="mt-1">For urgent issues, please contact support.</p>
        </div>
      </div>
    </div>
  )
}