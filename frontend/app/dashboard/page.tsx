
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  tenantId: number;
  nama: string;
  email?: string;
  role: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(storedUser);

      if (userData.role !== "ADMIN") {
        router.push("/dashboard-kasir");
        return;
      }

      setUser(userData);
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    router.push("/");
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#F5F9FF] flex items-center justify-center">
        <p className="text-gray-500">Memuat dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F9FF]">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🧺</span>
            </div>

            <div>
              <h1 className="font-bold text-gray-900 text-lg">
                WashFlow
              </h1>
              <p className="text-xs text-gray-500">
                Dashboard Admin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {user.nama}
              </p>
              <p className="text-xs text-blue-600">Admin</p>
            </div>

            <button
              onClick={handleLogout}
              className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium transition"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* WELCOME */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Selamat datang, {user.nama} 👋
          </h2>

          <p className="text-gray-500 mt-2">
            Kelola operasional laundry Anda dengan mudah.
          </p>
        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">
              Pesanan Hari Ini
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              0
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Belum ada data pesanan
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Pelanggan</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              0
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Total pelanggan
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">
              Pesanan Diproses
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              0
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Sedang dikerjakan
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">
              Pendapatan Hari Ini
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              Rp 0
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Belum ada transaksi
            </p>
          </div>
        </div>

        {/* MENU UTAMA */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-5">
            Menu Utama
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* PESANAN */}
            <button
              onClick={() => router.push("/dashboard/pesanan")}
              className="bg-white rounded-2xl p-6 text-left border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🧾</span>
              </div>
              <h4 className="font-bold text-gray-900">Pesanan</h4>
              <p className="text-sm text-gray-500 mt-1">
                Kelola pesanan laundry
              </p>
            </button>

            {/* PELANGGAN */}
            <button
              onClick={() => router.push("/dashboard/pelanggan")}
              className="bg-white rounded-2xl p-6 text-left border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h4 className="font-bold text-gray-900">Pelanggan</h4>
              <p className="text-sm text-gray-500 mt-1">
                Kelola data pelanggan
              </p>
            </button>

            {/* LAYANAN */}
            <button
              onClick={() => router.push("/dashboard/layanan")}
              className="bg-white rounded-2xl p-6 text-left border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🧼</span>
              </div>
              <h4 className="font-bold text-gray-900">Layanan</h4>
              <p className="text-sm text-gray-500 mt-1">
                Kelola layanan laundry
              </p>
            </button>

            {/* KASIR */}
            <button
              onClick={() => router.push("/dashboard/kasir")}
              className="bg-white rounded-2xl p-6 text-left border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <h4 className="font-bold text-gray-900">Kasir</h4>
              <p className="text-sm text-gray-500 mt-1">
                Kelola akun kasir
              </p>
            </button>

            {/* BAHAN LAUNDRY — PENGGANTI PARFUM */}
            <button
              onClick={() => router.push("/dashboard/bahan-laundry")}
              className="bg-white rounded-2xl p-6 text-left border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition"
            >
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🧴</span>
              </div>
              <h4 className="font-bold text-gray-900">
                Bahan Laundry
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                Kelola stok deterjen, parfum, dan pelembut
              </p>
            </button>

            {/* LAPORAN */}
            <button
              onClick={() => router.push("/dashboard/laporan")}
              className="bg-white rounded-2xl p-6 text-left border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition"
            >
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="font-bold text-gray-900">Laporan</h4>
              <p className="text-sm text-gray-500 mt-1">
                Lihat laporan transaksi
              </p>
            </button>
          </div>
        </div>

        {/* INFO */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-2">
            Akses Admin
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Sebagai Admin, Anda dapat mengelola layanan,
            pelanggan, pesanan, kasir, bahan laundry, dan laporan.
          </p>
        </div>
      </div>
    </main>
  );
}
