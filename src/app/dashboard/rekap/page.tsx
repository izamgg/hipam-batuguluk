"use client";

import { CalendarDays, Printer } from "lucide-react";
import { useEffect, useState } from "react";

type Receipt = {
  id: number;
  noKwitansi: string;
  bulanPeriode: string;
  standAwal: number;
  standAkhir: number;
  pemakaian: number;
  tarif: number;
  totalBayar: number;
  tanggalBayar: string;
};

type Customer = {
  id: number;
  nama: string;
  noHp: string | null;
  kwitansi: Receipt[];
};

type RecapRow = {
  customer: Customer;
  receipt: Receipt | null;
};

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function formatRupiah(value: number) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;
}

export default function RekapPage() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [periodLabel, setPeriodLabel] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadRecap() {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/rekap?bulan=${selectedMonth}`, {
          cache: "no-store",
        });
        const result = (await response.json()) as {
          customers?: Customer[];
          bulanPeriode?: string;
          error?: string;
        };
        if (!response.ok) throw new Error(result.error ?? "Rekap tagihan gagal dimuat.");
        if (isActive) {
          setCustomers(result.customers ?? []);
          setPeriodLabel(result.bulanPeriode ?? "");
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Rekap tagihan gagal dimuat.",
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadRecap();
    return () => {
      isActive = false;
    };
  }, [selectedMonth]);

  const rows = customers.flatMap<RecapRow>((customer) =>
    customer.kwitansi.length > 0
      ? customer.kwitansi.map((receipt) => ({ customer, receipt }))
      : [{ customer, receipt: null }],
  );
  const paidCustomerCount = customers.filter(
    (customer) => customer.kwitansi.length > 0,
  ).length;
  const unpaidCustomerCount = customers.length - paidCustomerCount;
  const totalBilled = customers.reduce(
    (total, customer) =>
      total +
      customer.kwitansi.reduce((customerTotal, receipt) => customerTotal + receipt.totalBayar, 0),
    0,
  );
  const totalUsage = customers.reduce(
    (total, customer) =>
      total +
      customer.kwitansi.reduce((customerTotal, receipt) => customerTotal + receipt.pemakaian, 0),
    0,
  );

  return (
    <div className="space-y-7">
      <section className="no-print flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-[#7d9186]">Laporan pembayaran</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#193c34] sm:text-[30px]">
            Rekap tagihan bulanan
          </h1>
          <p className="mt-2 text-sm text-[#8a9b92]">
            Pantau pemakaian air dan status pembayaran seluruh pelanggan.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#58736a]">
              Periode tagihan
            </span>
            <span className="relative block">
              <CalendarDays
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#90a096]"
                size={16}
              />
              <input
                aria-label="Periode tagihan"
                className="rounded-xl border border-[#dce7df] bg-white py-3 pl-3 pr-10 text-sm font-medium text-[#35594a] outline-none focus:border-[#3a9375] focus:ring-4 focus:ring-[#3a9375]/10"
                onChange={(event) => setSelectedMonth(event.target.value)}
                type="month"
                value={selectedMonth}
              />
            </span>
          </label>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-[#176b58] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[#105342]"
            onClick={() => window.print()}
            type="button"
          >
            <Printer size={16} /> Cetak rekap
          </button>
        </div>
      </section>

      {error && (
        <p
          aria-live="polite"
          className="no-print rounded-xl bg-[#fff4ed] px-4 py-3 text-sm font-medium text-[#a34d30]"
        >
          {error}
        </p>
      )}

      <section className="print-container rekap-print overflow-hidden rounded-2xl border border-[#e8eeea] bg-white shadow-sm">
        <header className="border-b border-[#e8eeea] px-5 py-5 sm:px-7">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7d9186]">
                HIPAM · Laporan pembayaran air
              </p>
              <h2 className="mt-1 text-xl font-bold text-[#193c34]">
                Rekap Tagihan {periodLabel || "Bulanan"}
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center sm:gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[#8a9b92]">Lunas</p>
                <p className="mt-1 text-sm font-bold text-[#176b58]">{paidCustomerCount}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[#8a9b92]">
                  Belum bayar
                </p>
                <p className="mt-1 text-sm font-bold text-[#a34d30]">{unpaidCustomerCount}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[#8a9b92]">
                  Total tercatat
                </p>
                <p className="mt-1 text-sm font-bold text-[#193c34]">
                  {formatRupiah(totalBilled)}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-xs">
            <thead>
              <tr className="bg-[#f3f8f4] text-[10px] font-bold uppercase tracking-[0.08em] text-[#416253]">
                <th className="px-3 py-3 text-center">No</th>
                <th className="px-3 py-3">Nama Pelanggan</th>
                <th className="px-3 py-3">WhatsApp</th>
                <th className="px-3 py-3">Bulan</th>
                <th className="px-3 py-3 text-right">Awal</th>
                <th className="px-3 py-3 text-right">Akhir</th>
                <th className="px-3 py-3 text-right">m³</th>
                <th className="px-3 py-3 text-right">Tarif</th>
                <th className="px-3 py-3 text-right">Total Rp</th>
                <th className="px-3 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-4 py-10 text-center text-[#82948a]" colSpan={9}>
                    Memuat rekap tagihan...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td className="px-4 py-10 text-center text-[#a34d30]" colSpan={9}>
                    Data rekap tidak dapat ditampilkan.
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-[#82948a]" colSpan={9}>
                    Belum ada pelanggan terdaftar.
                  </td>
                </tr>
              ) : (
                rows.map(({ customer, receipt }, index) => (
                  <tr className="border-t border-[#edf1ee]" key={`${customer.id}-${receipt?.id ?? "unpaid"}`}>
                    <td className="px-3 py-3 text-center text-[#82948a]">{index + 1}</td>
                    <td className="px-3 py-3 font-semibold text-[#35594a]">{customer.nama}</td>
                    <td className="px-3 py-3 text-[#58736a]">{customer.noHp || "—"}</td>
                    <td className="px-3 py-3 text-[#58736a]">
                      {receipt?.bulanPeriode ?? periodLabel}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-[#58736a]">
                      {receipt?.standAwal.toLocaleString("id-ID") ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-[#58736a]">
                      {receipt?.standAkhir.toLocaleString("id-ID") ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-[#58736a]">
                      {receipt?.pemakaian.toLocaleString("id-ID") ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-[#58736a]">
                      {receipt ? formatRupiah(receipt.tarif) : "—"}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold tabular-nums text-[#35594a]">
                      {receipt ? formatRupiah(receipt.totalBayar) : "—"}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold ${
                          receipt
                            ? "bg-[#eaf5ee] text-[#176b58]"
                            : "bg-[#fff4ed] text-[#a34d30]"
                        }`}
                      >
                        {receipt ? "LUNAS" : "BELUM BAYAR"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {!isLoading && !error && rows.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-[#b8c9bd] bg-[#f7faf8] font-bold text-[#193c34]">
                  <td className="px-3 py-3 text-right" colSpan={6}>
                    Total tercatat
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {totalUsage.toLocaleString("id-ID")}
                  </td>
                  <td />
                  <td className="px-3 py-3 text-right tabular-nums">
                    {formatRupiah(totalBilled)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        <p className="border-t border-[#edf1ee] px-5 py-3 text-[10px] text-[#8a9b92] sm:px-7">
          Laporan pembayaran air bersih HIPAM Batuguluk.
        </p>
      </section>
    </div>
  );
}
