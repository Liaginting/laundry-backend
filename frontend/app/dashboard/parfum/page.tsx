
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Parfum {
  id: number;
  namaParfum: string;
}

export default function ParfumPage() {
  const router = useRouter();

  const [parfum, setParfum] = useState<Parfum[]>([]);
  const [namaParfum, setNamaParfum] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [pesan, setPesan] = useState("");

  const API_URL = "http://localhost:3000/parfum";

  // Notifikasi berhasil hilang otomatis setelah 3 detik
  useEffect(() => {
    if (!pesan) return;

    const timer = setTimeout(() => {
      setPesan("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [pesan]);

  // Memeriksa login dan hak akses admin
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (user.role !== "ADMIN") {
        router.push("/dashboard-kasir");
        return;
      }

      void fetchParfum();
    } catch {
      router.push("/login");
    }
  }, [router]);

  // Mengambil daftar parfum dari backend
  async function fetchParfum() {
    try {
      setError("");

      const token = localStorage.getItem("accessToken");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof data?.message === "string"
            ? data.message
            : "Gagal mengambil data parfum."
        );
      }

      setParfum(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error mengambil parfum:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil parfum."
      );
    } finally {
      setLoading(false);
    }
  }

  // Menambahkan parfum baru
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const nama = namaParfum.trim();
    const token = localStorage.getItem("accessToken");

    if (!nama) {
      setError("Nama parfum wajib diisi.");
      return;
    }

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setPesan("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          namaParfum: nama,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;

        throw new Error(
          message ||
            `Gagal menambahkan parfum (HTTP ${response.status}).`
        );
      }

      setNamaParfum("");
      setPesan("Parfum berhasil ditambahkan.");

      await fetchParfum();
    } catch (err) {
      console.error("Error menambahkan parfum:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menambahkan parfum."
      );
    } finally {
      setSaving(false);
    }
  }

  // Menghapus parfum
  async function handleDelete(id: number, nama: string) {
    const yakin = window.confirm(
      `Apakah kamu yakin ingin menghapus parfum "${nama}"?`
    );

    if (!yakin) return;

    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setDeletingId(id);
      setError("");
      setPesan("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;

        throw new Error(
          message ||
            `Gagal menghapus parfum (HTTP ${response.status}).`
        );
      }

      setParfum((current) =>
        current.filter((item) => item.id !== id)
      );

      setPesan("Parfum berhasil dihapus.");
    } catch (err) {
      console.error("Error menghapus parfum:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menghapus parfum."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F9FF]">
      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
              <span className="text-2xl">🧺</span>
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900">
                WashFlow
              </h1>
              <p className="text-xs text-gray-500">
                Kelola Parfum Laundry
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Kembali
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* JUDUL HALAMAN */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Parfum Laundry
          </h2>

          <p className="mt-2 text-gray-500">
            Tambahkan dan kelola pilihan parfum laundry.
          </p>
        </div>

        {/* NOTIFIKASI ERROR */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        {/* NOTIFIKASI BERHASIL */}
        {pesan && (
          <div
            role="status"
            className="mb-6 flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-700"
          >
            <span>✓</span>
            <span>{pesan}</span>
          </div>
        )}

        {/* RINGKASAN */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 text-2xl">
                🌸
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Total Jenis Parfum
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {parfum.length}
                </p>

                <p className="text-xs text-gray-400">
                  Pilihan parfum tersedia
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                🧺
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Pengelolaan Parfum
                </p>

                <p className="mt-1 text-lg font-bold text-gray-900">
                  Aktif
                </p>

                <p className="text-xs text-gray-400">
                  Kelola pilihan pewangi laundry
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FORM TAMBAH PARFUM */}
        <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-xl font-bold text-gray-900">
            Tambah Parfum
          </h3>

          <form onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="namaParfum"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Nama Parfum
              </label>

              <input
                id="namaParfum"
                type="text"
                value={namaParfum}
                onChange={(e) => setNamaParfum(e.target.value)}
                placeholder="Contoh: Lavender"
                maxLength={100}
                required
                className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-blue-500"
              />
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={saving || !namaParfum.trim()}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {saving ? "Menyimpan..." : "Tambah Parfum"}
              </button>
            </div>
          </form>
        </div>

        {/* DAFTAR PARFUM */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-xl font-bold text-gray-900">
            Daftar Parfum
          </h3>

          {loading ? (
            <p className="text-gray-500">Memuat parfum...</p>
          ) : parfum.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mb-3 text-4xl">🌸</div>

              <p className="font-medium text-gray-700">
                Belum ada parfum
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Silakan tambahkan pilihan parfum terlebih dahulu.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="px-3 py-3 text-sm font-semibold text-gray-600">
                      No.
                    </th>

                    <th className="px-3 py-3 text-sm font-semibold text-gray-600">
                      Nama Parfum
                    </th>

                    <th className="px-3 py-3 text-center text-sm font-semibold text-gray-600">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {parfum.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="px-3 py-4 text-gray-700">
                        {index + 1}
                      </td>

                      <td className="px-3 py-4 font-medium text-gray-900">
                        {item.namaParfum}
                      </td>

                      <td className="px-3 py-4 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            void handleDelete(
                              item.id,
                              item.namaParfum
                            )
                          }
                          disabled={deletingId === item.id}
                          className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === item.id
                            ? "Menghapus..."
                            : "Hapus"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
