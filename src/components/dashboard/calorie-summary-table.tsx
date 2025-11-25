"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {  TableCell, TableHead,                                                                  TableRow } from "@/components/ui/table"
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
    <Card className="shadow-lg w-fit">
      <CardHeader className="border-b border-primary/10">
        <CardTitle className="flex items-center gap-2">
          <Flame size={20} className="text-primary" />
          SUM of calories Type
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-[-35px]">
        {sortedMonths.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No meal data available yet</div>
        ) : (
          <div className="overflow-x-auto">
         {sortedMonths.map((month) => {
                  const monthData = summary[month]
                  const isExpanded = expandedMonths.has(month)
                  const monthTotal = calculateMonthTotal(monthData)
                  const sortedDays = Object.keys(monthData)
                    .map(Number)
                    .sort((a, b) => b - a)

                  return (
                    <tbody className=" w-full" key={month}>
                             <TableRow className="bg-green-50  dark:bg-green-950/20 hover:bg-green-50 dark:hover:bg-green-950/20">
                  <TableHead className="font-semibold mr-7"> Month</TableHead>
                  <TableHead className="font-semibold mr-7">Date</TableHead>
                  {allMealTypes.map((type) => (
                    <TableHead key={type} className="text-center font-semibold mr-7">
                      {type}
                    </TableHead>
                  ))}
                  <TableHead className="text-center font-semibold mr-7">Grand Total</TableHead>
                </TableRow>
                      {/* Month header row */}
                      <TableRow
                        onClick={() => toggleMonth(month)}
                        className=" w-full dark:bg-slate-900/30 hover:bg-secondary/50 cursor-pointer"
                      >
                        <TableCell className="font-semibold">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown size={18} className="text-muted-foreground" />
                            ) : (
                              <ChevronRight size={18} className="text-muted-foreground" />
                            )}
                            <span>{month}</span>
                          </div>
                        </TableCell>
                        <TableCell></TableCell>
                        {allMealTypes.map((type) => (
                                   <TableCell key={type}></TableCell>
                        ))}
                        <TableCell className="text-center font-semibold">{monthTotal.toLocaleString()}</TableCell>
                      </TableRow>

                      {/* Day rows */}
                      {isExpanded &&
                        sortedDays.map((day) => {
                          const dayData = monthData[day.toString()]
                          const dayTotal = calculateDayTotal(dayData)

                          return (
                            <TableRow key={`${month}-${day}`} className="hover:bg-secondary/50">
                              <TableCell></TableCell>
                              <TableCell>{day}</TableCell>
                              {allMealTypes.map((type) => (
                                <TableCell key={type} className="text-center">
                                  {dayData[type] ? dayData[type].toLocaleString() : "-"}
                                </TableCell>
                              ))}
                              <TableCell className="text-center font-semibold bg-pink-100 dark:bg-pink-900/30">
                                {dayTotal.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          )
                        })}

                      {/* Month total row */}
                      <TableRow className="bg-green-50 dark:bg-green-950/20 hover:bg-green-50 dark:hover:bg-green-950/20 font-semibold border-b-2">
                        <TableCell></TableCell>
                        <TableCell className="font-semibold">Total</TableCell>
                        {allMealTypes.map((type) => {
                          const typeTotal = Object.values(monthData).reduce((sum, day) => sum + (day[type] || 0), 0)
                          return (
                            <TableCell key={type} className="text-center font-semibold">
                              {typeTotal > 0 ? typeTotal.toLocaleString() : "-"}
                            </TableCell>
                          )
                        })}
                        <TableCell className="text-center font-semibold bg-green-200 dark:bg-green-900/40">
                          {monthTotal.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </tbody>
                  )
                })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
