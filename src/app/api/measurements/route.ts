import { type NextRequest, NextResponse } from "next/server"
import { verify } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verify(token)
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

    const measurements = await (prisma as any).measurement.findMany({
      where: { userId: payload.userId },
      orderBy: { date: "desc" },
    })

    return NextResponse.json(measurements)
  } catch (error) {
    console.error("[v0] GET /api/measurements error:", error)
    return NextResponse.json({ error: "Failed to fetch measurements" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verify(token)
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

    const body = await req.json()
    const { date, height, heightUnit, weight, notes } = body

    const measurement = await (prisma as any).measurement.create({
      data: {
        userId: payload.userId,
        date: new Date(date),
        height,
        heightUnit,
        weight,
        notes,
      },
    })

    return NextResponse.json(measurement, { status: 201 })
  } catch (error) {
    console.error("[v0] POST /api/measurements error:", error)
    return NextResponse.json({ error: "Failed to create measurement" }, { status: 500 })
  }
}
