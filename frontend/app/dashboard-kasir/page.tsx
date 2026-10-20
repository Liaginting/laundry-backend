"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  tenantId: number;
  nama: string;
  role: string;
  kodeKasir?: string;
};

type Order = {
  id: number;
  nomorPesanan: string;
  status: string;
  createdAt: string;
};

export default function DashboardKasirPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login-kasir");
      return;
    }

    const userData = JSON.parse(storedUser);

    if (userData.role !== "STAFF") {
      router.push("/dashboard");
      return;
    }

    setUser(userData);

    fetchOrders();
  }, [router]);

  async function fetchOrders() {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        return;
      }

      const response = await fetch(
        "http://localhost:3000/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Gagal mengambil data pesanan"
        );
      }

      const data = await response.json();

      setOrders(data);
    } catch (error) {
      console.error(error);
    }
  }

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    router.push("/");
  }

  /*
   * Menghitung pesanan yang dibuat hari ini.
   */
  const today = new Date();

  const pesananHariIni = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);

    return (
      orderDate.getDate() === today.getDate() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getFullYear() === today.getFullYear()
    );
  }).length;

  /*
   * Menghitung pesanan yang sedang diproses.
   */
  const sedangDiproses = orders.filter(
    (order) => order.status === "DIPROSES"
  ).length;

  /*
   * Menghitung pesanan yang siap diambil.
   */
  const siapDiambil = orders.filter(
    (order) => order.status === "SIAP_DIAMBIL"
  ).length;

  if (!user) {
    return (
      <main className="min-h-screen bg-[#F5F9FF] flex items-center justify-center">
        <p className="text-gray-500">
          Memuat dashboard...
        </p>
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
              <span className="text-2xl">
                🧺
              </span>
            </div>

            <div>
              <h1 className="font-bold text-gray-900 text-lg">
                WashFlow
              </h1>

              <p className="text-xs text-gray-500">
                Dashboard Kasir
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">

            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {user.nama}
              </p>

              <p className="text-xs text-blue-600">
                Kasir • {user.kodeKasir}
              </p>
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
            Kelola pesanan dan pelanggan laundry hari ini.
          </p>
        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          {/* PESANAN HARI INI */}
          <button
            onClick={() =>
              router.push(
                "/dashboard-kasir/pesanan"
              )
            }
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left hover:shadow-md hover:border-blue-200 transition"
          >
            <p className="text-sm text-gray-500">
              Pesanan Hari Ini
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {pesananHariIni}
            </p>

            <p className="text-xs text-gray-400 mt-2">
              {pesananHariIni === 0
                ? "Belum ada pesanan hari ini"
                : "Pesanan yang dibuat hari ini"}
            </p>
          </button>

          {/* SEDANG DIPROSES */}
          <button
            onClick={() =>
              router.push(
                "/dashboard-kasir/pesanan?status=DIPROSES"
              )
            }
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left hover:shadow-md hover:border-blue-200 transition"
          >
            <p className="text-sm text-gray-500">
              Sedang Diproses
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {sedangDiproses}
            </p>

            <p className="text-xs text-gray-400 mt-2">
              Pesanan yang sedang dikerjakan
            </p>
          </button>

          {/* SIAP DIAMBIL */}
          <button
            onClick={() =>
              router.push(
                "/dashboard-kasir/pesanan?status=SIAP_DIAMBIL"
              )
            }
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left hover:shadow-md hover:border-blue-200 transition"
          >
            <p className="text-sm text-gray-500">
              Siap Diambil
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {siapDiambil}
            </p>

            <p className="text-xs text-gray-400 mt-2">
              Menunggu pelanggan
            </p>
          </button>

        </div>

        {/* MENU */}
        <div className="mb-8">

          <h3 className="text-xl font-bold text-gray-900 mb-5">
            Menu Utama
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* PESANAN */}
            <button
              onClick={() =>
                router.push(
                  "/dashboard-kasir/pesanan"
                )
              }
              className="bg-white rounded-2xl p-6 text-left border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">
                  🧾
                </span>
              </div>

              <h4 className="font-bold text-gray-900">
                Pesanan
              </h4>

              <p className="text-sm text-gray-500 mt-1">
                Tambah dan kelola pesanan laundry
              </p>
            </button>

            {/* PELANGGAN */}
            <button
              onClick={() =>
                router.push(
                  "/dashboard-kasir/pelanggan"
                )
              }
              className="bg-white rounded-2xl p-6 text-left border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">
                  👥
                </span>
              </div>

              <h4 className="font-bold text-gray-900">
                Pelanggan
              </h4>

              <p className="text-sm text-gray-500 mt-1">
                Tambah dan kelola data pelanggan
              </p>
            </button>

          </div>
        </div>

        {/* INFO */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">

          <h3 className="font-bold text-gray-900 mb-2">
            Akses Kasir
          </h3>

          <p className="text-sm text-gray-500 leading-relaxed">
            Sebagai Kasir, Anda dapat mengelola pesanan,
            pelanggan, serta membantu proses pengiriman
            notifikasi dan struk kepada pelanggan.
          </p>

        </div>

      </div>
    </main>
  );
}