"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Filter, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react"
import Link from "next/link"
import MemberLayout from "@/components/memberLayout"
interface Report {
  id: string
  title: string
  category: string
  status: "pending" | "in-progress" | "resolved" | "rejected"
  urgency: "low" | "medium" | "high"
  date: string
  location: string
}

export default function MyReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch reports from Laravel backend
    const fetchReports = async () => {
      try {
        const response = await fetch("/api/reports/user")
        const data = await response.json()
        setReports(data.reports || [])
      } catch (error) {
        console.error("[v0] Error fetching reports:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />
      case "in-progress":
        return <AlertCircle className="w-5 h-5 text-blue-600" />
      case "resolved":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const filteredReports = filter === "all" ? reports : reports.filter((report) => report.status === filter)

  return (
    < MemberLayout>
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-orange-600 text-white px-4 py-4">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/dashboard/member/">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">My Reports</h1>
        </div>
        <p className="text-orange-100 text-sm">Track your submitted reports</p>
      </header>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 overflow-x-auto">
        <div className="flex gap-2">
          {[
            { value: "all", label: "All" },
            { value: "pending", label: "Pending" },
            { value: "in-progress", label: "In Progress" },
            { value: "resolved", label: "Resolved" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
                filter === tab.value ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading reports...</p>
            </div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Filter className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-600 text-center mb-6 max-w-sm">
              {filter === "all" ? "You haven't submitted any reports yet." : `No ${filter} reports at the moment.`}
            </p>
            <Link href="/dashboard/member/report-issue" className="bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold">
              Submit a Report
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Link
                key={report.id}
                href={`/dashboard/member/view-reports/${report.id}`}
                className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{report.title}</h3>
                    <p className="text-sm text-gray-600">{report.location}</p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(report.status)}`}
                  >
                    {report.status.replace("-", " ").toUpperCase()}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(report.status)}
                      <span className="text-xs text-gray-600">{report.date}</span>
                    </div>
                    <span className={`text-xs font-semibold ${getUrgencyColor(report.urgency)}`}>
                      {report.urgency.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{report.category}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

     
    </div>
    </ MemberLayout>
  )
}
