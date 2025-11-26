"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, Edit2, Save, X } from "lucide-react"

interface Meal {
  id: string
  name: string
  calories: number
  unit: string
  qty: number
}

interface MealLog {
  id: string
  date: string
  type: string
  mealName: string
  qty: number
  calories: number
  notes?: string
}

export default function DataTab({ token }: { token: string | null }) {
  const [meals, setMeals] = useState<Meal[]>([])
  const [logs, setLogs] = useState<MealLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "Breakfast",
    mealName: "",
    qty: "1",
    notes: "",
  })

  useEffect(() => {
    fetchMeals()
    fetchLogs()
  }, [])

  const fetchMeals = async () => {
    if (!token) return
    try {
      const res = await fetch("/api/meals", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setMeals(Array.isArray(data) ? data : [])
      console.log("[v0] Meals fetched:", Array.isArray(data) ? data.length : "not an array", data)
    } catch (error) {
      console.error("Error fetching meals:", error)
      setMeals([])
    }
  }

  const fetchLogs = async () => {
    if (!token) return
    try {
      const res = await fetch("/api/meal-logs", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setLogs(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching logs:", error)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const getCaloriesForMeal = (mealName: string): number => {
    const meal = meals.find((m) => m.name === mealName)
    return meal ? meal.calories : 0
  }

  const getTotalCalories = (mealName: string, qty: number): number => {
    const baseCalories = getCaloriesForMeal(mealName)
    return baseCalories * qty
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !formData.mealName) return

    const qty = Number.parseInt(formData.qty)
    const calories = getTotalCalories(formData.mealName, qty)

    try {
      const url = editingId ? `/api/meal-logs/${editingId}` : "/api/meal-logs"
      const method = editingId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: new Date(formData.date),
          type: formData.type,
          mealName: formData.mealName,
          qty,
          calories,
          notes: formData.notes,
        }),
      })

      if (res.ok) {
        fetchLogs()
        setFormData({
          date: new Date().toISOString().split("T")[0],
          type: "Breakfast",
          mealName: "",
          qty: "1",
          notes: "",
        })
        setShowForm(false)
        setEditingId(null)
      }
    } catch (error) {
      console.error("Error saving log:", error)
    }
  }

  const handleEdit = (log: MealLog) => {
    setFormData({
      date: log.date.split("T")[0],
      type: log.type,
      mealName: log.mealName,
      qty: log.qty.toString(),
      notes: log.notes || "",
    })
    setEditingId(log.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!token) return
    try {
      const res = await fetch(`/api/meal-logs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        fetchLogs()
      }
    } catch (error) {
      console.error("Error deleting log:", error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  const groupedLogs = logs.reduce(
    (acc, log) => {
      const date = new Date(log.date).toLocaleDateString()
      if (!acc[date]) acc[date] = []
      acc[date].push(log)
      return acc
    },
    {} as Record<string, MealLog[]>,
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Daily Log</h2>
          <p className="text-muted-foreground">Log your meals with automatic calorie calculation</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90">
          + Log Meal
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 border-primary/20">
          <h3 className="font-semibold mb-4">{editingId ? "Edit Meal Log" : "Log New Meal"}</h3>
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
                <label className="text-sm font-medium">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option>Breakfast</option>
                  <option>Brunch</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Supper</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Meal (from Food List)</label>
                <select
                  value={formData.mealName}
                  onChange={(e) => setFormData({ ...formData, mealName: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  required
                >
                  <option value="">Select a meal...</option>
                  {meals.map((meal) => (
                    <option key={meal.id} value={meal.name}>
                      {meal.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Qty</label>
                <input
                  type="number"
                  value={formData.qty}
                  onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  min="1"
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Calories (Auto-calculated)</label>
                <div className="px-3 py-2 border border-input rounded-md bg-secondary/20 text-primary font-semibold">
                  {getTotalCalories(formData.mealName, Number.parseInt(formData.qty) || 1)} kcal
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any notes..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background h-20 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="bg-primary hover:bg-primary/90 gap-2">
                <Save size={18} />
                {editingId ? "Update" : "Save"} Meal
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setFormData({
                    date: new Date().toISOString().split("T")[0],
                    type: "Breakfast",
                    mealName: "",
                    qty: "1",
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

      <div className="space-y-4">
        {Object.keys(groupedLogs).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No meals logged yet. Start tracking your calories!
          </div>
        ) : (
          Object.entries(groupedLogs).map(([date, dateLogs]) => (
            <div key={date} className="space-y-2">
              <h3 className="font-semibold text-lg text-primary">{date}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Meal</th>
                      <th className="px-4 py-2 text-center">Qty</th>
                      <th className="px-4 py-2 text-right">Calories</th>
                      <th className="px-4 py-2 text-center">Notes</th>
                      <th className="px-4 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dateLogs.map((log) => (
                      <tr key={log.id} className="border-b border-border hover:bg-secondary/10 transition-colors">
                        <td className="px-4 py-2 font-medium">{new Date(log.date).toLocaleDateString()}</td>
                        <td className="px-4 py-2">{log.type}</td>
                        <td className="px-4 py-2">{log.mealName}</td>
                        <td className="px-4 py-2 text-center">{log.qty}</td>
                        <td className="px-4 py-2 text-right font-semibold text-primary">{log.calories}</td>
                        <td className="px-4 py-2 text-center text-xs text-muted-foreground">{log.notes || "-"}</td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEdit(log)}
                              className="p-1 hover:bg-secondary rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(log.id)}
                              className="p-1 hover:bg-destructive/10 text-destructive rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-right pr-4 py-2 font-semibold">
                Daily Total:{" "}
                <span className="text-primary">{dateLogs.reduce((sum, m) => sum + m.calories, 0)} kcal</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
