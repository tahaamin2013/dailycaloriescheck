"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Flame, Calendar, Zap } from "lucide-react"

interface MealLog {
  id: string
  date: string
  type: string
  mealName: string
  qty: number
  calories: number
}

export default function AnalyticsTab({ token }: { token: string | null }) {
  const [logs, setLogs] = useState<MealLog[]>([])
  const [loading, setLoading] = useState(true)
  const [dailyData, setDailyData] = useState<any[]>([])
  const [typeData, setTypeData] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalCalories: 0,
    avgDaily: 0,
    totalDays: 0,
    highestDay: 0,
  })

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    if (!token) return
    try {
      const res = await fetch("/api/meal-logs", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setLogs(data)
      processData(data)
    } catch (error) {
      console.error("Error fetching logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const processData = (logs: MealLog[]) => {
    const dailyTotals: Record<string, number> = {}
    const typeBreakdown: Record<string, number> = {}
    let highestDay = 0

    logs.forEach((log) => {
      const date = new Date(log.date).toLocaleDateString()
      dailyTotals[date] = (dailyTotals[date] || 0) + log.calories
      typeBreakdown[log.type] = (typeBreakdown[log.type] || 0) + log.calories
      highestDay = Math.max(highestDay, dailyTotals[date])
    })

    const daily = Object.entries(dailyTotals).map(([date, calories]) => ({
      date,
      calories,
    }))

    const types = Object.entries(typeBreakdown).map(([type, calories]) => ({
      name: type,
      value: calories,
    }))

    setDailyData(daily)
    setTypeData(types)

    const totalCalories = Object.values(dailyTotals).reduce((a, b) => a + b, 0)
    const avgDaily = totalCalories / Object.keys(dailyTotals).length || 0

    setStats({
      totalCalories,
      avgDaily: Math.round(avgDaily),
      totalDays: Object.keys(dailyTotals).length,
      highestDay,
    })
  }

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>
  }

  const colors = ["#FF6900", "#00D9FF", "#00FF88", "#FFD700", "#FF00FF"]

  const statCards = [
    {
      label: "Total Calories",
      value: stats.totalCalories,
      icon: Flame,
      color: "from-primary/20 to-primary/5",
    },
    {
      label: "Daily Average",
      value: `${stats.avgDaily} cal`,
      icon: TrendingUp,
      color: "from-blue-500/20 to-blue-500/5",
    },
    {
      label: "Days Tracked",
      value: stats.totalDays,
      icon: Calendar,
      color: "from-green-500/20 to-green-500/5",
    },
    {
      label: "Peak Day",
      value: `${stats.highestDay} cal`,
      icon: Zap,
      color: "from-yellow-500/20 to-yellow-500/5",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Track your calorie trends and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card
              key={idx}
              className={`bg-transparent hover:shadow-lg transition-shadow`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon size={24} className="text-primary" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Calories Line Chart */}
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader className="border-b border-primary/10">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              Daily Calorie Intake
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
                  <Line
                    type="monotone"
                    dataKey="calories"
                    stroke="#FF6900"
                    strokeWidth={3}
                    dot={{ fill: "#FF6900", r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Calories"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">No data yet</div>
            )}
          </CardContent>
        </Card>

        {/* Meal Type Breakdown Pie Chart */}
        <Card className="shadow-lg">
          <CardHeader className="border-b border-primary/10">
            <CardTitle className="flex items-center gap-2">
              <Flame size={20} className="text-primary" />
              Meal Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">No data yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart for Meal Types */}
      <Card className="shadow-lg">
        <CardHeader className="border-b border-primary/10">
          <CardTitle className="flex items-center gap-2">
            <Zap size={20} className="text-primary" />
            Calories by Meal Type
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" style={{ fontSize: "12px" }} />
                <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="value" fill="#FF6900" name="Calories" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">No data yet</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
