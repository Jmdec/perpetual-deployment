"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, FileText, CheckCircle, Clock, XCircle, Eye, Search, Calendar, User, Hash, RefreshCw, Heart, Shield, Building, Users, Home, FileHeart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MemberLayout from "@/components/memberLayout"
import { authClient } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"

interface Application {
  id: number
  reference_number: string
  status: string
  created_at: string
  type: string
  document_path?: string
  photo_path?: string
  image_url?: string
  [key: string]: unknown
}

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost:8000'

const imageCache = new Map<string, string>()

const fetchImageAsBase64 = async (imagePath: string): Promise<string | null> => {
  if (!imagePath) return null
  
  if (imageCache.has(imagePath)) {
    return imageCache.get(imagePath)!
  }
  
  try {
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
    const fullImageUrl = `${IMAGE_BASE_URL}${cleanPath}`
    
    const response = await fetch(fullImageUrl, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status}`)
      return null
    }
    
    const blob = await response.blob()
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        imageCache.set(imagePath, base64)
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error fetching image:', error)
    return null
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const categories = [
  {
    id: 'health-certificate',
    name: 'Health Certificate',
    icon: Heart,
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-500',
    textColor: 'text-rose-700',
    types: ['Health Certificate']
  },
  {
    id: 'barangay-clearance',
    name: 'Barangay Clearance',
    icon: Shield,
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-700',
    types: ['Barangay Clearance']
  },
  {
    id: 'business-permit',
    name: 'Business Permit',
    icon: Building,
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-700',
    types: ['Business Permit', 'Business Permit Renewal']
  },
  {
    id: 'cedula',
    name: 'Cedula',
    icon: Users,
    color: 'from-teal-500 to-emerald-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-500',
    textColor: 'text-teal-700',
    types: ['Cedula', 'Community Tax Certificate']
  },
  {
    id: 'medical-assistance',
    name: 'Medical Assistance',
    icon: FileHeart,
    color: 'from-orange-500 to-amber-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-700',
    types: ['Medical Assistance']
  },
  {
    id: 'building-permit',
    name: 'Building Permit',
    icon: Home,
    color: 'from-indigo-500 to-blue-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-500',
    textColor: 'text-indigo-700',
    types: ['Building Permit']
  },
  {
    id: 'other',
    name: 'Other Services',
    icon: FileText,
    color: 'from-gray-500 to-slate-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-500',
    textColor: 'text-gray-700',
    types: []
  }
]

function ApplicationsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [statusFilter, setStatusFilter] = useState("all")
  const [imageData, setImageData] = useState<Map<string, string>>(new Map())
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set())

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const user = await authClient.getCurrentUser()
        
        if (!user) {
          toast({
            title: "Authentication Required",
            description: "Please log in to view your applications.",
            variant: "destructive",
          })
          router.push('/login')
          return
        }

        setIsAuthenticated(true)
        
        const success = searchParams.get("success")
        if (success) {
          toast({
            title: "Success!",
            description: `Your ${success} application has been submitted.`,
          })
        }

        await fetchApplications()
      } catch (error) {
        console.error("Error verifying authentication:", error)
        toast({
          title: "Authentication Error",
          description: "Failed to verify your session. Please log in again.",
          variant: "destructive",
        })
        router.push('/login')
      }
    }

    verifyAuth()
  }, [router, searchParams, toast])

  const fetchApplications = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/applications", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please log in again to continue.",
          variant: "destructive",
        })
        router.push('/login')
        return
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch applications: ${response.statusText}`)
      }

      const data = await response.json()
      let apps: Application[] = []
      
      if (Array.isArray(data)) {
        apps = data
      } else if (data.data && Array.isArray(data.data)) {
        apps = data.data
      } else if (data.applications && Array.isArray(data.applications)) {
        apps = data.applications
      }

      console.log('Total applications loaded:', apps.length)
      console.log('Application breakdown:', data.breakdown)

      const sortedApps = apps.sort((a: Application, b: Application) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      setApplications(sortedApps)
      await fetchAllImages(sortedApps)

      if (sortedApps.length > 0) {
        toast({
          title: "Applications Loaded",
          description: `Found ${sortedApps.length} application${sortedApps.length !== 1 ? 's' : ''}.`,
        })
      }
    } catch (err) {
      console.error("Error fetching applications:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load applications"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAllImages = async (apps: Application[]) => {
    const newImageData = new Map<string, string>()
    const imagePaths = new Set<string>()
    
    apps.forEach(app => {
      const path = app.photo_path || app.image_url || app.document_path
      if (path && typeof path === 'string') {
        imagePaths.add(path)
      }
      
      if (app.supporting_documents && typeof app.supporting_documents === 'string') {
        imagePaths.add(app.supporting_documents)
      }
      
      Object.entries(app).forEach(([key, value]) => {
        if ((key.includes('photo') || key.includes('image') || key.includes('document') || key.includes('supporting')) && 
            (key.includes('path') || key.includes('documents')) && value && typeof value === 'string') {
          imagePaths.add(value as string)
        }
      })
    })

    const imagePromises = Array.from(imagePaths).map(async (imgPath) => {
      setLoadingImages(prev => new Set(prev).add(imgPath))
      const base64 = await fetchImageAsBase64(imgPath)
      setLoadingImages(prev => {
        const newSet = new Set(prev)
        newSet.delete(imgPath)
        return newSet
      })
      if (base64) {
        newImageData.set(imgPath, base64)
      }
    })

    await Promise.all(imagePromises)
    setImageData(newImageData)
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return (
          <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-500 text-white hover:bg-amber-600 shadow-sm">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-rose-500 text-white hover:bg-rose-600 shadow-sm">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge className="bg-slate-500 text-white">{status}</Badge>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return "border-l-emerald-500 bg-emerald-50/50"
      case "pending": return "border-l-amber-500 bg-amber-50/50"
      case "rejected": return "border-l-rose-500 bg-rose-50/50"
      default: return "border-l-slate-500 bg-slate-50/50"
    }
  }

  const getCategoryForType = (type: string): typeof categories[0] | null => {
    const category = categories.find(cat => 
      cat.types.some(t => type.toLowerCase().includes(t.toLowerCase()))
    )
    return category || categories.find(cat => cat.id === 'other') || null
  }

  const getCategoryApps = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (!category) return []

    if (category.id === 'other') {
      return applications.filter(app => {
        const appCategory = getCategoryForType(app.type)
        return appCategory?.id === 'other'
      })
    }

    return applications.filter(app => 
      category.types.some(t => app.type.toLowerCase().includes(t.toLowerCase()))
    )
  }

  const filterAndSortApplications = (apps: Application[]) => {
    let filtered = apps.filter((app) => {
      if (statusFilter !== "all" && app.status.toLowerCase() !== statusFilter) return false
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          app.reference_number.toLowerCase().includes(query) ||
          app.type.toLowerCase().includes(query) ||
          String(app.full_name || app.fullName || app.owner_name || "").toLowerCase().includes(query)
        )
      }
      
      return true
    })

    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case "type":
        filtered.sort((a, b) => a.type.localeCompare(b.type))
        break
    }

    return filtered
  }

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status.toLowerCase() === "pending").length,
    approved: applications.filter(a => a.status.toLowerCase() === "approved").length,
    rejected: applications.filter(a => a.status.toLowerCase() === "rejected").length,
  }

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-orange-50/20 to-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">
                {!isAuthenticated ? "Verifying authentication..." : "Loading applications..."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentCategoryApps = selectedCategory ? filterAndSortApplications(getCategoryApps(selectedCategory)) : []

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-orange-50/20 to-slate-50 pb-20 lg:pb-0">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-orange-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 flex-1">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Applications</h1>
                <p className="text-xs text-gray-500">Browse by category</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchApplications}
              className="hidden sm:flex gap-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-lg p-2.5 text-center shadow">
              <p className="text-xl font-bold text-white">{stats.total}</p>
              <p className="text-[10px] text-blue-100 font-medium">Total</p>
            </div>
            
            <div className="bg-linear-to-br from-amber-500 to-amber-600 rounded-lg p-2.5 text-center shadow">
              <p className="text-xl font-bold text-white">{stats.pending}</p>
              <p className="text-[10px] text-amber-100 font-medium">Pending</p>
            </div>
            
            <div className="bg-linear-to-br from-emerald-500 to-emerald-600 rounded-lg p-2.5 text-center shadow">
              <p className="text-xl font-bold text-white">{stats.approved}</p>
              <p className="text-[10px] text-emerald-100 font-medium">Approved</p>
            </div>
            
            <div className="bg-linear-to-br from-rose-500 to-rose-600 rounded-lg p-2.5 text-center shadow">
              <p className="text-xl font-bold text-white">{stats.rejected}</p>
              <p className="text-[10px] text-rose-100 font-medium">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-lg">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-rose-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-rose-900">Error loading applications</p>
                <p className="text-sm text-rose-700 mt-1">{error}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={fetchApplications}
                className="text-rose-700 hover:text-rose-800 hover:bg-rose-100"
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {!selectedCategory ? (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Select a Service Category</h2>
              <p className="text-gray-600">Choose a category to view your applications</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => {
                const categoryApps = getCategoryApps(category.id)
                const Icon = category.icon
                
                return (
                  <Card
                    key={category.id}
                    className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 overflow-hidden"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <div className={`h-2 bg-linear-to-r ${category.color}`} />
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${category.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <div className={`px-3 py-1 rounded-full ${category.bgColor} ${category.textColor} font-bold text-lg`}>
                          {categoryApps.length}
                        </div>
                      </div>
                      <CardTitle className="text-xl font-bold group-hover:text-orange-600 transition-colors">
                        {category.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {categoryApps.length} application{categoryApps.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 flex-wrap">
                        {['pending', 'approved', 'rejected'].map(status => {
                          const count = categoryApps.filter(a => a.status.toLowerCase() === status).length
                          if (count === 0) return null
                          return (
                            <Badge
                              key={status}
                              variant="secondary"
                              className={
                                status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                'bg-rose-100 text-rose-700'
                              }
                            >
                              {count} {status}
                            </Badge>
                          )
                        })}
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full mt-4 group-hover:bg-orange-500 group-hover:text-white transition-colors"
                      >
                        View Applications
                        <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => setSelectedCategory(null)}
                className="mb-4 hover:bg-orange-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Categories
              </Button>

              {(() => {
                const category = categories.find(c => c.id === selectedCategory)
                const Icon = category?.icon || FileText
                return (
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-16 h-16 rounded-xl bg-linear-to-br ${category?.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{category?.name}</h2>
                      <p className="text-gray-600">{currentCategoryApps.length} application{currentCategoryApps.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                )
              })()}

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search applications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[160px] border-gray-200">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[160px] border-gray-200">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="type">By Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {currentCategoryApps.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-linear-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    <FileText className="h-10 w-10 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">
                    {searchQuery ? "No matching applications" : "No applications found"}
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {searchQuery 
                      ? "Try adjusting your search criteria or filters."
                      : statusFilter !== "all"
                      ? `You don't have any ${statusFilter} applications in this category.`
                      : "You haven't submitted any applications in this category yet."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {currentCategoryApps.map((app) => (
                  <Card 
                    key={`${app.type}-${app.id}`}
                    className={`hover:shadow-lg transition-all border-l-4 ${getStatusColor(app.status)} cursor-pointer group`}
                    onClick={() => setSelectedApp(app)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-linear-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-110 transition-transform">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-orange-600 transition-colors mb-1">
                                {app.type}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Hash className="h-3.5 w-3.5" />
                                  {app.reference_number}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {formatDate(app.created_at)}
                                </span>
                                <span className="flex items-center gap-1 truncate">
                                  <User className="h-3.5 w-3.5" />
                                  {String(app.full_name || app.fullName || app.owner_name || app.groom_name || "N/A")}
                                </span>
                              </div>
                            </div>
                            {getStatusBadge(app.status)}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-3 group-hover:bg-orange-500 group-hover:text-white transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedApp(app)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Full Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-2xl font-bold text-gray-900 mb-1">
                  {selectedApp?.type}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 text-sm">
                  <Hash className="h-4 w-4" />
                  {selectedApp?.reference_number}
                </DialogDescription>
              </div>
              {selectedApp && getStatusBadge(selectedApp.status)}
            </div>
          </DialogHeader>

          {selectedApp && (
            <div className="overflow-y-auto flex-1 px-1">
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
                    <CardContent className="p-4">
                      <p className="text-xs font-medium text-blue-700 mb-1">Status</p>
                      <div className="mt-2">{getStatusBadge(selectedApp.status)}</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-purple-500 bg-purple-50/50">
                    <CardContent className="p-4">
                      <p className="text-xs font-medium text-purple-700 mb-1">Submitted Date</p>
                      <p className="font-semibold text-purple-900 mt-2">
                        {formatDate(selectedApp.created_at)}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-teal-500 bg-teal-50/50">
                    <CardContent className="p-4">
                      <p className="text-xs font-medium text-teal-700 mb-1">Application ID</p>
                      <p className="font-semibold text-teal-900 mt-2">#{selectedApp.id}</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">Application Details</h3>
                  </div>
                  
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-0 divide-y">
                      {Object.entries(selectedApp).map(([key, value]) => {
                        if ([
                          "id", 
                          "type", 
                          "created_at", 
                          "status", 
                          "reference_number", 
                          "user_id",
                          "user",
                          "updated_at",
                          "deleted_at"
                        ].includes(key)) {
                          return null
                        }
                        
                        if (key.toLowerCase().includes('_url') && (
                          key.toLowerCase().includes('building') ||
                          key.toLowerCase().includes('land') ||
                          key.toLowerCase().includes('title') ||
                          key.toLowerCase().includes('plan')
                        )) {
                          return null
                        }
                        
                        const isImagePath = value && typeof value === 'string' && (
                          value.includes('uploads/') || 
                          value.includes('medical-assistance-documents/') ||
                          value.includes('.jpg') || 
                          value.includes('.jpeg') || 
                          value.includes('.png') || 
                          value.includes('.gif') || 
                          value.includes('.webp') ||
                          value.includes('.pdf') ||
                          key.includes('photo') || 
                          key.includes('image') || 
                          key.includes('picture') ||
                          key.includes('supporting') ||
                          (key.includes('document') && value.match(/\.(jpg|jpeg|png|gif|webp|pdf)$/i))
                        )
                        
                        const isPdfFile = value && typeof value === 'string' && value.match(/\.pdf$/i)
                        
                        if (isImagePath) {
                          return (
                            <div key={key} className="flex flex-col py-3 px-4 hover:bg-gray-50 transition-colors">
                              <dt className="text-sm font-semibold text-gray-700 capitalize mb-2">
                                {key.replace(/_/g, " ")}
                              </dt>
                              <dd className="text-sm text-gray-900">
                                {isPdfFile ? (
                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                      <FileText className="h-5 w-5 text-blue-600" />
                                      <span className="text-sm font-medium text-blue-900">PDF Document</span>
                                    </div>
                                    <a
                                      href={`${IMAGE_BASE_URL}/${value}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors w-fit"
                                    >
                                      <Eye className="h-4 w-4" />
                                      View PDF Document
                                    </a>
                                  </div>
                                ) : (
                                  <div className="relative w-full max-w-md h-64 rounded-lg overflow-hidden border shadow-sm bg-gray-50">
                                    <img
                                      src={`${IMAGE_BASE_URL}/${value}`}
                                      alt={key}
                                      className="w-full h-full object-contain"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        console.error('Failed to load image:', value)
                                        target.src = '/placeholder.png'
                                      }}
                                    />
                                  </div>
                                )}
                              </dd>
                            </div>
                          )
                        }
                        
                        return (
                          <div key={key} className="flex py-3 px-4 hover:bg-gray-50 transition-colors">
                            <dt className="text-sm font-semibold text-gray-700 capitalize w-1/3 flex-shrink-0">
                              {key.replace(/_/g, " ")}
                            </dt>
                            <dd className="text-sm text-gray-900 flex-1 break-words">
                              {(() => {
                                if (value && typeof value === 'string') {
                                  const datePattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}.*)?$/
                                  if (datePattern.test(value)) {
                                    const date = new Date(value)
                                    if (!isNaN(date.getTime())) {
                                      return formatDate(value)
                                    }
                                  }
                                }
                                return String(value || "N/A")
                              })()}
                            </dd>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ApplicationsPage() {
  return (
    <MemberLayout>
      <Suspense fallback={
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-orange-50/20 to-slate-50 flex items-center justify-center">
          <Card className="w-full max-w-md border-0 shadow-xl">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-medium">Loading...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      }>
        <ApplicationsContent />
      </Suspense>
    </MemberLayout>
  )
}