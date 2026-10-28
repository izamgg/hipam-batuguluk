"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Droplets,
  FileText,
  MessageCircle,
  Printer,
  RotateCcw,
  Save,
} from "lucide-react";

type ReceiptDetails = {
  noKwitansi: string;
  pelangganId: string;
  tanggalBayar: string;
  bulanPeriode: string;
  standAwal: string;
  standAkhir: string;
  tarif: string;
  totalBayar: string;
};

type Customer = {
  id: number;
  nama: string;
  alamat: string;
  noHp: string | null;
};

const FIRST_PERIOD_YEAR = 2025;
const LAST_PERIOD_YEAR = Math.max(2030, new Date().getFullYear());
const PERIOD_OPTIONS = Array.from(
  { length: (LAST_PERIOD_YEAR - FIRST_PERIOD_YEAR + 1) * 12 },
  (_, index) => {
    const year = FIRST_PERIOD_YEAR + Math.floor(index / 12);
    const month = index % 12;
    return new Date(year, month, 1).toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
  },
);

function createInitialDetails(): ReceiptDetails {
  const now = new Date();
  return {
    noKwitansi: `KB-${now.getFullYear()}-${String(Date.now()).slice(-8)}`,
    pelangganId: "",
    tanggalBayar: [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-"),
    bulanPeriode: now.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    }),
    standAwal: "",
    standAkhir: "",
    tarif: "",
    totalBayar: "",
  };
}

function formatRupiah(value: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Rp 0";
  return `Rp ${new Intl.NumberFormat("id-ID").format(amount)}`;
}

function formatMeter(value: string) {
  const number = Number(value);
  return Number.isFinite(number)
    ? new Intl.NumberFormat("id-ID").format(number)
    : "0";
}

