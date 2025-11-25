"use client"

import { useState, Suspense } from "react"
import Sidebar from "@/components/sidebar"
import DataTab from "@/components/dashboard/data-tab"
import HomeTab from "@/components/dashboard/home-tab"
import AnalyticsTab from "@/components/dashboard/analytics-tab"

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<"home" | "data" | "analytics">("home")

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Daily Calorie Tracker</h2>
            <p className="text-muted-foreground mt-2">Track and manage your daily calorie intake</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 border-b border-border">
            <button
              onClick={() => setActiveTab("home")}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === "home"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Food List
            </button>
            <button
              onClick={() => setActiveTab("data")}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === "data"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Daily Log
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === "analytics"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Analytics
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {activeTab === "home" && <HomeTab token={null} />}
            {activeTab === "data" && <DataTab token={null} />}
            {activeTab === "analytics" && <AnalyticsTab token={null} />}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
