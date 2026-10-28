import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isOptionalPhoneNumber(value: unknown): value is string | null | undefined {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim().length <= 32)
  );
}

export async function GET() {
  try {
    const customers = await prisma.pelanggan.findMany({
      orderBy: { nama: "asc" },
      include: { _count: { select: { kwitansi: true } } },
    });
    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Gagal memuat data pelanggan:", error);
    return NextResponse.json({ error: "Data pelanggan gagal dimuat." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format data tidak valid." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Data pelanggan tidak valid." }, { status: 400 });
  }
  const noHp = "noHp" in body ? body.noHp : undefined;
  if (
    !("nama" in body) ||
    !("alamat" in body) ||
    typeof body.nama !== "string" ||
    typeof body.alamat !== "string" ||
    !body.nama.trim() ||
    !body.alamat.trim() ||
    !isOptionalPhoneNumber(noHp)
  ) {
    return NextResponse.json(
      { error: "Nama dan alamat wajib diisi; nomor WhatsApp maksimal 32 karakter." },
      { status: 400 },
    );
  }

  try {
    const customer = await prisma.pelanggan.create({
      data: {
        nama: body.nama.trim(),
        alamat: body.alamat.trim(),
        noHp: typeof noHp === "string" ? noHp.trim() || null : null,
      },
    });
    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    console.error("Gagal menambahkan pelanggan:", error);
    return NextResponse.json({ error: "Pelanggan gagal ditambahkan." }, { status: 500 });
  }
}
