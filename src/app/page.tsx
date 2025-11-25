"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import DataTab from "@/components/dashboard/data-tab"
import HomeTab from "@/components/dashboard/home-tab"
import AnalyticsTab from "@/components/dashboard/analytics-tab"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"home" | "data" | "analytics">("home")

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 w-full md:ml-64 p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Daily Calorie Tracker</h2>
            <p className="text-muted-foreground text-sm md:text-base mt-2">
              Track and manage your daily calorie intake
            </p>
          </div>

          {/* Tab Navigation - Responsive */}
          <div className="flex gap-2 md:gap-4 mb-6 border-b border-border overflow-x-auto">
            <button
              onClick={() => setActiveTab("home")}
              className={`px-3 md:px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap text-sm md:text-base ${
                activeTab === "home"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Food List
            </button>
            <button
              onClick={() => setActiveTab("data")}
              className={`px-3 md:px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap text-sm md:text-base ${
                activeTab === "data"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Daily Log
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-3 md:px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap text-sm md:text-base ${
                activeTab === "analytics"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Analytics
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6 w-full">
            {activeTab === "home" && <HomeTab token={null} />}
            {activeTab === "data" && <DataTab token={null} />}
            {activeTab === "analytics" && <AnalyticsTab token={null} />}
          </div>
        </div>
      </main>
    </div>
  )
}
