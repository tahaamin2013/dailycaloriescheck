import { type NextRequest, NextResponse } from "next/server"
import { verify } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verify(token)
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

    const body = await req.json()
    const { date, height, heightUnit, weight, notes } = body

    const measurement = await (prisma as any).measurement.update({
      where: { id: params.id },
      data: {
        date: new Date(date),
        height,
        heightUnit,
        weight,
        notes,
      },
    })

    return NextResponse.json(measurement)
  } catch (error) {
    console.error("[v0] PUT /api/measurements error:", error)
    return NextResponse.json({ error: "Failed to update measurement" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verify(token)
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

    await (prisma as any).measurement.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] DELETE /api/measurements error:", error)
    return NextResponse.json({ error: "Failed to delete measurement" }, { status: 500 })
  }
}
