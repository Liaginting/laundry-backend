
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Order = {
  id: number;
  nomorPesanan: string;
  status: string;
  totalHarga: number;
  createdAt: string;
  customer?: {
    nama: string;
    noTelepon: string;
  };
  user?: {
    nama: string;
  };
};

export default function PesananAdminPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("SEMUA");

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

    async function fetchOrders() {
      try {
        const response = await fetch("http://localhost:3000/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data pesanan.");
        }

        const data = await response.json();
        setOrders(Array.isArray(data) ? data : data.data ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengambil pesanan."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [router]);

  const filteredOrders =
    filter === "SEMUA"
      ? orders
      : orders.filter((order) => order.status === filter);

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
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
            <h1 className="text-2xl font-bold">Kelola Pesanan</h1>
            <p className="mt-1 text-sm text-gray-500">
              Daftar pesanan laundry di tempat usaha kamu.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard-kasir/pesanan/buat")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Buat Pesanan
          </button>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {[
            { label: "Semua", value: "SEMUA" },
            { label: "Menunggu", value: "MENUNGGU" },
            { label: "Diproses", value: "DIPROSES" },
            { label: "Siap Diambil", value: "SIAP_DIAMBIL" },
            { label: "Selesai", value: "SELESAI" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`rounded-lg border px-4 py-2 text-sm ${
                filter === item.value
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-200 bg-white hover:bg-gray-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          {loading ? (
            <p className="p-6 text-gray-500">Memuat data pesanan...</p>
          ) : error ? (
            <div className="p-6">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 text-sm text-blue-600 hover:underline"
              >
                Coba lagi
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <p className="p-6 text-gray-500">
              Belum ada pesanan untuk kategori ini.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-5 py-3">No. Pesanan</th>
                  <th className="px-5 py-3">Pelanggan</th>
                  <th className="px-5 py-3">Tanggal</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Kasir</th>
                  <th className="px-5 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-5 py-4 font-medium">
                      {order.nomorPesanan}
                    </td>
                    <td className="px-5 py-4">
                      {order.customer?.nama ?? "-"}
                      <div className="text-xs text-gray-500">
                        {order.customer?.noTelepon ?? ""}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {new Date(order.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {formatRupiah(order.totalHarga)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {order.status.replaceAll("_", " ")}
                    </td>
                    <td className="px-5 py-4">
                      {order.user?.nama ?? "-"}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard-kasir/pesanan/${order.id}`
                          )
                        }
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="mt-3 text-sm text-gray-500">
          Menampilkan {filteredOrders.length} pesanan.
        </p>
      </div>
    </main>
  );
}
