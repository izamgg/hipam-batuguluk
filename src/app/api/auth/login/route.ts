import { NextResponse } from "next/server";
import { createSessionToken, sessionCookie } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (
      typeof body !== "object" ||
      body === null ||
      !("email" in body) ||
      !("password" in body) ||
      typeof body.email !== "string" ||
      typeof body.password !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Email dan password wajib diisi." },
        { status: 400 },
      );
    }

    const email = body.email.trim().toLowerCase();
    const admin = await prisma.admin.findUnique({ where: { id: 1 } });
    const validEmail =
      email === "admin@hipam.local" || email === "admin@hipam.com";

    if (
      !admin ||
      !validEmail ||
      admin.email?.toLowerCase() !== email ||
      !verifyPassword(body.password, admin.password)
    ) {
      return NextResponse.json(
        { success: false, message: "Email atau password salah." },
        { status: 401 },
      );
    }

    const token = await createSessionToken(1);
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: { name: admin.nama, email: admin.email },
    });

    response.cookies.set({
      name: sessionCookie.name,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: sessionCookie.maxAge,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Login gagal. Silakan coba lagi." },
      { status: 500 },
    );
  }
}