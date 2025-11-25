"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Plus, TrendingDown } from "lucide-react"

interface WeightRecord {
  id: string
  weight: number
  date: string
  notes?: string
}

export default function WeightTab({ token }: { token: string | null }) {
  const [weights, setWeights] = useState<WeightRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    weight: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  })

  useEffect(() => {
    fetchWeights()
  }, [token])

  const fetchWeights = async () => {
    if (!token) return
    try {
      const res = await fetch("/api/weight", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setWeights(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error fetching weights:", err)
      setWeights([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!token) {
      setError("No authentication token found")
      return
    }

    if (!formData.weight || isNaN(Number.parseFloat(formData.weight))) {
      setError("Please enter a valid weight")
      return
    }

    try {
      const res = await fetch("/api/weight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          weight: Number.parseFloat(formData.weight),
          date: formData.date,
          notes: formData.notes || null,
        }),
      })

      if (!res.ok) {
        setError("Failed to save weight")
        return
      }

      const newWeight = await res.json()
      setWeights([newWeight, ...weights])
      setFormData({ weight: "", date: new Date().toISOString().split("T")[0], notes: "" })
      setShowForm(false)
      setSuccess("Weight recorded successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save weight")
    }
  }

  const chartData = weights
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((w) => ({
      date: new Date(w.date).toLocaleDateString(),
      weight: w.weight,
    }))

  const stats =
    weights.length > 0
      ? {
          current: weights[0].weight,
          min: Math.min(...weights.map((w) => w.weight)),
          max: Math.max(...weights.map((w) => w.weight)),
          avg: (weights.reduce((sum, w) => sum + w.weight, 0) / weights.length).toFixed(1),
        }
      : null

  if (loading) {
    return <div className="text-center py-8">Loading weight data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Weight Tracking</h2>
          <p className="text-muted-foreground text-sm mt-1">Monitor your weight progress</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 text-white shadow-lg gap-2"
        >
          <Plus size={18} />
          Add Weight
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20 bg-gradient-to-br from-card to-secondary/20 shadow-lg">
          <CardHeader className="border-b border-primary/10">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown size={20} className="text-primary" />
              Record Weight
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

            <form onSubmit={handleAddWeight} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="70"
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
                  Save Weight
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Current Weight</p>
              <p className="text-3xl font-bold text-foreground">{stats.current} kg</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/20">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Minimum</p>
              <p className="text-3xl font-bold text-foreground">{stats.min} kg</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-orange-500/20">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Maximum</p>
              <p className="text-3xl font-bold text-foreground">{stats.max} kg</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/20">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Average</p>
              <p className="text-3xl font-bold text-foreground">{stats.avg} kg</p>
            </CardContent>
          </Card>
        </div>
      )}

      {chartData.length > 0 ? (
        <Card className="shadow-lg">
          <CardHeader className="border-b border-primary/10">
            <CardTitle className="flex items-center gap-2">
              <TrendingDown size={20} className="text-primary" />
              Weight Trend
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
                  dataKey="weight"
                  stroke="#EF4444"
                  strokeWidth={3}
                  dot={{ fill: "#EF4444", r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Weight (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg">
          <CardContent className="py-12 text-center">
            <TrendingDown size={48} className="mx-auto text-primary/30 mb-3" />
            <p className="text-muted-foreground">No weight data yet. Start tracking your weight!</p>
          </CardContent>
        </Card>
      )}

      {weights.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader className="border-b border-primary/10">
            <CardTitle>Weight Records</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {weights.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-secondary/50"
                >
                  <div>
                    <p className="font-semibold">{record.weight} kg</p>
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
