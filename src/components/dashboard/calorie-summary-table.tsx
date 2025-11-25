"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame } from "lucide-react"

interface MealLog {
  id: string
  date: string
  type: string
  mealName: string
  qty: number
  calories: number
}

interface DailySummary {
  [date: string]: {
    [mealType: string]: number
  }
}

export default function CalorieSummaryTable({ token }: { token: string | null }) {
  const [logs, setLogs] = useState<MealLog[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<DailySummary>({})

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
    const summaryData: DailySummary = {}

    logs.forEach((log) => {
      const date = new Date(log.date).toLocaleDateString("en-GB")
      if (!summaryData[date]) {
        summaryData[date] = {}
      }
      if (!summaryData[date][log.type]) {
        summaryData[date][log.type] = 0
      }
      summaryData[date][log.type] += log.calories
    })

    setSummary(summaryData)
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  // Get all unique meal types
  const allMealTypes = Array.from(new Set(logs.map((log) => log.type))).sort()

  const sortedDates = Object.keys(summary).sort((a, b) => {
    const dateA = new Date(a.split("/").reverse().join("-"))
    const dateB = new Date(b.split("/").reverse().join("-"))
    return dateB.getTime() - dateA.getTime()
  })

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-primary/10">
        <CardTitle className="flex items-center gap-2">
          <Flame size={20} className="text-primary" />
          SUM of calories Type
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {sortedDates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No meal data available yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-primary/20 bg-green-50 dark:bg-green-950/20">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Date</th>
                  {allMealTypes.map((type) => (
                    <th key={type} className="px-4 py-3 text-center font-semibold text-foreground">
                      {type}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center font-semibold text-foreground">Grand Total</th>
                </tr>
              </thead>
              <tbody>
                {sortedDates.map((date) => {
                  const dayData = summary[date]
                  const total = Object.values(dayData).reduce((sum, cal) => sum + cal, 0)

                  return (
                    <tr key={date} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{date}</td>
                      {allMealTypes.map((type) => (
                        <td key={type} className="px-4 py-3 text-center text-foreground">
                          {dayData[type] ? dayData[type].toLocaleString() : "-"}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center font-semibold text-primary">{total.toLocaleString()}</td>
                    </tr>
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
