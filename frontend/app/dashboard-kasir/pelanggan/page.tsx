"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Customer {
  id: number;
  nama: string;
  noTelepon: string;
  alamat?: string;
}

export default function PelangganPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [nama, setNama] = useState("");
  const [noTelepon, setNoTelepon] = useState("");
  const [alamat, setAlamat] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        router.push("/login-kasir");
        return;
      }

      const response = await fetch(
        "http://localhost:3000/api/customers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data pelanggan");
      }

      const data = await response.json();

      setCustomers(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!nama.trim()) {
      setError("Nama pelanggan wajib diisi.");
      return;
    }

    if (!noTelepon.trim()) {
      setError("Nomor telepon wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("accessToken");

      if (!token) {
        router.push("/login-kasir");
        return;
      }

      const response = await fetch(
        "http://localhost:3000/api/customers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nama: nama.trim(),
            noTelepon: noTelepon.trim(),
            alamat: alamat.trim() || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal menambahkan pelanggan"
        );
      }

      setNama("");
      setNoTelepon("");
      setAlamat("");

      await fetchCustomers();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F9FF]">

      {/* HEADER */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">
                🧺
              </span>
            </div>

            <div>
              <h1 className="font-bold text-gray-900 text-lg">
                WashFlow
              </h1>

              <p className="text-xs text-gray-500">
                Kelola Pelanggan
              </p>
            </div>

          </div>

          <button
            onClick={() =>
              router.push("/dashboard-kasir")
            }
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            Kembali
          </button>

        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* TITLE */}
        <div className="text-center mb-8">

          <h2 className="text-3xl font-bold text-gray-900">
            Pelanggan
          </h2>

          <p className="text-gray-500 mt-2">
            Tambahkan dan lihat data pelanggan laundry.
          </p>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* FORM */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">

          <h3 className="text-xl font-bold text-gray-900 mb-5">
            Tambah Pelanggan
          </h3>

          <form onSubmit={handleSubmit}>

            <div className="space-y-5">

              {/* NAMA */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Pelanggan
                </label>

                <input
                  type="text"
                  value={nama}
                  onChange={(e) =>
                    setNama(e.target.value)
                  }
                  placeholder="Contoh: Budi"
                  className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-blue-500"
                />

              </div>

              {/* TELEPON */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon
                </label>

                <input
                  type="text"
                  value={noTelepon}
                  onChange={(e) =>
                    setNoTelepon(e.target.value)
                  }
                  placeholder="Contoh: 08123456789"
                  className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-blue-500"
                />

              </div>

              {/* ALAMAT */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat
                </label>

                <textarea
                  value={alamat}
                  onChange={(e) =>
                    setAlamat(e.target.value)
                  }
                  rows={3}
                  placeholder="Masukkan alamat pelanggan..."
                  className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-blue-500 resize-none"
                />

              </div>

            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition disabled:bg-blue-300"
            >
              {saving
                ? "Menyimpan..."
                : "Tambah Pelanggan"}
            </button>

          </form>

        </div>

        {/* DAFTAR PELANGGAN */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          <h3 className="text-xl font-bold text-gray-900 mb-5">
            Daftar Pelanggan
          </h3>

          {loading ? (

            <p className="text-gray-500 text-center py-6">
              Memuat pelanggan...
            </p>

          ) : customers.length === 0 ? (

            <p className="text-gray-500 text-center py-6">
              Belum ada pelanggan.
            </p>

          ) : (

            <div className="space-y-3">

              {customers.map((customer) => (

                <div
                  key={customer.id}
                  className="rounded-xl border border-gray-200 p-4"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <h4 className="font-semibold text-gray-900">
                        {customer.nama}
                      </h4>

                      <p className="text-sm text-gray-500 mt-1">
                        📞 {customer.noTelepon}
                      </p>

                      {customer.alamat && (
                        <p className="text-sm text-gray-500 mt-1">
                          📍 {customer.alamat}
                        </p>
                      )}

                    </div>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                      Pelanggan
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </main>
  );
}