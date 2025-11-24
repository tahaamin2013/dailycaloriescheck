"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Meal {
  id: string
  name: string
  calories: number
  unit: string
  qty: number
}

export default function HomeTab({ token }: { token: string | null }) {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    calories: "",
    unit: "Number",
    qty: "1",
  })

  useEffect(() => {
    fetchMeals()
  }, [])

  const fetchMeals = async () => {
    if (!token) return
    try {
      const res = await fetch("/api/meals", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setMeals(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching meals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError("")
    setSaveSuccess("")

    if (!token) {
      setSaveError("No authentication token found")
      return
    }

    if (!formData.name.trim()) {
      setSaveError("Food name is required")
      return
    }

    if (!formData.calories || Number.isNaN(Number.parseInt(formData.calories))) {
      setSaveError("Calories must be a valid number")
      return
    }

    if (!formData.qty || Number.isNaN(Number.parseInt(formData.qty))) {
      setSaveError("Quantity must be a valid number")
      return
    }

    try {
      console.log("[v0] Sending meal data:", {
        name: formData.name,
        calories: Number.parseInt(formData.calories),
        unit: formData.unit,
        qty: Number.parseInt(formData.qty),
        type: "Custom",
      })

      const res = await fetch("/api/meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          calories: Number.parseInt(formData.calories),
          qty: Number.parseInt(formData.qty),
          unit: formData.unit,
          date: new Date().toISOString(),
          type: "Custom",
        }),
      })

      console.log("[v0] API response status:", res.status)

      if (!res.ok) {
        const errorData = await res.json()
        console.error("[v0] API error:", errorData)
        setSaveError(errorData.error || `Failed to save food (${res.status})`)
        return
      }

      const newMeal = await res.json()
      console.log("[v0] Meal saved successfully:", newMeal)

      setMeals([newMeal, ...meals])
      setFormData({ name: "", calories: "", unit: "Number", qty: "1" })
      setShowForm(false)
      setSaveSuccess("Food saved successfully!")

      setTimeout(() => setSaveSuccess(""), 3000)
    } catch (error) {
      console.error("[v0] Error adding meal:", error)
      setSaveError(error instanceof Error ? error.message : "Failed to save food")
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading meals...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Food List</h2>
          <p className="text-muted-foreground">Your saved foods and meals</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90">
          + Add Food
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Add New Food</CardTitle>
          </CardHeader>
          <CardContent>
            {saveError && <div className="mb-4 p-3 bg-red-900/30 text-red-400 text-sm rounded-lg">{saveError}</div>}
            {saveSuccess && (
              <div className="mb-4 p-3 bg-green-900/30 text-green-400 text-sm rounded-lg">{saveSuccess}</div>
            )}

            <form onSubmit={handleAddMeal} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Food Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Eggs"
                    required
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Calories</label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    placeholder="77"
                    required
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option>Number</option>
                    <option>Gram</option>
                    <option>Liter</option>
                    <option>Cup</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Qty</label>
                  <input
                    type="number"
                    value={formData.qty}
                    onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                    placeholder="1"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Save Food
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Calories</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Unit</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Qty</th>
            </tr>
          </thead>
          <tbody>
            {meals.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No foods added yet
                </td>
              </tr>
            ) : (
              meals.map((meal) => (
                <tr key={meal.id} className="border-b border-border hover:bg-secondary/10 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{meal.name}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-primary">{meal.calories}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{meal.unit}</td>
                  <td className="px-4 py-3 text-sm">{meal.qty}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
