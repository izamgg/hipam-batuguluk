import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Droplets,
  FileText,
  Plus,
  UsersRound,
  Wallet,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatRupiah(value: number) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

export default async function DashboardPage() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const [customerCount, receiptCount, income, currentMonthIncome, recentReceipts] =
    await Promise.all([
      prisma.pelanggan.count(),
      prisma.kwitansi.count(),
      prisma.kwitansi.aggregate({ _sum: { totalBayar: true } }),
      prisma.kwitansi.aggregate({
        where: { tanggalBayar: { gte: monthStart } },
        _sum: { totalBayar: true },
      }),
      prisma.kwitansi.findMany({
        orderBy: [{ tanggalBayar: "desc" }, { id: "desc" }],
        take: 8,
        include: { pelanggan: true },
      }),
    ]);

  const totalIncome = income._sum.totalBayar ?? 0;
  const currentIncome = currentMonthIncome._sum.totalBayar ?? 0;
  const currentMonthLabel = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date());
  const stats = [
    {
      label: "Total pelanggan",
      value: customerCount.toLocaleString("id-ID"),
      detail: "Pelanggan terdaftar",
      icon: UsersRound,
      trend: "Database",
      tone: "green",
    },
    {
      label: "Total pendapatan",
      value: formatRupiah(totalIncome),
      detail: "Dari seluruh transaksi",
      icon: Wallet,
      trend: "Semua waktu",
      tone: "blue",
    },
    {
      label: "Total transaksi",
      value: receiptCount.toLocaleString("id-ID"),
      detail: "Kwitansi tersimpan",
      icon: FileText,
      trend: "Semua waktu",
      tone: "amber",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-[#7d9186]">Ringkasan data terkini</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#193c34] sm:text-[30px]">
            Ringkasan dashboard
          </h1>
          <p className="mt-2 text-sm text-[#8a9b92]">
            Pantau data pelanggan dan pembayaran air HIPAM Batuguluk.
          </p>
        </div>
        {/* <Link
          href="/dashboard/kwitansi"
          className="no-print inline-flex w-fit items-center gap-2 rounded-xl bg-[#176b58] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[#105342]"
        >
          <Plus size={17} /> Buat kwitansi
        </Link> */}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map(({ label, value, detail, icon: Icon, trend, tone }) => (
          <article
            className="rounded-2xl border border-[#e8eeea] bg-white p-5 shadow-sm shadow-[#28543e]/[0.025] sm:p-6"
            key={label}
          >
            <div className="flex items-start justify-between">
              <span
                className={`flex size-11 items-center justify-center rounded-xl ${
                  tone === "blue"
                    ? "bg-[#edf4f8] text-[#4c8299]"
                    : tone === "amber"
                      ? "bg-[#fbf4e8] text-[#bf8c40]"
                      : "bg-[#eaf5ee] text-[#328268]"
                }`}
              >
                <Icon size={20} />
              </span>
              <span className="flex items-center gap-1 rounded-full bg-[#f2f8f4] px-2.5 py-1 text-[10px] font-semibold text-[#52816b]">
                <ArrowUpRight size={12} /> {trend}
              </span>
            </div>
            <p className="mt-5 text-sm font-medium text-[#82948a]">{label}</p>
            <p className="mt-1 text-[26px] font-semibold tracking-tight text-[#244b3e]">
              {value}
            </p>
            <p className="mt-1 text-xs text-[#a0aca5]">{detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.55fr_0.8fr]">
        <div className="overflow-hidden rounded-2xl border border-[#e8eeea] bg-white shadow-sm shadow-[#28543e]/[0.025]">
          <div className="flex items-center justify-between border-b border-[#edf1ee] px-5 py-5 sm:px-6">
            <div>
              <h2 className="font-semibold text-[#284b3e]">Pembayaran terbaru</h2>
              <p className="mt-1 text-xs text-[#98a59e]">
                Riwayat kwitansi yang tercatat
              </p>
            </div>
            {/* <Link
              href="/dashboard/kwitansi"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#36816a] hover:text-[#176b58]"
            >
              Lihat kwitansi <ArrowRight size={14} />
            </Link> */}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="bg-[#fafcfb] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9aa79f]">
                  <th className="px-6 py-3.5">Pelanggan</th>
                  <th className="px-4 py-3.5">No. kwitansi</th>
                  <th className="px-4 py-3.5">Tanggal</th>
                  <th className="px-4 py-3.5">Total</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentReceipts.length === 0 && (
                  <tr className="border-t border-[#f0f3f1]">
                    <td className="px-6 py-8 text-center text-sm text-[#82948a]" colSpan={5}>
                      Belum ada transaksi.
                    </td>
                  </tr>
                )}
                {recentReceipts.map((receipt) => (
                  <tr className="border-t border-[#f0f3f1]" key={receipt.id}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[#385a4c]">{receipt.pelanggan.nama}</p>
                      <p className="mt-1 text-[11px] text-[#9aa79f]">{receipt.bulanPeriode}</p>
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-[#647b70]">
                      {receipt.noKwitansi}
                    </td>
                    <td className="px-4 py-4 text-xs text-[#82948a]">{formatDate(receipt.tanggalBayar)}</td>
                    <td className="px-4 py-4 font-semibold text-[#315d4c]">{formatRupiah(receipt.totalBayar)}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-[#edf7ef] px-2.5 py-1 text-[10px] font-semibold text-[#438462]">
                        Lunas
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-[#edf1ee] px-6 py-3 text-xs text-[#a0aca5]">
            Menampilkan {recentReceipts.length} transaksi terbaru.
          </div>
        </div>

        <div className="rounded-2xl border border-[#e8eeea] bg-white p-5 shadow-sm shadow-[#28543e]/[0.025] sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-[#284b3e]">Rekapan pendapatan</h2>
              <p className="mt-1 text-xs text-[#98a59e]">{currentMonthLabel}</p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#eaf5ee] text-[#328268]">
              <Droplets size={19} />
            </span>
          </div>
          <div className="mt-8">
            <p className="text-xs text-[#8b9b93]">Total pembayaran diterima bulan ini</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[#244b3e]">
              {formatRupiah(currentIncome)}
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-[#edf1ee] pt-4 text-xs">
            <span className="text-[#82948a]">Total pendapatan keseluruhan</span>
            <span className="font-semibold text-[#a08a5b]">{formatRupiah(totalIncome)}</span>
          </div>
          <Link
            href="/dashboard/kwitansi"
            className="no-print mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[#dce9e0] py-3 text-xs font-semibold text-[#397c68] transition hover:bg-[#f3f8f4]"
          >
            <FileText size={15} /> Buka generator kwitansi
          </Link>
        </div>
      </section>
    </div>
  );
}
