import { getUserByEmail, verifyPassword } from "@/lib/auth"
import jwt from "jsonwebtoken"
import { type NextRequest, NextResponse } from "next/server"

// runtime must be nodejs for jsonwebtoken
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 })
    }

    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const passwordValid = await verifyPassword(password, user.password)
    if (!passwordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.NEXTAUTH_SECRET || "secret", 
      { expiresIn: "7d" }
    )

    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}