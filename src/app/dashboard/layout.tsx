"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings2,
  UsersRound,
  Waves,
} from "lucide-react";
import type { ReactNode } from "react";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/kwitansi", label: "Kwitansi", icon: FileText },
  { href: "/dashboard/rekap", label: "Rekap Tagihan", icon: FileText },
];
const managementNavigation = [
  { href: "/dashboard/pelanggan", label: "Pelanggan", icon: UsersRound },
  { href: "/dashboard/pengaturan", label: "Pengaturan", icon: Settings2 },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState("Administrator");
  const [applicationName, setApplicationName] = useState("HIPAM Batuguluk");
  const [organizationName, setOrganizationName] = useState("BATUGULUK FOUNDATION");
  const [logoutError, setLogoutError] = useState("");
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    fetch("/api/pengaturan")
      .then(async (response) => {
        const result = (await response.json()) as {
          admin?: { nama?: string };
          settings?: { namaAplikasi?: string; namaOrganisasi?: string };
        };
        if (response.ok && result.admin?.nama) setAdminName(result.admin.nama);
        if (response.ok && result.settings?.namaAplikasi) setApplicationName(result.settings.namaAplikasi);
        if (response.ok && result.settings?.namaOrganisasi) setOrganizationName(result.settings.namaOrganisasi);
      })
      .catch(() => setProfileError("Profil admin atau aplikasi gagal dimuat."));
  }, []);

  async function handleLogout() {
    setLogoutError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Sesi gagal diakhiri.");
      router.push("/login");
      router.refresh();
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : "Logout gagal.");
    }
  }

  const currentLabel = [...navigation, ...managementNavigation].find(
    ({ href }) => href === pathname,
  )?.label ?? "Dashboard";

  return (
    <div className="min-h-screen bg-[#f5f8f6] text-[#193c34]">
      <aside className="sidebar no-print fixed inset-y-0 left-0 z-30 hidden w-[250px] flex-col border-r border-[#e8eeea] bg-white px-5 py-6 lg:flex">
        <Link href="/dashboard" className="flex items-center gap-3 px-2">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#176b58] text-white">
            <Waves size={21} />
          </span>
          <span>
            <span className="block text-sm font-bold tracking-[0.12em]">{applicationName}</span>
            <span className="block text-[10px] font-medium tracking-wide text-[#8b9b93]">
              {organizationName}
            </span>
          </span>
        </Link>

        <div className="mt-10 px-3 text-[10px] font-bold uppercase tracking-[0.17em] text-[#a2aea7]">
          Menu utama
        </div>
        <nav className="mt-3 space-y-1">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-[#eaf5ee] text-[#176b58]"
                    : "text-[#74877f] hover:bg-[#f5f8f6] hover:text-[#315d4c]"
                }`}
                href={href}
                key={href}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {label}
                {label === "Kwitansi" && (
                  <ArrowUpRight className="ml-auto" size={14} />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.17em] text-[#a2aea7]">
          Pengelolaan
        </div>
        <div className="mt-3 space-y-1">
          {managementNavigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-[#eaf5ee] text-[#176b58]"
                    : "text-[#74877f] hover:bg-[#f5f8f6] hover:text-[#315d4c]"
                }`}
                href={href}
                key={href}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto rounded-2xl bg-[#f3f8f4] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#3d6957]">
            <span className="size-2 rounded-full bg-[#46a37f]" />
            Sistem siap digunakan
          </div>
          <p className="mt-2 text-[11px] leading-5 text-[#84978d]">
            Kelola tagihan air warga dengan lebih mudah dan teratur.
          </p>
        </div>
        <button
          className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-[#82948a] transition hover:bg-[#f5f8f6] hover:text-[#315d4c]"
          onClick={handleLogout}
          type="button"
        >
          <LogOut size={18} strokeWidth={1.8} /> Keluar
        </button>
      </aside>

      <div className="lg:pl-[250px]">
        <header className="topbar no-print sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-[#e8eeea] bg-white/95 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-[#176b58] text-white lg:hidden">
              <Waves size={19} />
            </span>
            <div className="lg:hidden">
              <p className="text-sm font-bold">{applicationName}</p>
              <p className="text-[10px] text-[#8b9b93]">Admin Panel</p>
            </div>
            <div className="hidden text-sm text-[#92a098] lg:block">
              Portal <span className="mx-1.5">/</span>
              <span className="font-medium text-[#486a5b]">
                {currentLabel}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-[#35594a]">{adminName}</p>
              <p className="mt-0.5 text-[10px] text-[#99a69f]">Pengelola HIPAM</p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-full bg-[#eaf5ee] text-xs font-bold text-[#267458]">
              AD
            </span>
          </div>
        </header>
        <nav className="sidebar no-print flex gap-2 overflow-x-auto border-b border-[#e8eeea] bg-white px-5 py-3 lg:hidden">
          {[...navigation, ...managementNavigation].map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${
                  active
                    ? "bg-[#eaf5ee] text-[#176b58]"
                    : "text-[#74877f] hover:bg-[#f5f8f6]"
                }`}
                href={href}
                key={href}
              >
                <Icon size={15} /> {label}
              </Link>
            );
          })}
        </nav>
        {logoutError && (
          <p aria-live="polite" className="no-print mx-5 mt-3 rounded-lg bg-[#fff4ed] px-3 py-2 text-xs text-[#a34d30] sm:mx-8">
            {logoutError}
          </p>
        )}
        {profileError && (
          <p aria-live="polite" className="no-print mx-5 mt-3 rounded-lg bg-[#fff4ed] px-3 py-2 text-xs text-[#a34d30] sm:mx-8">
            {profileError}
          </p>
        )}
        <main className="mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-8 sm:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}
