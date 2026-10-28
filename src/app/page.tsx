import Link from "next/link";
import {
  ArrowRight,
  Check,
  Droplets,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const highlights = [
  {
    icon: FileText,
    title: "Kwitansi lebih rapi",
    description: "Buat dan cetak bukti pembayaran dalam beberapa langkah.",
  },
  {
    icon: ShieldCheck,
    title: "Data tertata",
    description: "Informasi pelanggan dan pembayaran tersusun dalam satu sistem.",
  },
  {
    icon: Check,
    title: "Rekap mudah dibaca",
    description: "Pantau ringkasan pembayaran tanpa catatan yang tercecer.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7faf8] text-[#173c35]">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3" aria-label="HIPAM Batuguluk">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-[#176b58] text-white shadow-lg shadow-emerald-900/15">
            <Droplets size={23} strokeWidth={2.2} />
          </span>
          <span>
            <span className="block text-sm font-bold tracking-[0.14em]">HIPAM</span>
            <span className="block text-[11px] font-medium text-[#71857e]">
              BATUGULUK FOUNDATION
            </span>
          </span>
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-full bg-[#176b58] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#105342]"
        >
          Login Admin <ArrowRight size={16} />
        </Link>
      </header>

      <section className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-6 pb-20 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-28 lg:pt-20">
        <div className="relative z-10">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#dce9e2] bg-white px-4 py-2 text-xs font-semibold tracking-wide text-[#397c68] shadow-sm">
            <Sparkles size={14} /> LAYANAN AIR BERSIH BATUGULUK
          </span>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.08] tracking-[-0.055em] text-[#173c35] sm:text-6xl lg:text-7xl">
            Air bersih,
            <br />
            <span className="text-[#329273]">pelayanan</span> lebih baik.
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-[#6b8179] sm:text-lg sm:leading-8">
            Sistem pengelolaan pelanggan dan pembayaran air bersih HIPAM
            Batuguluk Foundation. Praktis untuk pengelola, jelas untuk warga.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-3 rounded-xl bg-[#176b58] px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-[#105342]"
            >
              Masuk ke Dashboard <ArrowRight size={17} />
            </Link>
            <span className="text-sm text-[#7b8e87]">Portal khusus administrator</span>
          </div>
          <div className="mt-12 flex items-center gap-3 text-sm text-[#58736a]">
            <span className="flex -space-x-2">
              <span className="size-8 rounded-full border-2 border-[#f7faf8] bg-[#bddbc9]" />
              <span className="size-8 rounded-full border-2 border-[#f7faf8] bg-[#e8d1a9]" />
              <span className="size-8 rounded-full border-2 border-[#f7faf8] bg-[#a7c9bd]" />
            </span>
            <span>Untuk pelayanan warga yang lebih transparan</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[540px]">
          <div className="absolute -right-10 -top-14 size-56 rounded-full bg-[#dcefe4] blur-3xl" />
          <div className="absolute -bottom-12 -left-10 size-56 rounded-full bg-[#e8f1d9] blur-3xl" />
          <div className="relative rounded-[2rem] border border-white/80 bg-white/70 p-4 shadow-[0_35px_100px_-45px_rgba(27,86,67,0.35)] backdrop-blur">
            <div className="overflow-hidden rounded-[1.5rem] bg-[#eaf4ed] p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b897b]">
                    Ringkasan pembayaran
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#315d4c]">
                    Periode Januari 2024
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#318167]">
                  LUNAS
                </span>
              </div>
              <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-[#8a9b92]">Pelanggan</p>
                    <p className="mt-1 font-semibold text-[#244b3e]">Siti Aminah</p>
                    <p className="mt-1 text-xs text-[#8a9b92]">Batuguluk, Lombok Timur</p>
                  </div>
                  <div className="flex size-11 items-center justify-center rounded-xl bg-[#e8f5ee] text-[#328268]">
                    <Droplets size={21} />
                  </div>
                </div>
                <div className="my-5 border-t border-dashed border-[#dce7df]" />
                <div className="flex justify-between text-sm">
                  <span className="text-[#82948a]">No. kwitansi</span>
                  <span className="font-semibold text-[#385a4c]">KB-2024-001248</span>
                </div>
                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-[#82948a]">Pemakaian air</span>
                  <span className="font-semibold text-[#385a4c]">15 m³</span>
                </div>
                <div className="mt-5 rounded-xl bg-[#f2f8f4] p-4">
                  <p className="text-xs text-[#82948a]">Total pembayaran</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-[#176b58]">
                    Rp 52.500
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#789185]">
                <ShieldCheck size={15} /> Tercatat dengan aman oleh HIPAM Batuguluk
              </div>
            </div>
          </div>
          <div className="absolute -left-7 top-1/2 hidden -translate-y-1/2 rounded-2xl bg-white px-4 py-3 shadow-xl shadow-emerald-950/10 sm:block">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#eaf5ee] text-[#308166]">
                <Check size={18} />
              </span>
              <span>
                <span className="block text-xs font-semibold text-[#315d4c]">Pembayaran tercatat</span>
                <span className="mt-0.5 block text-[11px] text-[#8a9b92]">Kwitansi siap dicetak</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#e6eee8] bg-white/70">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-12 sm:grid-cols-3 lg:px-10">
          {highlights.map(({ icon: Icon, title, description }) => (
            <article key={title} className="flex gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf5ee] text-[#2e8065]">
                <Icon size={20} />
              </span>
              <div>
                <h2 className="font-semibold text-[#244b3e]">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-[#82948a]">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <footer className="px-6 py-6 text-center text-xs text-[#94a49c]">
        HIPAM Batuguluk Foundation
      </footer>
    </main>
  );
}
