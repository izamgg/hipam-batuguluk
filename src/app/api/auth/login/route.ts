import { NextResponse } from "next/server";
import { sessionCookie, createSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const isValidEmail = email === "admin@hipam.local" || email === "admin@hipam.com";
    const isValidPassword = password === "admin123";

    if (isValidEmail && isValidPassword) {
      const token = await createSessionToken(1);

      const response = NextResponse.json({
        success: true,
        message: "Login berhasil",
        user: { name: "Administrator", email },
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
    }

    return NextResponse.json(
      { success: false, message: "Email atau password salah." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}