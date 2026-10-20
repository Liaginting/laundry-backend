
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Customer = {
  id: number;
  nama: string;
  noTelepon: string;
  alamat?: string | null;
};

export default function PelangganAdminPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nama, setNama] = useState("");
  const [noTelepon, setNoTelepon] = useState("");
  const [alamat, setAlamat] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function loadCustomers(token: string) {
    const response = await fetch("http://localhost:3000/api/customers", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Gagal mengambil data pelanggan.");
    }

    const data = await response.json();
    setCustomers(Array.isArray(data) ? data : data.data ?? []);
  }

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(userData);

      if (user.role !== "ADMIN") {
        router.replace("/dashboard-kasir");
        return;
      }
    } catch {
      router.replace("/login");
      return;
    }

    loadCustomers(token)
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memuat pelanggan."
        );
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3000/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nama,
          noTelepon,
          alamat: alamat.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(
          result?.message || "Gagal menambahkan pelanggan."
        );
      }

      await loadCustomers(token);
      setNama("");
      setNoTelepon("");
      setAlamat("");
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menyimpan pelanggan."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-gray-800">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-5 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Kembali
        </button>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Kelola Pelanggan</h1>
            <p className="mt-1 text-sm text-gray-500">
              Lihat dan tambahkan pelanggan laundry.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {showForm ? "Batal" : "+ Tambah Pelanggan"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 space-y-4 rounded-xl border border-gray-200 bg-white p-5"
          >
            <h2 className="font-semibold">Tambah Pelanggan Baru</h2>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Nama pelanggan
              </label>
              <input
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                placeholder="Masukkan nama pelanggan"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Nomor telepon
              </label>
              <input
                value={noTelepon}
                onChange={(e) => setNoTelepon(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                placeholder="Masukkan nomor telepon"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Alamat (opsional)
              </label>
              <textarea
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                placeholder="Masukkan alamat pelanggan"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Pelanggan"}
            </button>
          </form>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total pelanggan</p>
          <p className="mt-1 text-2xl font-bold">{customers.length}</p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          {loading ? (
            <p className="p-6 text-gray-500">Memuat data pelanggan...</p>
          ) : customers.length === 0 ? (
            <p className="p-6 text-gray-500">
              Belum ada data pelanggan.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-5 py-3">No.</th>
                  <th className="px-5 py-3">Nama Pelanggan</th>
                  <th className="px-5 py-3">Nomor Telepon</th>
                  <th className="px-5 py-3">Alamat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((customer, index) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">{index + 1}</td>
                    <td className="px-5 py-4 font-medium">
                      {customer.nama}
                    </td>
                    <td className="px-5 py-4">{customer.noTelepon}</td>
                    <td className="px-5 py-4">
                      {customer.alamat || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
