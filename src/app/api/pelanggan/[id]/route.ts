import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: { id: string } };

function isOptionalPhoneNumber(value: unknown): value is string | null | undefined {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim().length <= 32)
  );
}

function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "ID pelanggan tidak valid." }, { status: 400 });

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
    const customer = await prisma.pelanggan.update({
      where: { id },
      data: {
        nama: body.nama.trim(),
        alamat: body.alamat.trim(),
        ...(noHp !== undefined
          ? {
              noHp:
                typeof noHp === "string" ? noHp.trim() || null : noHp,
            }
          : {}),
      },
    });
    return NextResponse.json({ customer });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "Pelanggan tidak ditemukan." }, { status: 404 });
    }
    console.error("Gagal memperbarui pelanggan:", error);
    return NextResponse.json({ error: "Pelanggan gagal diperbarui." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "ID pelanggan tidak valid." }, { status: 400 });

  try {
    await prisma.pelanggan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Pelanggan tidak ditemukan." }, { status: 404 });
      }
      if (error.code === "P2003") {
        return NextResponse.json({ error: "Pelanggan masih memiliki transaksi dan tidak dapat dihapus." }, { status: 409 });
      }
    }
    console.error("Gagal menghapus pelanggan:", error);
    return NextResponse.json({ error: "Pelanggan gagal dihapus." }, { status: 500 });
  }
}
