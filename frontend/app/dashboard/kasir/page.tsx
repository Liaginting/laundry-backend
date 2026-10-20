
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Cashier = {
  id: number;
  nama: string;
  email?: string | null;
  kodeKasir?: string | null;
  role: string;
};

export default function KasirAdminPage() {
  const router = useRouter();

  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nama, setNama] = useState("");
  const [password, setPassword] = useState("");

  const loadCashiers = useCallback(async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/login");
      return;
    }

    const response = await fetch("http://localhost:3000/api/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        Array.isArray(result?.message)
          ? result.message.join(", ")
          : result?.message || "Gagal mengambil daftar kasir."
      );
    }

    setCashiers(
      Array.isArray(result) ? result : result?.data ?? []
    );
  }, [router]);

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

    loadCashiers()
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Gagal memuat data kasir."
        );
      })
      .finally(() => setLoading(false));
  }, [router, loadCashiers]);

  // Notifikasi berhasil hilang otomatis setelah 3 detik.
  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [success]);

  function resetForm() {
    setNama("");
    setPassword("");
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  function startAdd() {
    setEditingId(null);
    setNama("");
    setPassword("");
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function startEdit(cashier: Cashier) {
    setEditingId(cashier.id);
    setNama(cashier.nama);
    setPassword("");
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (!nama.trim()) {
      setError("Nama kasir wajib diisi.");
      return;
    }

    if (editingId === null && password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }

    if (password && password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }

    const editing = editingId !== null;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const url = editing
        ? `http://localhost:3000/api/users/cashier/${editingId}`
        : "http://localhost:3000/api/users/cashier";

      const body: { nama: string; password?: string } = {
        nama: nama.trim(),
      };

      if (!editing || password.length > 0) {
        body.password = password;
      }

      const response = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          Array.isArray(result?.message)
            ? result.message.join(", ")
            : result?.message || "Gagal menyimpan akun kasir."
        );
      }

      await loadCashiers();
      resetForm();

      setSuccess(
        editing
          ? "Data kasir berhasil diperbarui."
          : "Akun kasir berhasil ditambahkan."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cashier: Cashier) {
    const yakin = window.confirm(
      `Yakin ingin menghapus akun kasir ${cashier.nama}?`
    );

    if (!yakin) return;

    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/login");
      return;
    }

    setError("");
    setSuccess("");
    setDeletingId(cashier.id);

    try {
      const response = await fetch(
        `http://localhost:3000/api/users/cashier/${cashier.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          Array.isArray(result?.message)
            ? result.message.join(", ")
            : result?.message || "Gagal menghapus akun kasir."
        );
      }

      await loadCashiers();

      if (editingId === cashier.id) {
        resetForm();
      }

      setSuccess("Akun kasir berhasil dihapus.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan."
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
                Kelola Akun Kasir
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Kembali
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* TITLE */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Kelola Kasir
          </h2>
          <p className="mt-2 text-gray-500">
            Tambah, edit, dan kelola akun kasir laundry.
          </p>
        </div>

        {/* NOTIFIKASI ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* NOTIFIKASI BERHASIL */}
        {success && (
          <div className="mb-6 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* TOTAL KASIR DAN TOMBOL TAMBAH */}
        <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Akun Kasir
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {cashiers.length}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Jumlah akun kasir yang terdaftar
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (showForm) {
                  resetForm();
                  setSuccess("");
                } else {
                  startAdd();
                }
              }}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {showForm ? "Batal" : "+ Tambah Kasir"}
            </button>
          </div>
        </div>

        {/* FORM TAMBAH / EDIT */}
        {showForm && (
          <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-xl font-bold text-gray-900">
              {editingId !== null
                ? "Edit Akun Kasir"
                : "Tambah Kasir Baru"}
            </h3>

            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Nama Kasir
                  </label>
                  <input
                    name="namaKasir"
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Masukkan nama kasir"
                    required
                    autoComplete="off"
                    className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {editingId !== null
                      ? "Kata Sandi Baru (Opsional)"
                      : "Kata Sandi"}
                  </label>
                  <input
                    name="passwordKasir"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      editingId !== null
                        ? "Kosongkan jika tidak diubah"
                        : "Minimal 6 karakter"
                    }
                    required={editingId === null}
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {saving
                    ? "Menyimpan..."
                    : editingId !== null
                      ? "Simpan Perubahan"
                      : "Tambah Kasir"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* DAFTAR KASIR */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-xl font-bold text-gray-900">
            Daftar Kasir
          </h3>

          {loading ? (
            <p className="py-4 text-gray-500">
              Memuat data kasir...
            </p>
          ) : cashiers.length === 0 ? (
            <div className="rounded-xl bg-gray-50 p-6 text-center">
              <p className="font-medium text-gray-700">
                Belum ada akun kasir.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Klik Tambah Kasir untuk membuat akun baru.
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
                      Nama Kasir
                    </th>
                    <th className="px-3 py-3 text-sm font-semibold text-gray-600">
                      Kode Kasir
                    </th>
                    <th className="px-3 py-3 text-sm font-semibold text-gray-600">
                      Role
                    </th>
                    <th className="px-3 py-3 text-center text-sm font-semibold text-gray-600">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {cashiers.map((cashier, index) => (
                    <tr
                      key={cashier.id}
                      className="border-b border-gray-100 transition hover:bg-gray-50"
                    >
                      <td className="px-3 py-4 text-gray-600">
                        {index + 1}
                      </td>
                      <td className="px-3 py-4 font-medium text-gray-900">
                        {cashier.nama}
                      </td>
                      <td className="px-3 py-4 text-gray-700">
                        {cashier.kodeKasir || "-"}
                      </td>
                      <td className="px-3 py-4">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                          {cashier.role}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => startEdit(cashier)}
                            className="font-medium text-blue-600 transition hover:text-blue-800 hover:underline"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(cashier)}
                            disabled={deletingId === cashier.id}
                            className="font-medium text-red-600 transition hover:text-red-800 hover:underline disabled:opacity-50"
                          >
                            {deletingId === cashier.id
                              ? "Menghapus..."
                              : "Hapus"}
                          </button>
                        </div>
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
