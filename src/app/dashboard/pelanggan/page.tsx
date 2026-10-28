"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2, UsersRound, X } from "lucide-react";

type Customer = {
  id: number;
  nama: string;
  alamat: string;
  noHp: string | null;
  _count?: { kwitansi: number };
};

export default function PelangganPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [nama, setNama] = useState("");
  const [alamat, setAlamat] = useState("");
  const [noHp, setNoHp] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/pelanggan");
      const result = (await response.json()) as {
        customers?: Customer[];
        error?: string;
      };
      if (!response.ok) throw new Error(result.error ?? "Data pelanggan gagal dimuat.");
      setCustomers(result.customers ?? []);
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Data pelanggan gagal dimuat.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  function resetForm() {
    setSelectedId(null);
    setNama("");
    setAlamat("");
    setNoHp("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setIsSaving(true);
    try {
      const response = await fetch(
        selectedId ? `/api/pelanggan/${selectedId}` : "/api/pelanggan",
        {
          method: selectedId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nama, alamat, noHp }),
        },
      );
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Pelanggan gagal disimpan.");
      resetForm();
      await loadCustomers();
      setNotice(selectedId ? "Data pelanggan berhasil diperbarui." : "Pelanggan berhasil ditambahkan.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Pelanggan gagal disimpan.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteCustomer(customer: Customer) {
    if (!window.confirm(`Hapus pelanggan ${customer.nama}?`)) return;
    setNotice("");
    try {
      const response = await fetch(`/api/pelanggan/${customer.id}`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Pelanggan gagal dihapus.");
      await loadCustomers();
      setNotice("Pelanggan berhasil dihapus.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Pelanggan gagal dihapus.");
    }
  }

  function editCustomer(customer: Customer) {
    setSelectedId(customer.id);
    setNama(customer.nama);
    setAlamat(customer.alamat);
    setNoHp(customer.noHp ?? "");
    setNotice("");
  }

  return (
    <div className="space-y-7">
      <section>
        <p className="text-sm font-medium text-[#7d9186]">Data warga HIPAM</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#193c34] sm:text-[30px]">
          Pelanggan
        </h1>
        <p className="mt-2 text-sm text-[#8a9b92]">
          Tambah, perbarui, dan kelola data pelanggan layanan air.
        </p>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.5fr)]">
        <form
          className="space-y-4 rounded-2xl border border-[#e8eeea] bg-white p-5 shadow-sm sm:p-6"
          onSubmit={handleSubmit}
        >
          <div className="flex items-center gap-3 border-b border-[#edf1ee] pb-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#eaf5ee] text-[#328268]">
              <UsersRound size={19} />
            </span>
            <div>
              <h2 className="font-semibold text-[#284b3e]">
                {selectedId ? "Ubah pelanggan" : "Tambah pelanggan"}
              </h2>
              <p className="mt-0.5 text-xs text-[#98a59e]">
                Isi nama, alamat, dan nomor WhatsApp pelanggan
              </p>
            </div>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#58736a]">Nama lengkap</span>
            <input
              className="w-full rounded-lg border border-[#dfe8e2] px-3 py-2.5 text-sm outline-none focus:border-[#3a9375] focus:ring-4 focus:ring-[#3a9375]/10"
              onChange={(event) => setNama(event.target.value)}
              required
              value={nama}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#58736a]">Alamat</span>
            <textarea
              className="min-h-24 w-full rounded-lg border border-[#dfe8e2] px-3 py-2.5 text-sm outline-none focus:border-[#3a9375] focus:ring-4 focus:ring-[#3a9375]/10"
              onChange={(event) => setAlamat(event.target.value)}
              required
              value={alamat}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#58736a]">
              Nomor WhatsApp <span className="font-normal text-[#98a59e]">(opsional)</span>
            </span>
            <input
              autoComplete="tel"
              className="w-full rounded-lg border border-[#dfe8e2] px-3 py-2.5 text-sm outline-none focus:border-[#3a9375] focus:ring-4 focus:ring-[#3a9375]/10"
              maxLength={32}
              onChange={(event) => setNoHp(event.target.value)}
              placeholder="+62 812-3456-7890"
              type="tel"
              value={noHp}
            />
          </label>
          <div className="flex gap-2">
            <button
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#176b58] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#105342] disabled:opacity-60"
              disabled={isSaving}
              type="submit"
            >
              {selectedId ? <Pencil size={16} /> : <Plus size={16} />}
              {isSaving ? "Menyimpan..." : selectedId ? "Simpan perubahan" : "Tambah pelanggan"}
            </button>
            {selectedId !== null && (
              <button
                aria-label="Batalkan perubahan"
                className="rounded-xl border border-[#dce7df] px-3 text-[#74877f]"
                onClick={resetForm}
                type="button"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </form>

        <section className="overflow-hidden rounded-2xl border border-[#e8eeea] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#edf1ee] px-5 py-5">
            <div>
              <h2 className="font-semibold text-[#284b3e]">Daftar pelanggan</h2>
              <p className="mt-1 text-xs text-[#98a59e]">{customers.length} pelanggan terdaftar</p>
            </div>
          </div>
          {notice && (
            <p aria-live="polite" className="mx-5 mt-4 rounded-lg bg-[#f3f8f4] px-3 py-2.5 text-sm text-[#438462]">
              {notice}
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="bg-[#fafcfb] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9aa79f]">
                  <th className="px-5 py-3">Nama</th>
                  <th className="px-4 py-3">Alamat</th>
                  <th className="px-4 py-3">WhatsApp</th>
                  <th className="px-4 py-3">Transaksi</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td className="px-5 py-8 text-center text-[#82948a]" colSpan={5}>Memuat data...</td></tr>
                ) : customers.length === 0 ? (
                  <tr><td className="px-5 py-8 text-center text-[#82948a]" colSpan={5}>Belum ada data pelanggan.</td></tr>
                ) : customers.map((customer) => (
                  <tr className="border-t border-[#f0f3f1]" key={customer.id}>
                    <td className="px-5 py-4 font-semibold text-[#385a4c]">{customer.nama}</td>
                    <td className="px-4 py-4 text-xs text-[#82948a]">{customer.alamat}</td>
                    <td className="px-4 py-4 text-xs text-[#82948a]">{customer.noHp || "—"}</td>
                    <td className="px-4 py-4 text-xs text-[#82948a]">{customer._count?.kwitansi ?? 0}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          aria-label={`Ubah ${customer.nama}`}
                          className="rounded-lg p-2 text-[#438462] hover:bg-[#edf7ef]"
                          onClick={() => editCustomer(customer)}
                          type="button"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          aria-label={`Hapus ${customer.nama}`}
                          className="rounded-lg p-2 text-[#a34d30] hover:bg-[#fff4ed]"
                          onClick={() => void deleteCustomer(customer)}
                          type="button"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
