"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Droplets,
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
} from "lucide-react";

type LoginErrorResponse = {
  message?: string;
  error?: string;
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        window.location.href = "/dashboard";
        return;
      }

      const result = (await response.json()) as LoginErrorResponse;
      setErrorMsg(
        result.message ?? result.error ?? "Email atau password salah.",
      );
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen bg-white text-[#173c35]">
      <section className="relative hidden w-[48%] overflow-hidden bg-[#155d4d] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-36 -top-28 size-[30rem] rounded-full border border-white/10" />
        <div className="absolute -right-16 -top-4 size-[22rem] rounded-full border border-white/10" />
        <div className="absolute -bottom-36 -left-20 size-[34rem] rounded-full bg-[#2c8066]/50 blur-3xl" />
        <Link href="/" className="relative flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-white/15">
            <Droplets size={23} />
          </span>
          <span>
            <span className="block text-sm font-bold tracking-[0.14em]">HIPAM</span>
            <span className="block text-[11px] text-white/65">
              BATUGULUK FOUNDATION
            </span>
          </span>
        </Link>
        <div className="relative max-w-lg pb-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#add9c5]">
            Portal pengelola
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-tight tracking-[-0.05em]">
            Kelola layanan, jaga kepercayaan.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-white/70">
            Akses dashboard pengelolaan pelanggan dan pembayaran air bersih
            HIPAM Batuguluk.
          </p>
        </div>
        <p className="relative text-xs text-white/50">
          HIPAM Batuguluk Foundation
        </p>
      </section>

      <section className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          <Link
            href="/"
            className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-[#74877f] transition hover:text-[#176b58]"
          >
            <ArrowLeft size={16} /> Kembali ke beranda
          </Link>
          <div className="mb-8 flex size-12 items-center justify-center rounded-2xl bg-[#eaf5ee] text-[#176b58] lg:hidden">
            <Droplets size={24} />
          </div>
          <p className="text-sm font-semibold text-[#39826a]">SELAMAT DATANG</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#173c35]">
            Login Admin
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#82948a]">
            Masuk menggunakan akun administrator HIPAM Batuguluk.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#385a4c]">
                Email
              </span>
              <span className="relative block">
                <UserRound
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91a197]"
                />
                <input
                  autoComplete="email"
                  className="w-full rounded-xl border border-[#dce7df] bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#b2bdb6] focus:border-[#3a9375] focus:ring-4 focus:ring-[#3a9375]/10"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hipam.local"
                  required
                  type="email"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#385a4c]">
                Password
              </span>
              <span className="relative block">
                <LockKeyhole
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91a197]"
                />
                <input
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-[#dce7df] bg-white py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-[#b2bdb6] focus:border-[#3a9375] focus:ring-4 focus:ring-[#3a9375]/10"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                  required
                  type={showPassword ? "text" : "password"}
                />
                <button
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#91a197] hover:text-[#176b58]"
                  onClick={() => setShowPassword((visible) => !visible)}
                  type="button"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>

            <button
              className="w-full rounded-xl bg-[#176b58] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[#105342] focus:outline-none focus:ring-4 focus:ring-[#176b58]/20 disabled:cursor-wait disabled:opacity-70"
              disabled={loading}
              type="submit"
            >
              {loading ? "Memverifikasi..." : "Masuk ke Dashboard"}
            </button>

            {errorMsg && (
              <p
                aria-live="polite"
                className="rounded-xl border border-[#f1dfb8] bg-[#fff9eb] p-3 text-sm leading-5 text-[#85682a]"
              >
                {errorMsg}
              </p>
            )}
          </form>

          <p className="mt-8 border-t border-[#edf1ee] pt-6 text-center text-xs leading-5 text-[#9aa79f]">
            Akses terbatas untuk administrator HIPAM Batuguluk.
          </p>
        </div>
      </section>
    </main>
  );
}