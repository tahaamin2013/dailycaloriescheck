import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import { type NextRequest, NextResponse } from "next/server"

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
    const { date, type, mealName, qty, calories, notes } = await request.json()

    const log = await prisma.mealLog.create({
      data: {
        userId,
        date: new Date(date),
        type,
        mealName,
        qty,
        calories,
        notes: notes || null,
      },
    })

    return NextResponse.json(log)
  } catch (error) {
    console.error("Create meal log error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const userId = getUserIdFromToken(request)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const logs = await prisma.mealLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error("Get meal logs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
