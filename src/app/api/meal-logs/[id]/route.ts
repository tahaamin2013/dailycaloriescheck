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

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserIdFromToken(request)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const { date, type, mealName, qty, calories, notes } = await request.json()

    const log = await prisma.mealLog.updateMany({
      where: { id, userId },
      data: {
        date: new Date(date),
        type,
        mealName,
        qty,
        calories,
        notes: notes || null,
      },
    })

    if (log.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update meal log error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserIdFromToken(request)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    
    const log = await prisma.mealLog.deleteMany({
      where: { id, userId },
    })

    if (log.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete meal log error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}