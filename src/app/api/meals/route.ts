import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import { type NextRequest, NextResponse } from "next/server"

// Add this to prevent static generation
export const dynamic = 'force-dynamic'

function getUserIdFromToken(request: NextRequest): string | null {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "secret") as { id: string }
    return decoded.id
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const userId = getUserIdFromToken(request)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { type, name, calories, unit, qty } = await request.json()

    if (!name || !calories) {
      return NextResponse.json({ error: "Name and calories are required" }, { status: 400 })
    }

    const meal = await prisma.meal.create({
      data: {
        userId,
        name,
        calories: Number(calories),
        unit: unit || "Number",
        qty: Number(qty) || 1,
      },
    })

    return NextResponse.json(meal)
  } catch (error) {
    console.error("[v0] Create meal error:", error)
    return NextResponse.json({ error: "Failed to save food" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const userId = getUserIdFromToken(request)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const meals = await prisma.meal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(Array.isArray(meals) ? meals : [])
  } catch (error) {
    console.error("[v0] Get meals error:", error)
    return NextResponse.json([], { status: 200 })
  }
}