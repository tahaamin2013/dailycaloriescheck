"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, ChevronDown, ChevronRight } from "lucide-react"

interface MealLog {
  id: string
  date: string
  type: string
  mealName: string
  qty: number
  calories: number
}

interface MonthlySummary {
  [month: string]: {
    [day: string]: {
      [mealType: string]: number
    }
  }
}

export default function CalorieSummaryTable({ token }: { token: string | null }) {
  const [logs, setLogs] = useState<MealLog[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<MonthlySummary>({})
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchLogs()
  }, [token])

  const fetchLogs = async () => {
    if (!token) return
    try {
      const res = await fetch("/api/meal-logs", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setLogs(Array.isArray(data) ? data : [])
      processSummary(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching logs:", error)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const processSummary = (logs: MealLog[]) => {
    const summaryData: MonthlySummary = {}

    logs.forEach((log) => {
      const logDate = new Date(log.date)
      const monthKey = logDate.toLocaleString("en-US", { month: "short" })
      const day = logDate.getDate().toString()

      if (!summaryData[monthKey]) {
        summaryData[monthKey] = {}
      }
      if (!summaryData[monthKey][day]) {
        summaryData[monthKey][day] = {}
      }
      if (!summaryData[monthKey][day][log.type]) {
        summaryData[monthKey][day][log.type] = 0
      }
      summaryData[monthKey][day][log.type] += log.calories
    })

    setSummary(summaryData)
    // Expand first month by default
    const firstMonth = Object.keys(summaryData)[0]
    if (firstMonth) {
      setExpandedMonths(new Set([firstMonth]))
    }
  }

  const toggleMonth = (month: string) => {
    const newExpanded = new Set(expandedMonths)
    if (newExpanded.has(month)) {
      newExpanded.delete(month)
    } else {
      newExpanded.add(month)
    }
    setExpandedMonths(newExpanded)
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  const allMealTypes = Array.from(
    new Set(Object.values(summary).flatMap((month) => Object.values(month).flatMap((day) => Object.keys(day)))),
  ).sort()

  const sortedMonths = Object.keys(summary).sort((a, b) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months.indexOf(b) - months.indexOf(a)
  })

  const calculateDayTotal = (dayData: { [mealType: string]: number }) => {
    return Object.values(dayData).reduce((sum, cal) => sum + cal, 0)
  }

  const calculateMonthTotal = (monthData: { [day: string]: { [mealType: string]: number } }) => {
    return Object.values(monthData).reduce((sum, day) => sum + calculateDayTotal(day), 0)
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-primary/10">
        <CardTitle className="flex items-center gap-2">
          <Flame size={20} className="text-primary" />
          SUM of calories Type
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {sortedMonths.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No meal data available yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-primary/20 bg-green-50 dark:bg-green-950/20">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Date - Month</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Date - Day of the month</th>
                  {allMealTypes.map((type) => (
                    <th key={type} className="px-4 py-3 text-center font-semibold text-foreground">
                      {type}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center font-semibold text-foreground">Grand Total</th>
                </tr>
              </thead>
              <tbody>
                {sortedMonths.map((month) => {
                  const monthData = summary[month]
                  const isExpanded = expandedMonths.has(month)
                  const monthTotal = calculateMonthTotal(monthData)
                  const sortedDays = Object.keys(monthData)
                    .map(Number)
                    .sort((a, b) => b - a)

                  return (
                    <tbody key={month}>
                      <tr
                        onClick={() => toggleMonth(month)}
                        className="border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer bg-slate-50 dark:bg-slate-900/30"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown size={18} className="text-muted-foreground" />
                            ) : (
                              <ChevronRight size={18} className="text-muted-foreground" />
                            )}
                            <span className="font-semibold text-foreground">{month}</span>
                          </div>
                        </td>
                        <td></td>
                        {allMealTypes.map((type) => (
                          <td key={type} className="px-4 py-3 text-center"></td>
                        ))}
                        <td className="px-4 py-3 text-center font-semibold text-foreground">
                          {monthTotal.toLocaleString()}
                        </td>
                      </tr>

                      {isExpanded &&
                        sortedDays.map((day) => {
                          const dayData = monthData[day.toString()]
                          const dayTotal = calculateDayTotal(dayData)

                          return (
                            <tr
                              key={`${month}-${day}`}
                              className="border-b border-border hover:bg-secondary/50 transition-colors"
                            >
                              <td className="px-4 py-3"></td>
                              <td className="px-4 py-3 text-left text-foreground">{day}</td>
                              {allMealTypes.map((type) => (
                                <td key={type} className="px-4 py-3 text-center text-foreground">
                                  {dayData[type] ? dayData[type].toLocaleString() : "-"}
                                </td>
                              ))}
                              <td className="px-4 py-3 text-center font-semibold bg-pink-100 dark:bg-pink-900/30 text-foreground">
                                {dayTotal.toLocaleString()}
                              </td>
                            </tr>
                          )
                        })}

                      <tr className="border-b-2 border-primary/20 bg-green-50 dark:bg-green-950/20 font-semibold">
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-left text-foreground">Total</td>
                        {allMealTypes.map((type) => {
                          const typeTotal = Object.values(monthData).reduce((sum, day) => sum + (day[type] || 0), 0)
                          return (
                            <td key={type} className="px-4 py-3 text-center text-foreground">
                              {typeTotal > 0 ? typeTotal.toLocaleString() : "-"}
                            </td>
                          )
                        })}
                        <td className="px-4 py-3 text-center bg-green-200 dark:bg-green-900/40 text-foreground">
                          {monthTotal.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
