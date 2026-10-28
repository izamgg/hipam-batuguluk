import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format data tidak valid." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Data kwitansi tidak valid." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const numberFields = ["pelangganId", "standAwal", "standAkhir", "tarif", "totalBayar"];
  if (
    typeof data.noKwitansi !== "string" ||
    !data.noKwitansi.trim() ||
    typeof data.tanggalBayar !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data.tanggalBayar) ||
    typeof data.bulanPeriode !== "string" ||
    !data.bulanPeriode.trim() ||
    numberFields.some(
      (field) =>
        typeof data[field] !== "number" ||
        !Number.isInteger(data[field]) ||
        (data[field] as number) < 0,
    )
  ) {
    return NextResponse.json({ error: "Lengkapi data kwitansi dengan benar." }, { status: 400 });
  }

  const standAwal = data.standAwal as number;
  const standAkhir = data.standAkhir as number;
  if (standAkhir < standAwal) {
    return NextResponse.json({ error: "Stand akhir tidak boleh lebih kecil dari stand awal." }, { status: 400 });
  }

  try {
    const tanggalBayar = new Date(`${data.tanggalBayar}T00:00:00.000Z`);
    if (
      Number.isNaN(tanggalBayar.getTime()) ||
      tanggalBayar.toISOString().slice(0, 10) !== data.tanggalBayar
    ) {
      return NextResponse.json({ error: "Tanggal pembayaran tidak valid." }, { status: 400 });
    }
    const pemakaian = standAkhir - standAwal;
    const receipt = await prisma.kwitansi.create({
      data: {
        noKwitansi: data.noKwitansi.trim(),
        tanggalBayar,
        bulanPeriode: data.bulanPeriode.trim(),
        standAwal,
        standAkhir,
        pemakaian,
        tarif: data.tarif as number,
        totalPerM2:
          pemakaian > 0
            ? Math.round((data.totalBayar as number) / pemakaian)
            : 0,
        totalBayar: data.totalBayar as number,
        pelangganId: data.pelangganId as number,
      },
      include: { pelanggan: true },
    });
    return NextResponse.json({ receipt }, { status: 201 });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "Nomor kwitansi sudah digunakan." }, { status: 409 });
    }
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2003"
    ) {
      return NextResponse.json({ error: "Pelanggan tidak ditemukan." }, { status: 400 });
    }
    console.error("Gagal menyimpan kwitansi:", error);
    return NextResponse.json({ error: "Kwitansi gagal disimpan." }, { status: 500 });
  }
}
