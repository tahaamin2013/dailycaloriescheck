import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
const jwt = require("jsonwebtoken")

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword)
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  })
}

export async function createUser(name: string, email: string, password: string) {
  const hashedPassword = await hashPassword(password)
  return await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  })
}

export function verify(token: string) {
  try {
    const payload = jwt.verify(token, process.env.NEXTAUTH_SECRET || "secret")
    return payload
  } catch {
    return null
  }
}
