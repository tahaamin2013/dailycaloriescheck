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
    const heights = await (prisma as any).height.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    })

    return NextResponse.json(heights)
  } catch (error) {
    console.error("[v0] Error fetching heights:", error)
    return NextResponse.json({ error: "Failed to fetch heights" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const userId = getUserIdFromToken(request)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { height, date, notes } = body

    if (!height || !date) {
      return NextResponse.json({ error: "Height and date are required" }, { status: 400 })
    }

    const newHeight = await (prisma as any).height.create({
      data: {
        userId,
        height: Number.parseFloat(height),
        date: new Date(date),
        notes: notes || null,
      },
    })

    return NextResponse.json(newHeight, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating height:", error)
    return NextResponse.json({ error: "Failed to create height" }, { status: 500 })
  }
}
