"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Save, Settings2 } from "lucide-react";

type SettingsForm = {
  nama: string;
  email: string;
  namaAplikasi: string;
  namaOrganisasi: string;
  alamat: string;
  passwordLama: string;
  passwordBaru: string;
};

const emptyForm: SettingsForm = {
  nama: "",
  email: "",
  namaAplikasi: "",
  namaOrganisasi: "",
  alamat: "",
  passwordLama: "",
  passwordBaru: "",
};

export default function PengaturanPage() {
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/pengaturan")
      .then(async (response) => {
        const result = (await response.json()) as {
          admin?: { nama: string; email: string };
          settings?: { namaAplikasi: string; namaOrganisasi: string; alamat: string };
          error?: string;
        };
        if (!response.ok) throw new Error(result.error ?? "Pengaturan gagal dimuat.");
        setForm({
          ...emptyForm,
          nama: result.admin?.nama ?? "",
          email: result.admin?.email ?? "",
          namaAplikasi: result.settings?.namaAplikasi ?? "",
          namaOrganisasi: result.settings?.namaOrganisasi ?? "",
          alamat: result.settings?.alamat ?? "",
        });
      })
      .catch((error: unknown) => {
        setNotice(error instanceof Error ? error.message : "Pengaturan gagal dimuat.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  function updateField(field: keyof SettingsForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setIsSaving(true);
    try {
      const response = await fetch("/api/pengaturan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = (await response.json()) as {
        error?: string;
        admin?: { nama: string; email: string };
        settings?: { namaAplikasi: string; namaOrganisasi: string; alamat: string };
      };
      if (!response.ok) throw new Error(result.error ?? "Pengaturan gagal disimpan.");
      setForm((current) => ({
        ...current,
        nama: result.admin?.nama ?? current.nama,
        email: result.admin?.email ?? current.email,
        namaAplikasi: result.settings?.namaAplikasi ?? current.namaAplikasi,
        namaOrganisasi: result.settings?.namaOrganisasi ?? current.namaOrganisasi,
        alamat: result.settings?.alamat ?? current.alamat,
        passwordLama: "",
        passwordBaru: "",
      }));
      setNotice("Pengaturan berhasil disimpan.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Pengaturan gagal disimpan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-7">
      <section>
        <p className="text-sm font-medium text-[#7d9186]">Profil dan keamanan</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#193c34] sm:text-[30px]">
          Pengaturan
        </h1>
        <p className="mt-2 text-sm text-[#8a9b92]">
          Kelola identitas aplikasi dan akun administrator.
        </p>
      </section>

      <form className="max-w-3xl space-y-6" onSubmit={handleSubmit}>
        <section className="space-y-5 rounded-2xl border border-[#e8eeea] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3 border-b border-[#edf1ee] pb-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#eaf5ee] text-[#328268]">
              <Settings2 size={19} />
            </span>
            <div>
              <h2 className="font-semibold text-[#284b3e]">Profil aplikasi</h2>
              <p className="mt-0.5 text-xs text-[#98a59e]">Informasi pada profil HIPAM</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#58736a]">Nama aplikasi</span>
              <input className="w-full rounded-lg border border-[#dfe8e2] px-3 py-2.5 text-sm outline-none focus:border-[#3a9375]" onChange={(event) => updateField("namaAplikasi", event.target.value)} required value={form.namaAplikasi} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#58736a]">Nama organisasi</span>
              <input className="w-full rounded-lg border border-[#dfe8e2] px-3 py-2.5 text-sm outline-none focus:border-[#3a9375]" onChange={(event) => updateField("namaOrganisasi", event.target.value)} required value={form.namaOrganisasi} />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-[#58736a]">Alamat organisasi</span>
              <textarea className="min-h-20 w-full rounded-lg border border-[#dfe8e2] px-3 py-2.5 text-sm outline-none focus:border-[#3a9375]" onChange={(event) => updateField("alamat", event.target.value)} value={form.alamat} />
            </label>
          </div>
        </section>

        <section className="space-y-5 rounded-2xl border border-[#e8eeea] bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="font-semibold text-[#284b3e]">Akun administrator</h2>
            <p className="mt-1 text-xs text-[#98a59e]">Perbarui nama, email, atau password login</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#58736a]">Nama admin</span>
              <input className="w-full rounded-lg border border-[#dfe8e2] px-3 py-2.5 text-sm outline-none focus:border-[#3a9375]" disabled={isLoading} onChange={(event) => updateField("nama", event.target.value)} required value={form.nama} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#58736a]">Email admin</span>
              <input className="w-full rounded-lg border border-[#dfe8e2] px-3 py-2.5 text-sm outline-none focus:border-[#3a9375]" disabled={isLoading} onChange={(event) => updateField("email", event.target.value)} required type="email" value={form.email} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#58736a]">Password lama (untuk mengganti password)</span>
              <input autoComplete="current-password" className="w-full rounded-lg border border-[#dfe8e2] px-3 py-2.5 text-sm outline-none focus:border-[#3a9375]" onChange={(event) => updateField("passwordLama", event.target.value)} type="password" value={form.passwordLama} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#58736a]">Password baru (minimal 8 karakter)</span>
              <input autoComplete="new-password" className="w-full rounded-lg border border-[#dfe8e2] px-3 py-2.5 text-sm outline-none focus:border-[#3a9375]" minLength={8} onChange={(event) => updateField("passwordBaru", event.target.value)} type="password" value={form.passwordBaru} />
            </label>
          </div>
        </section>

        {notice && (
          <p aria-live="polite" className="rounded-lg bg-[#f3f8f4] px-3 py-2.5 text-sm text-[#438462]">
            {notice}
          </p>
        )}
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-[#176b58] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#105342] disabled:opacity-60"
          disabled={isLoading || isSaving}
          type="submit"
        >
          <Save size={16} /> {isSaving ? "Menyimpan..." : "Simpan pengaturan"}
        </button>
      </form>
    </div>
  );
}
