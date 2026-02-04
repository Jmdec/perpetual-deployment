"use client"

import { useEffect, useState } from "react"
import {
  Users,
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  BarChart3,
  Activity,
  TrendingUp,
  TrendingDown,
  Newspaper,
  Bell,
} from "lucide-react"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import AdminLayout from "@/components/adminLayout"

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  issuedCertificates: number
  pendingApprovals: number
}

interface User {
  id: number
  status: "pending" | "approved" | "rejected" | "deactivated"
  created_at: string
}

interface News {
  id: number
  status: "draft" | "published" | "archived"
  category: string
  created_at: string
}

interface Announcement {
  id: number
  category: string
  is_active: boolean
  created_at: string
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    issuedCertificates: 0,
    pendingApprovals: 0,
  })

  const [userStatusChart, setUserStatusChart] = useState<any[]>([])
  const [newsPieChart, setNewsPieChart] = useState<any[]>([])
  const [weeklyRegistrationChart, setWeeklyRegistrationChart] = useState<any[]>([])
  const [announcementCategoryChart, setAnnouncementCategoryChart] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch all data in parallel
      const [usersRes, newsRes, announcementsRes] = await Promise.all([
        fetch("/api/users", { credentials: "include" }),
        fetch("/api/admin/news", { credentials: "include" }),
        fetch("/api/announcements", { credentials: "include" }),
      ])

      // Parse responses
      const usersJson = await usersRes.json()
      const newsJson = await newsRes.json()
      const announcementsJson = await announcementsRes.json()

      // Extract data arrays
      const users: User[] = usersJson.data && Array.isArray(usersJson.data) ? usersJson.data : (usersJson.data?.data || [])
      const news: News[] = newsJson.data && Array.isArray(newsJson.data) ? newsJson.data : (newsJson.data?.data || [])
      const announcements: Announcement[] = announcementsJson.data && Array.isArray(announcementsJson.data) ? announcementsJson.data : (announcementsJson.data?.data || [])

      /* ===== USERS STATS ===== */
      const approvedUsers = users.filter((u) => u.status === "approved").length
      const pendingUsers = users.filter((u) => u.status === "pending").length
      const rejectedUsers = users.filter((u) => u.status === "rejected").length
      const deactivatedUsers = users.filter((u) => u.status === "deactivated").length

      setStats({
        totalUsers: users.length,
        activeUsers: approvedUsers,
        issuedCertificates: news.filter((n) => n.status === "published").length,
        pendingApprovals: pendingUsers,
      })

      // User Status Chart
      setUserStatusChart([
        { name: "Pending", value: pendingUsers, color: "#f59e0b" },
        { name: "Approved", value: approvedUsers, color: "#10b981" },
        { name: "Rejected", value: rejectedUsers, color: "#ef4444" },
        { name: "Deactivated", value: deactivatedUsers, color: "#6b7280" },
      ])

      /* ===== WEEKLY REGISTRATION ===== */
      const weeklyMap: Record<string, number> = {
        Mon: 0,
        Tue: 0,
        Wed: 0,
        Thu: 0,
        Fri: 0,
        Sat: 0,
        Sun: 0,
      }

      users.forEach((u) => {
        const day = new Date(u.created_at).toLocaleDateString("en-US", { weekday: "short" })
        if (weeklyMap[day] !== undefined) weeklyMap[day]++
      })

      setWeeklyRegistrationChart(
        Object.entries(weeklyMap).map(([day, value]) => ({ day, value }))
      )

      /* ===== NEWS & ANNOUNCEMENTS ===== */
      const publishedNews = news.filter((n) => n.status === "published").length
      const draftNews = news.filter((n) => n.status === "draft").length
      const archivedNews = news.filter((n) => n.status === "archived").length

      setNewsPieChart([
        { name: "Published", value: publishedNews, color: "#10b981" },
        { name: "Drafts", value: draftNews, color: "#6b7280" },
        { name: "Archived", value: archivedNews, color: "#f59e0b" },
      ])

      /* ===== ANNOUNCEMENT CATEGORIES ===== */
      const announcementMap: Record<string, number> = {}

      announcements.forEach((a) => {
        const category = a.category || "Other"
        announcementMap[category] = (announcementMap[category] || 0) + 1
      })

      setAnnouncementCategoryChart(
        Object.entries(announcementMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
      )
    } catch (err) {
      console.error("Dashboard error:", err)
    } finally {
      setLoading(false)
    }
  }

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500">Overview of system statistics</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ===== STATS CARDS ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="blue"
            trend="+12%"
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon={CheckCircle}
            color="green"
            trend="+8%"
          />
          <StatCard
            title="Issued Certificates"
            value={stats.issuedCertificates}
            icon={FileCheck}
            color="purple"
            trend="+15%"
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={Clock}
            color="orange"
            trend="-5%"
          />
        </div>

        {/* ===== CHARTS ROW 1 ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Status Breakdown */}
          <ChartCard title="User Status Distribution" icon={Users}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userStatusChart}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {userStatusChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* News Status */}
          <ChartCard title="News & Articles Status" icon={Newspaper}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={newsPieChart}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {newsPieChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ===== CHARTS ROW 2 ===== */}
        <div className="grid grid-cols-1 gap-6">
          {/* Weekly Registration */}
          <ChartCard title="Weekly Registration Activity" icon={Calendar}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyRegistrationChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#7c3aed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Announcement Categories */}
          <ChartCard title="Announcements by Category" icon={Bell}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={announcementCategoryChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#ea580c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ===== ACTIVITY SUMMARY ===== */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-600" />
            Quick Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryItem
              label="Total Registered Users"
              value={stats.totalUsers}
              description="All users in the system"
            />
            <SummaryItem
              label="Approval Rate"
              value={`${stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%`}
              description="Approved vs total users"
            />
            <SummaryItem
              label="Pending Review"
              value={stats.pendingApprovals}
              description="Awaiting admin action"
            />
          </div>
        </div>
      </div>
    </div>
    </AdminLayout>
  )
}

/* ================= HELPER COMPONENTS ================= */

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  }

  const trendColors: Record<string, string> = {
    positive: "text-green-600",
    negative: "text-red-600",
  }

  const isPositive = trend && trend.startsWith("+")

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? trendColors.positive : trendColors.negative}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600 mt-1">{title}</p>
      </div>
    </div>
  )
}

const ChartCard = ({ title, icon: Icon, children }: any) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
      <Icon className="w-5 h-5 text-orange-600" />
      {title}
    </h2>
    {children}
  </div>
)

const SummaryItem = ({ label, value, description }: any) => (
  <div className="p-4 bg-gray-50 rounded-lg">
    <p className="text-sm text-gray-600 mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-xs text-gray-500 mt-1">{description}</p>
  </div>
)