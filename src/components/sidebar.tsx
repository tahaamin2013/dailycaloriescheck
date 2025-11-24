"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, BarChart3, Database, LogOut, Flame, Moon, Sun, Palette } from "lucide-react"

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null
  const currentTab = searchParams?.get("tab") || "home"

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    }
  }, [])

  const applyTheme = (newTheme: "light" | "dark" | "system") => {
    const root = document.documentElement
    if (newTheme === "dark") {
      root.classList.add("dark")
    } else if (newTheme === "light") {
      root.classList.remove("dark")
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      prefersDark ? root.classList.add("dark") : root.classList.remove("dark")
    }
  }

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    applyTheme(newTheme)
  }

  const navItems = [
    { href: "/dashboard?tab=home", label: "Food List", tab: "home", icon: Flame },
    { href: "/dashboard?tab=data", label: "Daily Log", tab: "data", icon: Database },
    { href: "/dashboard?tab=analytics", label: "Analytics", tab: "analytics", icon: BarChart3 },
  ]

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />}

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-lg">
              <Flame size={24} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">Calorie Check</h1>
              <p className="text-xs text-muted-foreground">Track & Thrive</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentTab === item.tab

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Theme Selector */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2 mb-2">
            <Palette size={18} />
            <span className="text-sm font-medium">Theme</span>
          </div>
          <div className="flex w-fit gap-2">
            <button
              onClick={() => handleThemeChange("light")}
              className={`p-2 rounded-lg transition-colors ${
                theme === "light" ? "bg-primary text-primary-foreground" : "bg-sidebar-accent hover:bg-sidebar-accent/80"
              }`}
              title="Light"
            >
              <Sun size={18} />
            </button>
            <button
              onClick={() => handleThemeChange("dark")}
              className={`p-2 rounded-lg transition-colors ${
                theme === "dark" ? "bg-primary text-primary-foreground" : "bg-sidebar-accent hover:bg-sidebar-accent/80"
              }`}
              title="Dark"
            >
              <Moon size={18} />
            </button>
            <button
              onClick={() => handleThemeChange("system")}
              className={`p-2 rounded-lg transition-colors ${
                theme === "system" ? "bg-primary text-primary-foreground" : "bg-sidebar-accent hover:bg-sidebar-accent/80"
              }`}
              title="System"
            >
              <Palette size={18} />
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </Button>
        </div>
      </aside>
    </>
  )
}
