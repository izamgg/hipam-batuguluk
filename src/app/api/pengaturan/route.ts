import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionAdminId, sessionCookie } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

async function getCurrentAdminId() {
  return getSessionAdminId(cookies().get(sessionCookie.name)?.value);
}

function invalidSessionResponse() {
  const response = NextResponse.json(
    { error: "Sesi tidak valid. Silakan login kembali." },
    { status: 401 },
  );
  response.cookies.set(sessionCookie.name, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function GET() {
  try {
    const adminId = await getCurrentAdminId();
    if (!adminId) return invalidSessionResponse();
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    const settings =
      (await prisma.pengaturan.findUnique({ where: { id: 1 } })) ??
      (await prisma.pengaturan.create({ data: { id: 1 } }));
    return NextResponse.json({
      admin: admin
        ? { id: admin.id, nama: admin.nama, email: admin.email ?? "" }
        : { id: 1, nama: "Administrator", email: "admin@hipam.local" },
      settings,
    });
  } catch (error) {
    console.error("Gagal memuat pengaturan:", error);
    return NextResponse.json({ error: "Pengaturan gagal dimuat." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const adminId = await getCurrentAdminId();
  if (!adminId) return invalidSessionResponse();

  let admin;
  try {
    admin = await prisma.admin.findUnique({ where: { id: adminId } });
  } catch (error) {
    console.error("Gagal memuat admin untuk pengaturan:", error);
    return NextResponse.json({ error: "Data admin gagal dimuat." }, { status: 500 });
  }
  if (!admin) {
    return NextResponse.json(
      { error: "Data admin belum tersedia. Jalankan npm run db:seed." },
      { status: 409 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format data tidak valid." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Data pengaturan tidak valid." }, { status: 400 });
  }
  const data = body as Record<string, unknown>;
  if (
    typeof data.nama !== "string" ||
    !data.nama.trim() ||
    typeof data.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ||
    typeof data.namaAplikasi !== "string" ||
    !data.namaAplikasi.trim() ||
    typeof data.namaOrganisasi !== "string" ||
    !data.namaOrganisasi.trim() ||
    typeof data.alamat !== "string" ||
    (data.passwordBaru !== undefined &&
      (typeof data.passwordBaru !== "string" || data.passwordBaru.length < 8))
  ) {
    return NextResponse.json({ error: "Periksa kembali nama, email, profil, dan password." }, { status: 400 });
  }

  if (data.passwordBaru && (
    typeof data.passwordLama !== "string" ||
    !verifyPassword(data.passwordLama, admin.password)
  )) {
    return NextResponse.json({ error: "Password lama tidak sesuai." }, { status: 400 });
  }

  try {
    const [updatedAdmin, settings] = await prisma.$transaction([
      prisma.admin.update({
        where: { id: admin.id },
        data: {
          nama: data.nama.trim(),
          email: data.email.trim().toLowerCase(),
          ...(typeof data.passwordBaru === "string" && data.passwordBaru
            ? { password: hashPassword(data.passwordBaru) }
            : {}),
        },
      }),
      prisma.pengaturan.upsert({
        where: { id: 1 },
        create: {
          id: 1,
          namaAplikasi: (data.namaAplikasi as string).trim(),
          namaOrganisasi: (data.namaOrganisasi as string).trim(),
          alamat: (data.alamat as string).trim(),
        },
        update: {
          namaAplikasi: (data.namaAplikasi as string).trim(),
          namaOrganisasi: (data.namaOrganisasi as string).trim(),
          alamat: (data.alamat as string).trim(),
        },
      }),
    ]);
    return NextResponse.json({
      admin: { nama: updatedAdmin.nama, email: updatedAdmin.email ?? "" },
      settings,
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Email sudah digunakan admin lain." }, { status: 409 });
    }
    console.error("Gagal menyimpan pengaturan:", error);
    return NextResponse.json({ error: "Pengaturan gagal disimpan." }, { status: 500 });
  }
}
