"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Plus, TrendingUp } from "lucide-react"

interface HeightRecord {
  id: string
  height: number
  date: string
  notes?: string
}

export default function HeightTab({ token }: { token: string | null }) {
  const [heights, setHeights] = useState<HeightRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    height: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  })

  useEffect(() => {
    fetchHeights()
  }, [token])

  const fetchHeights = async () => {
    if (!token) return
    try {
      const res = await fetch("/api/height", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setHeights(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error fetching heights:", err)
      setHeights([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddHeight = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!token) {
      setError("No authentication token found")
      return
    }

    if (!formData.height || isNaN(Number.parseFloat(formData.height))) {
      setError("Please enter a valid height")
      return
    }

    try {
      const res = await fetch("/api/height", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          height: Number.parseFloat(formData.height),
          date: formData.date,
          notes: formData.notes || null,
        }),
      })

      if (!res.ok) {
        setError("Failed to save height")
        return
      }

      const newHeight = await res.json()
      setHeights([newHeight, ...heights])
      setFormData({ height: "", date: new Date().toISOString().split("T")[0], notes: "" })
      setShowForm(false)
      setSuccess("Height recorded successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save height")
    }
  }

  const chartData = heights
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((h) => ({
      date: new Date(h.date).toLocaleDateString(),
      height: h.height,
    }))

  if (loading) {
    return <div className="text-center py-8">Loading height data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Height Tracking</h2>
          <p className="text-muted-foreground text-sm mt-1">Monitor your height over time</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 text-white shadow-lg gap-2"
        >
          <Plus size={18} />
          Add Height
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20 bg-gradient-to-br from-card to-secondary/20 shadow-lg">
          <CardHeader className="border-b border-primary/10">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              Record Height
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 text-green-600 text-sm rounded-lg">
                {success}
              </div>
            )}

            <form onSubmit={handleAddHeight} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="170"
                    required
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any notes..."
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  rows={2}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white shadow-lg">
                  Save Height
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {chartData.length > 0 ? (
        <Card className="shadow-lg">
          <CardHeader className="border-b border-primary/10">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              Height Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" style={{ fontSize: "12px" }} />
                <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="height"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6", r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Height (cm)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg">
          <CardContent className="py-12 text-center">
            <TrendingUp size={48} className="mx-auto text-primary/30 mb-3" />
            <p className="text-muted-foreground">No height data yet. Start tracking your height!</p>
          </CardContent>
        </Card>
      )}

      {heights.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader className="border-b border-primary/10">
            <CardTitle>Height Records</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {heights.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-secondary/50"
                >
                  <div>
                    <p className="font-semibold">{record.height} cm</p>
                    <p className="text-sm text-muted-foreground">{new Date(record.date).toLocaleDateString()}</p>
                    {record.notes && <p className="text-sm text-muted-foreground mt-1">{record.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
