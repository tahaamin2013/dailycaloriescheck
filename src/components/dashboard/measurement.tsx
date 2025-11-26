"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Edit2, Save, X, Ruler } from "lucide-react"

interface Measurement {
  id: string
  date: string
  height: number
  heightUnit: "cm" | "inches"
  weight: number
  notes?: string
}

export default function MeasurementsTab({ token }: { token: string | null }) {
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    height: "",
    heightUnit: "cm" as "cm" | "inches",
    weight: "",
    notes: "",
  })

  useEffect(() => {
    fetchMeasurements()
  }, [token])

  const fetchMeasurements = async () => {
    if (!token) return
    try {
      const res = await fetch("/api/measurements", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setMeasurements(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error fetching measurements:", error)
      setMeasurements([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !formData.height || !formData.weight) return

    try {
      const url = editingId ? `/api/measurements/${editingId}` : "/api/measurements"
      const method = editingId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: new Date(formData.date),
          height: Number.parseFloat(formData.height),
          heightUnit: formData.heightUnit,
          weight: Number.parseFloat(formData.weight),
          notes: formData.notes,
        }),
      })

      if (res.ok) {
        fetchMeasurements()
        setFormData({
          date: new Date().toISOString().split("T")[0],
          height: "",
          heightUnit: "cm",
          weight: "",
          notes: "",
        })
        setShowForm(false)
        setEditingId(null)
      }
    } catch (error) {
      console.error("Error saving measurement:", error)
    }
  }

  const handleEdit = (measurement: Measurement) => {
    setFormData({
      date: measurement.date.split("T")[0],
      height: measurement.height.toString(),
      heightUnit: measurement.heightUnit,
      weight: measurement.weight.toString(),
      notes: measurement.notes || "",
    })
    setEditingId(measurement.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!token) return
    try {
      const res = await fetch(`/api/measurements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        fetchMeasurements()
      }
    } catch (error) {
      console.error("Error deleting measurement:", error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Measurements</h2>
          <p className="text-muted-foreground">Track your height and weight progress</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90">
          + Add Measurement
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 border-primary/20">
          <h3 className="font-semibold mb-4">{editingId ? "Edit Measurement" : "Add New Measurement"}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Height</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="170"
                    step="0.1"
                    className="flex-1 px-3 py-2 border border-input rounded-md bg-background"
                    required
                  />
                  <select
                    value={formData.heightUnit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        heightUnit: e.target.value as "cm" | "inches",
                      })
                    }
                    className="px-3 py-2 border border-input rounded-md bg-background w-24"
                  >
                    <option value="cm">CM</option>
                    <option value="inches">Inches</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Weight (kg)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="70"
                  step="0.1"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (Optional)</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any notes..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="bg-primary hover:bg-primary/90 gap-2">
                <Save size={18} />
                {editingId ? "Update" : "Save"} Measurement
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setFormData({
                    date: new Date().toISOString().split("T")[0],
                    height: "",
                    heightUnit: "cm",
                    weight: "",
                    notes: "",
                  })
                }}
              >
                <X size={18} />
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {measurements.length === 0 ? (
          <div className="text-center py-12">
            <Ruler size={48} className="mx-auto text-primary/30 mb-3" />
            <p className="text-muted-foreground mb-2">No measurements recorded yet</p>
            <p className="text-sm text-muted-foreground">
              Start tracking your progress by adding your first measurement
            </p>
          </div>
        ) : (
          measurements.map((measurement) => (
            <Card key={measurement.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{new Date(measurement.date).toLocaleDateString()}</p>
                    <div className="flex gap-6 mt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Height</p>
                        <p className="font-semibold text-lg">
                          {measurement.height} {measurement.heightUnit}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Weight</p>
                        <p className="font-semibold text-lg">{measurement.weight} kg</p>
                      </div>
                    </div>
                    {measurement.notes && (
                      <p className="text-sm text-muted-foreground mt-2 italic">{measurement.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(measurement)}
                      className="p-2 hover:bg-secondary rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(measurement.id)}
                      className="p-2 hover:bg-destructive/10 text-destructive rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