function formatDate(value: string) {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTerbilang(value: number): string {
  const words = [
    "",
    "satu",
    "dua",
    "tiga",
    "empat",
    "lima",
    "enam",
    "tujuh",
    "delapan",
    "sembilan",
    "sepuluh",
    "sebelas",
  ];
  function spell(amount: number): string {
    if (amount === 0) return "";
    if (amount < 12) return words[amount];
    if (amount < 20) return `${words[amount - 10]} belas`;
    if (amount < 100) {
      return `${spell(Math.floor(amount / 10))} puluh ${spell(amount % 10)}`.trim();
    }
    if (amount < 200) return `seratus ${spell(amount - 100)}`.trim();
    if (amount < 1000) {
      return `${spell(Math.floor(amount / 100))} ratus ${spell(amount % 100)}`.trim();
    }
    if (amount < 2000) return `seribu ${spell(amount - 1000)}`.trim();

    const units = [
      { size: 1_000_000_000, name: "miliar" },
      { size: 1_000_000, name: "juta" },
      { size: 1000, name: "ribu" },
    ];
    const unit = units.find(({ size }) => amount >= size);
    if (!unit) return "";
    const count = Math.floor(amount / unit.size);
    const countText = unit.name === "ribu" && count === 1 ? "seribu" : spell(count);
    return `${countText} ${unit.name} ${spell(amount % unit.size)}`.trim();
  }

  return `${spell(Math.floor(value)) || "nol"} rupiah`;
}

export default function KwitansiPage() {
  const [details, setDetails] = useState(createInitialDetails);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState({
    namaAplikasi: "HIPAM Batuguluk",
    namaOrganisasi: "HIPAM Batuguluk Foundation",
    alamat: "Batuguluk, Lombok Timur",
  });
  useEffect(() => {
    fetch("/api/pelanggan")
      .then(async (response) => {
        const result = (await response.json()) as {
          customers?: Customer[];
          error?: string;
        };
        if (!response.ok) throw new Error(result.error ?? "Pelanggan gagal dimuat.");
        setCustomers(result.customers ?? []);
      })
      .catch((error: unknown) => {
        setNotice(error instanceof Error ? error.message : "Pelanggan gagal dimuat.");
      });
  }, []);
  useEffect(() => {
    fetch("/api/pengaturan")
      .then(async (response) => {
        const result = (await response.json()) as {
          settings?: typeof profile;
          error?: string;
        };
        if (response.status === 401) {
          window.location.assign("/login");
          return;
        }
        if (!response.ok) throw new Error(result.error ?? "Data profil organisasi gagal dimuat.");
        if (result.settings) setProfile(result.settings);
      })
      .catch((error: unknown) => {
        setNotice(
          error instanceof Error ? error.message : "Data profil organisasi gagal dimuat.",
        );
      });
  }, []);

  const selectedCustomer = customers.find(
    (customer) => customer.id === Number(details.pelangganId),
  );
  const whatsappPhone = selectedCustomer?.noHp
    ?.replace(/\D/g, "")
    .replace(/^0/, "62");
  const standAwal = Number(details.standAwal) || 0;
  const standAkhir = Number(details.standAkhir) || 0;
  const pemakaian = Math.max(0, standAkhir - standAwal);

  function sendReceiptToWhatsApp() {
    if (!whatsappPhone || !selectedCustomer) return;

    const message = [
      "*BADAN PENGELOLA AIR BERSIH*",
      "*HIPAM BATUGULUK FOUNDATION*",
      "Batuguluk, Lombok Timur",
      "----------------------------------",
      "*BUKTI PEMBAYARAN RESMI*",
      "",
      `📋 *No. Kwitansi* : ${details.noKwitansi || "—"}`,
      `👤 *Pelanggan*   : ${selectedCustomer.nama}`,
      `📅 *Tgl Bayar*   : ${formatDate(details.tanggalBayar)}`,
      `📌 *Periode*     : ${details.bulanPeriode}`,
      "",
      "--- *RINCIAN PEMAKAIAN AIR* ---",
      `• Stand Awal  : ${formatMeter(details.standAwal)} m³`,
      `• Stand Akhir : ${formatMeter(details.standAkhir)} m³`,
      `• Pemakaian   : ${new Intl.NumberFormat("id-ID").format(pemakaian)} m³`,
      `• Tarif       : ${formatRupiah(details.tarif)} /m³`,
      "",
      `💰 *TOTAL PEMBAYARAN : ${formatRupiah(details.totalBayar)}*`,
      "Status: *LUNAS ✔️*",
      "----------------------------------",
      "Terima kasih atas pembayaran Anda. Kwitansi ini sah sebagai bukti pembayaran.",
    ].join("\n");
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  function updateField(field: keyof ReceiptDetails, value: string) {
    setDetails((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/kwitansi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noKwitansi: details.noKwitansi,
          pelangganId: Number(details.pelangganId),
          tanggalBayar: details.tanggalBayar,
          bulanPeriode: details.bulanPeriode,
          standAwal,
          standAkhir,
          tarif: Number(details.tarif),
          totalBayar: Number(details.totalBayar),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Kwitansi gagal disimpan.");
      setSaved(true);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Kwitansi gagal disimpan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-7">
      <section className="no-print flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-[#7d9186]">Pembayaran pelanggan</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#193c34] sm:text-[30px]">
            Generator kwitansi
          </h1>
          <p className="mt-2 text-sm text-[#8a9b92]">
            Isi detail tagihan, lalu cetak bukti pembayaran air bersih.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-[#dce7df] bg-white px-4 py-3 text-sm font-semibold text-[#58736a] transition hover:bg-[#f6faf7]"
            onClick={() => {
              setDetails(createInitialDetails());
              setSaved(false);
              setNotice("");
            }}
            type="button"
          >
            <RotateCcw size={16} /> Reset
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-[#dce7df] bg-white px-4 py-3 text-sm font-semibold text-[#58736a] transition hover:bg-[#f6faf7]"
            onClick={() => window.print()}
            type="button"
          >
            <Printer size={16} /> Cetak
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-[#cfe6d7] bg-[#f0f8f2] px-4 py-3 text-sm font-semibold text-[#176b58] transition hover:bg-[#e3f2e7] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!whatsappPhone}
            onClick={sendReceiptToWhatsApp}
            title={
              whatsappPhone
                ? "Kirim ringkasan kwitansi ke WhatsApp pelanggan"
                : "Pilih pelanggan yang memiliki nomor WhatsApp"
            }
            type="button"
          >
            <MessageCircle size={16} /> Kirim ke WhatsApp
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-[#176b58] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[#105342]"
            disabled={isSubmitting || saved}
            form="receipt-form"
            type="submit"
          >
            <Save size={16} /> {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(330px,0.82fr)_minmax(560px,1.18fr)]">
        <section className="no-print rounded-2xl border border-[#e8eeea] bg-white p-5 shadow-sm shadow-[#28543e]/[0.025] sm:p-6">
          <div className="mb-6 flex items-center gap-3 border-b border-[#edf1ee] pb-5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#eaf5ee] text-[#328268]">
              <FileText size={19} />
            </span>
            <div>
              <h2 className="font-semibold text-[#284b3e]">Detail pembayaran</h2>
              <p className="mt-0.5 text-xs text-[#98a59e]">Data untuk kwitansi air</p>
            </div>
          </div>

          <form className="space-y-4" id="receipt-form" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold text-[#58736a]">
                  Nomor kwitansi
                </span>
                <input
                  className="w-full rounded-lg border border-[#dfe8e2] px-3 py-2.5 text-sm text-[#35594a] outline-none focus:border-[#3a9375] focus:ring-4 focus:ring-[#3a9375]/10"
                  onChange={(event) => updateField("noKwitansi", event.target.value)}
                  required
                  value={details.noKwitansi}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold text-[#58736a]">
                  Pelanggan
                </span>
                <select
                  className="w-full rounded-lg border border-[#dfe8e2] px-3 py-2.5 text-sm text-[#35594a] outline-none focus:border-[#3a9375] focus:ring-4 focus:ring-[#3a9375]/10"
                  onChange={(event) => updateField("pelangganId", event.target.value)}
                  required
                  value={details.pelangganId}
                >
                  <option value="">Pilih pelanggan</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.nama} — {customer.alamat}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#58736a]">
                  Tanggal bayar
                </span>
                <span className="relative block">
                  <CalendarDays
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#90a096]"
                    size={15}
                  />
                  <input
                    className="w-full rounded-lg border border-[#dfe8e2] px-3 py-2.5 text-sm text-[#35594a] outline-none focus:border-[#3a9375] focus:ring-4 focus:ring-[#3a9375]/10"
                    onChange={(event) => updateField("tanggalBayar", event.target.value)}
                    required
                    type="date"
                    value={details.tanggalBayar}
                  />
                </span>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#58736a]">
                  Periode
                </span>
                <span className="relative block">
                  <select
                    className="w-full appearance-none rounded-lg border border-[#dfe8e2] bg-white px-3 py-2.5 pr-8 text-sm text-[#35594a] outline-none focus:border-[#3a9375] focus:ring-4 focus:ring-[#3a9375]/10"
                    onChange={(event) => updateField("bulanPeriode", event.target.value)}
                    value={details.bulanPeriode}
                  >
                    {PERIOD_OPTIONS.map((period) => (
                      <option key={period} value={period}>
                        {period}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#90a096]"
                    size={15}
                  />
                </span>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#58736a]">
                  Stand awal (m³)
                </span>
                <input
                  className="w-full rounded-lg border border-[#dfe8e2] px-3 py-2.5 text-sm text-[#35594a] outline-none focus:border-[#3a9375] focus:ring-4 focus:ring-[#3a9375]/10"
                  min="0"
                  onChange={(event) => updateField("standAwal", event.target.value)}
                  required
                  type="number"
                  value={details.standAwal}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#58736a]">
                  Stand akhir (m³)
                </span>
                <input
                  className="w-full rounded-lg border border-[#dfe8e2] px-3 py-2.5 text-sm text-[#35594a] outline-none focus:border-[#3a9375] focus:ring-4 focus:ring-[#3a9375]/10"
                  min={details.standAwal || "0"}
                  onChange={(event) => updateField("standAkhir", event.target.value)}
                  required
                  type="number"
                  value={details.standAkhir}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#58736a]">
                  Tarif
                </span>
                <input
                  className="w-full rounded-lg border border-[#dfe8e2] px-3 py-2.5 text-sm text-[#35594a] outline-none focus:border-[#3a9375] focus:ring-4 focus:ring-[#3a9375]/10"
                  min="0"
                  onChange={(event) => updateField("tarif", event.target.value)}
                  required
                  type="number"
                  value={details.tarif}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#58736a]">
                  Total bayar (Rp)
                </span>
                <input
                  className="w-full rounded-lg border border-[#dfe8e2] px-3 py-2.5 text-sm text-[#35594a] outline-none focus:border-[#3a9375] focus:ring-4 focus:ring-[#3a9375]/10"
                  min="0"
                  onChange={(event) => updateField("totalBayar", event.target.value)}
                  required
                  type="number"
                  value={details.totalBayar}
                />
              </label>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[#f3f8f4] px-4 py-3 text-sm">
              <span className="text-[#71877b]">Pemakaian terhitung</span>
              <span className="font-semibold text-[#34765f]">{pemakaian} m³</span>
            </div>
            {notice && (
              <p aria-live="polite" className="rounded-lg bg-[#fff4ed] px-3 py-2.5 text-xs font-medium text-[#a34d30]">
                {notice}
              </p>
            )}
            {customers.length === 0 && (
              <p className="rounded-lg bg-[#fff9eb] px-3 py-2.5 text-xs text-[#85682a]">
                Tambahkan pelanggan terlebih dahulu sebelum menyimpan kwitansi.
              </p>
            )}
            {saved && (
              <p
                aria-live="polite"
                className="flex items-center gap-2 rounded-lg bg-[#edf7ef] px-3 py-2.5 text-xs font-medium text-[#438462]"
              >
                <Check size={15} /> Kwitansi berhasil disimpan ke database.
              </p>
            )}
          </form>
        </section>

        <section className="min-w-0">
          <div className="no-print mb-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#71877b]">
              <span className="size-2 rounded-full bg-[#54a37f]" />
              Pratinjau kwitansi
            </div>
            <span className="text-[11px] text-[#a0aca5]">Tampilan siap cetak</span>
          </div>
          <article className="print-container receipt-print receipt-print-area mx-auto max-w-[760px] overflow-hidden rounded-xl border border-[#e4e9e5] bg-white shadow-[0_12px_42px_-22px_rgba(27,65,48,0.25)]">
            <div className="receipt-print-header border-b-[5px] border-[#d1a353] bg-[#176b58] px-6 py-6 text-white sm:px-9 sm:py-8">
              <div className="flex items-center gap-4">
                <span className="receipt-print-icon flex size-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                  <Droplets size={30} />
                </span>
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-white/70 sm:text-xs">
                    BADAN PENGELOLA AIR BERSIH
                  </p>
                  <h2 className="mt-1 text-xl font-bold tracking-[0.04em] sm:text-2xl">
                    {profile.namaAplikasi.toUpperCase()}
                  </h2>
                  <p className="mt-1 text-[10px] text-white/75 sm:text-xs">
                    {profile.namaOrganisasi.toUpperCase()}
                  </p>
                  {profile.alamat && (
                    <p className="mt-1 text-[10px] text-white/65 sm:text-xs">
                      {profile.alamat}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/20 pt-4 text-[10px] text-white/80 sm:text-xs">
                <span>PELAYANAN AIR BERSIH UNTUK MASYARAKAT</span>
                <span>BUKTI PEMBAYARAN RESMI</span>
              </div>
            </div>

            <div className="receipt-print-body px-6 py-6 sm:px-9 sm:py-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b9b93]">
                    Kwitansi pembayaran
                  </p>
                  <p className="mt-2 text-lg font-bold tracking-wide text-[#244b3e] sm:text-xl">
                    {details.noKwitansi || "—"}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#cfe6d7] bg-[#f0f8f2] px-3 py-1.5 text-[10px] font-bold tracking-wide text-[#438462]">
                  <Check size={12} strokeWidth={2.5} /> LUNAS
                </span>
              </div>

              <div className="receipt-period-card mt-6 grid gap-5 rounded-xl border border-[#e9efea] bg-[#fbfdfb] p-4 sm:grid-cols-2 sm:p-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#92a098]">
                    Telah diterima dari
                  </p>
                  <p className="mt-2 font-semibold text-[#35594a]">{selectedCustomer?.nama || "—"}</p>
                  <p className="mt-1 text-xs leading-5 text-[#82948a]">{selectedCustomer?.alamat || "—"}</p>
                </div>
                <div className="sm:border-l sm:border-[#e6ede8] sm:pl-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#92a098]">
                    Tanggal pembayaran
                  </p>
                  <p className="mt-2 font-semibold text-[#35594a]">
                    {formatDate(details.tanggalBayar)}
                  </p>
                  <p className="mt-1 text-xs text-[#82948a]">
                    Periode: {details.bulanPeriode}
                  </p>
                </div>
              </div>

              <div className="receipt-usage-panel mt-6">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#436454]">
                  <Droplets size={15} className="text-[#36816a]" />
                  Rincian pemakaian air
                </div>
                <div className="receipt-usage-table overflow-hidden rounded-xl border border-[#e7ede8]">
                  <div className="grid grid-cols-3 bg-[#f5f9f6] px-4 py-3 text-[9px] font-bold uppercase tracking-[0.13em] text-[#8b9b93] sm:px-5 sm:text-[10px]">
                    <span>Stand awal</span>
                    <span>Stand akhir</span>
                    <span>Pemakaian</span>
                  </div>
                  <div className="grid grid-cols-3 px-4 py-4 text-sm font-semibold text-[#35594a] sm:px-5">
                    <span>{formatMeter(details.standAwal)} m³</span>
                    <span>{formatMeter(details.standAkhir)} m³</span>
                    <span>{pemakaian} m³</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-dashed border-[#e7ede8] px-4 py-3 text-xs sm:px-5">
                    <span className="text-[#82948a]">Tarif yang berlaku</span>
                    <span className="font-semibold text-[#527061]">{details.tarif} per m³</span>
                  </div>
                </div>
              </div>

              <div className="receipt-total-card mt-6 flex items-center justify-between gap-4 rounded-xl bg-[#edf6ef] px-4 py-4 sm:px-5 sm:py-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6e8d7b]">
                    Total pembayaran
                  </p>
                  <p className="mt-1 text-[10px] text-[#82948a]">
                    Terbilang: {formatTerbilang(Number(details.totalBayar) || 0)}
                  </p>
                </div>
                <p className="whitespace-nowrap text-xl font-bold tracking-tight text-[#176b58] sm:text-2xl">
                  {formatRupiah(details.totalBayar)}
                </p>
              </div>

              <div className="receipt-signatures mt-7 flex flex-wrap justify-between gap-8 text-center text-[10px] text-[#82948a] sm:text-xs">
                <div className="min-w-[140px]">
                  <p>Pelanggan,</p>
                  <div className="receipt-signature-line mt-12 border-b border-[#cbd7cf]" />
                  <p className="mt-2 font-semibold text-[#58736a]">{selectedCustomer?.nama || "—"}</p>
                </div>
                <div className="min-w-[140px]">
                  <p>Petugas HIPAM,</p>
                  <div className="receipt-signature-line mt-12 border-b border-[#cbd7cf]" />
                  <p className="mt-2 font-semibold text-[#58736a]">Administrasi</p>
                </div>
              </div>
              <div className="receipt-footer mt-6 border-t border-dashed border-[#dfe8e2] pt-4 text-center text-[9px] leading-4 text-[#9aa79f] sm:text-[10px]">
                Simpan kwitansi ini sebagai bukti pembayaran yang sah.
                <br />
                Terima kasih telah menggunakan layanan {profile.namaAplikasi}.
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
