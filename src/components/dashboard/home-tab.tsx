"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Flame } from "lucide-react"

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
  }, [token])

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
      setMeals([])
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
          type: "Custom",
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        setSaveError(errorData.error || `Failed to save food (${res.status})`)
        return
      }

      const newMeal = await res.json()
      setMeals([newMeal, ...meals])
      setFormData({ name: "", calories: "", unit: "Number", qty: "1" })
      setShowForm(false)
      setSaveSuccess("Food saved successfully!")

      setTimeout(() => setSaveSuccess(""), 3000)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save food")
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading meals...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Your Food Library</h2>
          <p className="text-muted-foreground text-sm mt-1">Create and manage your custom foods</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all gap-2"
        >
          <Plus size={18} />
          Add Food
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20 bg-gradient-to-br from-card to-secondary/20 shadow-lg">
          <CardHeader className="border-b border-primary/10">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame size={20} className="text-primary" />
              Add New Food
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {saveError && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <span>⚠️</span>
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 text-green-600 text-sm rounded-lg flex items-center gap-2">
                <span>✓</span>
                {saveSuccess}
              </div>
            )}

            <form onSubmit={handleAddMeal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Food Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Grilled Chicken"
                    required
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Calories</label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    placeholder="165"
                    required
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                  >
                    <option>Number</option>
                    <option>Gram</option>
                    <option>Liter</option>
                    <option>Cup</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Quantity</label>
                  <input
                    type="number"
                    value={formData.qty}
                    onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                    placeholder="1"
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white shadow-lg">
                  Save Food
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="hover:bg-secondary"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {meals.length === 0 ? (
        <div className="text-center py-12">
          <Flame size={48} className="mx-auto text-primary/30 mb-3" />
          <p className="text-muted-foreground mb-2">No foods added yet</p>
          <p className="text-sm text-muted-foreground">Start by adding your first food to your library</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meals.map((meal) => (
            <Card key={meal.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{meal.name}</h3>
                  <span className="text-xs font-bold text-white bg-primary px-2 py-1 rounded-full">
                    {meal.calories} cal
                  </span>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div>
                    <p className="text-xs text-muted-foreground">Unit</p>
                    <p className="font-medium text-foreground">{meal.unit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Qty</p>
                    <p className="font-medium text-foreground">{meal.qty}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
