import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

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

export async function GET(request: NextRequest) {
  const userId = getUserIdFromToken(request)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const weights = await (prisma as any).weight.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    })

    return NextResponse.json(weights)
  } catch (error) {
    console.error("[v0] Error fetching weights:", error)
    return NextResponse.json({ error: "Failed to fetch weights" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const userId = getUserIdFromToken(request)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { weight, date, notes } = body

    if (!weight || !date) {
      return NextResponse.json({ error: "Weight and date are required" }, { status: 400 })
    }

    const newWeight = await (prisma as any).weight.create({
      data: {
        userId,
        weight: Number.parseFloat(weight),
        date: new Date(date),
        notes: notes || null,
      },
    })

    return NextResponse.json(newWeight, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating weight:", error)
    return NextResponse.json({ error: "Failed to create weight" }, { status: 500 })
  }
}
