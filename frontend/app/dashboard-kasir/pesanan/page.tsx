"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Customer = {
  id: number;
  nama: string;
  noTelepon: string;
};

type Order = {
  id: number;
  nomorPesanan: string;
  status: string;
  totalHarga: number;
  createdAt: string;
  customer: Customer;
};

export default function PesananPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const status = params.get("status");

    setStatusFilter(status || "");

    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        router.push("/login-kasir");
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
    } finally {
      setLoading(false);
    }
  }

  // ============================
  // FILTER PESANAN
  // ============================

  const filteredOrders = orders.filter((order) => {
    if (!statusFilter) {
      return true;
    }

    return order.status === statusFilter;
  });

  // ============================
  // JUDUL HALAMAN
  // ============================

  let pageTitle = "Daftar Pesanan";
  let pageDescription =
    "Kelola seluruh pesanan laundry.";

  if (statusFilter === "DIPROSES") {
    pageTitle = "Pesanan Sedang Diproses";
    pageDescription =
      "Daftar pesanan yang sedang dikerjakan.";
  }

  if (statusFilter === "SIAP_DIAMBIL") {
    pageTitle = "Pesanan Siap Diambil";
    pageDescription =
      "Daftar pesanan yang sudah selesai diproses dan siap diambil.";
  }

  // ============================
  // FORMAT RUPIAH
  // ============================

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  // ============================
  // FORMAT TANGGAL
  // ============================

  function formatTanggal(date: string) {
    return new Date(date).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F9FF]">

      {/* HEADER */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* LOGO */}
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
                {pageTitle}
              </p>
            </div>

          </div>

          {/* BUTTON HEADER */}
          <div className="flex items-center gap-3">

            {/* BUAT PESANAN
                HANYA MUNCUL DI HALAMAN SEMUA PESANAN */}
            {!statusFilter && (
              <button
                onClick={() =>
                  router.push(
                    "/dashboard-kasir/pesanan/buat"
                  )
                }
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
              >
                + Buat Pesanan
              </button>
            )}

            {/* KEMBALI */}
            <button
              onClick={() =>
                router.push("/dashboard-kasir")
              }
              className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium transition"
            >
              Kembali
            </button>

          </div>

        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* TITLE */}
        <div className="mb-8">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-3xl font-bold text-gray-900">
                {pageTitle}
              </h2>

              <p className="text-gray-500 mt-2">
                {pageDescription}
              </p>

            </div>

            {/* HAPUS FILTER */}
            {statusFilter && (
              <button
                onClick={() =>
                  router.push(
                    "/dashboard-kasir/pesanan"
                  )
                }
                className="border border-gray-300 bg-white text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Hapus Filter
              </button>
            )}

          </div>

        </div>

        {/* LOADING */}
        {loading ? (

          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">

            <p className="text-gray-500">
              Memuat pesanan...
            </p>

          </div>

        ) : (

          /* DATA PESANAN */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* HEADER TABLE */}
            <div className="px-6 py-5 border-b border-gray-100">

              <h3 className="font-bold text-gray-900">

                {statusFilter
                  ? `Pesanan ${
                      statusFilter === "DIPROSES"
                        ? "Sedang Diproses"
                        : "Siap Diambil"
                    }`
                  : "Semua Pesanan"}

              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Total: {filteredOrders.length} pesanan
              </p>

            </div>

            {/* TIDAK ADA PESANAN */}
            {filteredOrders.length === 0 ? (

              <div className="p-10 text-center">

                <div className="text-4xl mb-3">
                  🧾
                </div>

                <p className="font-semibold text-gray-700">
                  Tidak ada pesanan
                </p>

                <p className="text-sm text-gray-500 mt-1">

                  {statusFilter
                    ? "Belum ada pesanan dengan status ini."
                    : "Belum ada pesanan laundry."}

                </p>

              </div>

            ) : (

              /* TABLE */
              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-gray-50">

                    <tr>

                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                        Nomor Pesanan
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                        Pelanggan
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                        Total
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                        Tanggal
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                        Aksi
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {filteredOrders.map((order) => (

                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 transition"
                      >

                        {/* NOMOR PESANAN */}
                        <td className="px-6 py-4">

                          <p className="font-semibold text-gray-900">
                            {order.nomorPesanan}
                          </p>

                        </td>

                        {/* PELANGGAN */}
                        <td className="px-6 py-4">

                          <p className="text-sm font-medium text-gray-900">
                            {order.customer?.nama ||
                              "-"}
                          </p>

                          <p className="text-xs text-gray-500">
                            {order.customer
                              ?.noTelepon || "-"}
                          </p>

                        </td>

                        {/* TOTAL */}
                        <td className="px-6 py-4">

                          <p className="text-sm font-semibold text-gray-900">
                            {formatRupiah(
                              order.totalHarga
                            )}
                          </p>

                        </td>

                        {/* STATUS */}
                        <td className="px-6 py-4">

                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              order.status ===
                              "MENUNGGU"
                                ? "bg-yellow-50 text-yellow-600"
                                : order.status ===
                                  "DIPROSES"
                                ? "bg-blue-50 text-blue-600"
                                : order.status ===
                                  "SIAP_DIAMBIL"
                                ? "bg-green-50 text-green-600"
                                : order.status ===
                                  "SELESAI"
                                ? "bg-gray-100 text-gray-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >

                            {order.status ===
                            "SIAP_DIAMBIL"
                              ? "Siap Diambil"
                              : order.status ===
                                "DIPROSES"
                              ? "Diproses"
                              : order.status ===
                                "MENUNGGU"
                              ? "Menunggu"
                              : order.status}

                          </span>

                        </td>

                        {/* TANGGAL */}
                        <td className="px-6 py-4">

                          <p className="text-sm text-gray-600">
                            {formatTanggal(
                              order.createdAt
                            )}
                          </p>

                        </td>

                        {/* AKSI */}
                        <td className="px-6 py-4">

                          <button
                            onClick={() =>
                              router.push(
                                `/dashboard-kasir/pesanan/${order.id}`
                              )
                            }
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            Lihat Detail
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        )}

      </div>

    </main>
  );
}