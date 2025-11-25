"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Settings } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Login failed")
        return
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      router.push("/dashboard")
    } catch (err) {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ backgroundColor: "#1C1C1E" }}>
      <div className="hidden lg:flex w-1/2 relative items-end justify-start p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-pink-900/40 to-blue-900/40" />

        <div className="relative z-10 w-full">
          <div className="mb-16">
            <p className="text-white text-sm tracking-widest mb-8 font-bold">A WISE QUOTE</p>
            <h1 className="text-white text-6xl font-bold leading-tight mb-6">
              Get
              <br />
              Everything
              <br />
              You Want
            </h1>
            <p className="text-white/80 text-sm leading-relaxed max-w-xs font-medium">
              You can get everything you want if you work hard,
              <br />
              trust the process, and stick to the plan.
            </p>
          </div>
        </div>
      </div>

      <div
        className="w-full lg:w-1/2 flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-16"
        style={{ backgroundColor: "#1C1C1E" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div></div>
          <div className="flex items-center gap-2 text-gray-300">
            <Settings size={20} />
            <span className="text-sm font-bold">DailyCalories</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-md mx-auto w-full lg:max-w-none">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white mb-3">Welcome Back</h2>
            <p className="text-gray-400 text-sm font-medium">Enter your email and password to access your account</p>
          </div>

          {/* Error Message */}
          {error && <div className="mb-6 p-3 bg-red-900/30 text-red-400 text-sm rounded-lg font-medium">{error}</div>}

          {/* Email Field */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-white mb-2">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition"
              style={{ backgroundColor: "#2C2C2E" }}
            />
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-white mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition pr-12"
                style={{ backgroundColor: "#2C2C2E" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between mb-8 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 border border-gray-600 rounded cursor-pointer"
                style={{ backgroundColor: "#2C2C2E" }}
              />
              <span className="text-gray-300 font-medium">Remember me</span>
            </label>
            <a href="#" className="text-white font-bold hover:text-gray-300 transition">
              Forgot Password
            </a>
          </div>

          {/* Sign In Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-white text-gray-950 py-3 rounded-full font-bold mb-4 hover:bg-gray-100 transition disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-white font-bold hover:text-gray-300 transition">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
