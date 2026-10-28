import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const selectedMonth = searchParams.get("bulan");
  if (!selectedMonth || !/^\d{4}-(0[1-9]|1[0-2])$/.test(selectedMonth)) {
    return NextResponse.json({ error: "Bulan rekap tidak valid." }, { status: 400 });
  }

  const [year, month] = selectedMonth.split("-").map(Number);
  const bulanPeriode = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));

  try {
    const customers = await prisma.pelanggan.findMany({
      orderBy: { nama: "asc" },
      include: {
        kwitansi: {
          where: { bulanPeriode },
          orderBy: { tanggalBayar: "desc" },
          select: {
            id: true,
            noKwitansi: true,
            bulanPeriode: true,
            standAwal: true,
            standAkhir: true,
            pemakaian: true,
            tarif: true,
            totalBayar: true,
            tanggalBayar: true,
          },
        },
      },
    });

    return NextResponse.json({ customers, bulanPeriode });
  } catch (error) {
    console.error("Gagal memuat rekap tagihan:", error);
    return NextResponse.json({ error: "Rekap tagihan gagal dimuat." }, { status: 500 });
  }
}
