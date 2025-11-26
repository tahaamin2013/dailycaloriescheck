"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Sidebar from "@/components/sidebar"
import DataTab from "@/components/dashboard/data-tab"
import HomeTab from "@/components/dashboard/home-tab"
import AnalyticsTab from "@/components/dashboard/analytics-tab"
import HeightTab from "@/components/dashboard/height-tab"
import WeightTab from "@/components/dashboard/weight-tab"
import MeasurementsTab from "@/components/dashboard/measurement"

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<"home" | "data" | "analytics" | "height" | "weight" | "measurements">("home")
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
    setLoading(false)

    // Set active tab from URL
    const tab = searchParams.get("tab")
    if (tab === "data" || tab === "analytics" || tab === "height" || tab === "weight") {
      setActiveTab(tab)
    }
  }, [router, searchParams])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const token = localStorage.getItem("token")

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">Welcome Back</p>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Hey, {user?.name}!
            </h2>
            <p className="text-muted-foreground mt-2">Track your nutrition and reach your goals</p>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {activeTab === "home" && <HomeTab token={token} />}
            {activeTab === "data" && <DataTab token={token} />}
            {activeTab === "analytics" && <AnalyticsTab token={token} />}
            {activeTab === "height" && <HeightTab token={token} />}
            {activeTab === "weight" && <WeightTab token={token} />}
            {activeTab === "measurements" && <MeasurementsTab token={token} />}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
