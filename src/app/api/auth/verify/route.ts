import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "")

export default async function  GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("authToken")?.value

    if (!token) {
      return new Response(JSON.stringify({ authenticated: false }), { status: 401 })
    }

    const verified = await jwtVerify(token, secret)
    return new Response(JSON.stringify({ authenticated: true, user: verified.payload }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ authenticated: false }), { status: 401 })
  }
}
