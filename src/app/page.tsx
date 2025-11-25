"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify")
        if (response.ok) {
          // User is authenticated, redirect to dashboard
          router.push("/dashboard")
        } else {
          // User not authenticated, stay on landing page
          setIsLoading(false)
        }
      } catch (error) {
        // If auth check fails, stay on landing page
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background to-secondary">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">DC</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Daily Calorie Check</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => router.push("/login")}>
            Sign In
          </Button>
          <Button onClick={() => router.push("/signup")}>Get Started</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center md:px-12">
        <div className="max-w-2xl space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Take Control of Your{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Daily Nutrition
            </span>
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Track your daily calorie intake effortlessly. Log meals, monitor nutrition, and achieve your health goals
            with Daily Calorie Check.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button size="lg" onClick={() => router.push("/signup")}>
              Start Tracking Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push("/login")}>
              Sign In
            </Button>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-3 gap-4 pt-12">
            <div className="space-y-2">
              <div className="text-2xl">📊</div>
              <h3 className="font-semibold text-foreground">Track Meals</h3>
              <p className="text-sm text-muted-foreground">Log breakfast, lunch, dinner & snacks</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">📈</div>
              <h3 className="font-semibold text-foreground">View Analytics</h3>
              <p className="text-sm text-muted-foreground">See your daily calorie trends</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">🎯</div>
              <h3 className="font-semibold text-foreground">Reach Goals</h3>
              <p className="text-sm text-muted-foreground">Achieve your nutrition targets</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background/50 px-6 py-8 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; 2025 Daily Calorie Check. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
