"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Customer = {
  id: number;
  nama: string;
  noTelepon: string;
  alamat?: string;
};

type Service = {
  id: number;
  namaLayanan: string;
  tipe: string;
  harga: number;
  satuan: string;
  estimasiWaktu: number;
  satuanWaktu: string;
};

type OrderDetail = {
  id: number;
  jumlah: number;
  harga: number;
  subtotal: number;
  service: Service;
};

type Order = {
  id: number;
  nomorPesanan: string;
  status: string;
  opsiPengambilan: string;
  alamatPengantaran?: string;
  totalHarga: number;
  catatan?: string;
  createdAt: string;
  customer: Customer;
  details: OrderDetail[];
};

export default function DetailPesananPage() {
  const router = useRouter();
  const params = useParams();

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder();
  }, []);

  // ============================================================
  // AMBIL DETAIL PESANAN
  // ============================================================

  async function fetchOrder() {
    try {
      const token =
        localStorage.getItem("accessToken");

      if (!token) {
        router.push("/login-kasir");
        return;
      }

      const response = await fetch(
        `http://localhost:3000/orders/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Gagal mengambil detail pesanan"
        );
      }

      const data = await response.json();

      setOrder(data);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan"
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // UPDATE STATUS
  // ============================================================

  async function updateStatus(
    nextStatus: string
  ) {
    try {
      setUpdating(true);
      setError("");

      const token =
        localStorage.getItem("accessToken");

      if (!token) {
        router.push("/login-kasir");
        return;
      }

      const response = await fetch(
        `http://localhost:3000/orders/${params.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal mengubah status pesanan"
        );
      }

      // Update tampilan dengan data terbaru
      setOrder(data);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan"
      );
    } finally {
      setUpdating(false);
    }
  }

  // ============================================================
  // FORMAT RUPIAH
  // ============================================================

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  // ============================================================
  // FORMAT TANGGAL
  // ============================================================

  function formatTanggal(date: string) {
    return new Date(date).toLocaleString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  // ============================================================
  // LABEL STATUS
  // ============================================================

  function getStatusLabel(status: string) {
    switch (status) {
      case "MENUNGGU":
        return "Menunggu";

      case "DIPROSES":
        return "Diproses";

      case "SIAP_DIAMBIL":
        return "Siap Diambil";

      case "SELESAI":
        return "Selesai";

      default:
        return status;
    }
  }

  // ============================================================
  // WARNA STATUS
  // ============================================================

  function getStatusClass(status: string) {
    switch (status) {
      case "MENUNGGU":
        return "bg-yellow-50 text-yellow-600";

      case "DIPROSES":
        return "bg-blue-50 text-blue-600";

      case "SIAP_DIAMBIL":
        return "bg-green-50 text-green-600";

      case "SELESAI":
        return "bg-gray-100 text-gray-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  // ============================================================
  // TOMBOL STATUS
  // ============================================================

  function renderStatusButton() {
    if (!order) {
      return null;
    }

    if (order.status === "MENUNGGU") {
      return (
        <button
          onClick={() =>
            updateStatus("DIPROSES")
          }
          disabled={updating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition disabled:bg-blue-300"
        >
          {updating
            ? "Memproses..."
            : "Mulai Proses Pesanan"}
        </button>
      );
    }

    if (order.status === "DIPROSES") {
      return (
        <button
          onClick={() =>
            updateStatus("SIAP_DIAMBIL")
          }
          disabled={updating}
          className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition disabled:bg-green-300"
        >
          {updating
            ? "Memproses..."
            : "Tandai Siap Diambil"}
        </button>
      );
    }

    if (order.status === "SIAP_DIAMBIL") {
      return (
        <button
          onClick={() =>
            updateStatus("SELESAI")
          }
          disabled={updating}
          className="w-full bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition disabled:bg-gray-400"
        >
          {updating
            ? "Memproses..."
            : "Tandai Selesai"}
        </button>
      );
    }

    return (
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-center">
        <p className="font-semibold text-gray-700">
          Pesanan sudah selesai
        </p>

        <p className="text-sm text-gray-500 mt-1">
          Tidak ada perubahan status lagi.
        </p>
      </div>
    );
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F5F9FF] flex items-center justify-center">
        <p className="text-gray-500">
          Memuat detail pesanan...
        </p>
      </main>
    );
  }

  // ============================================================
  // PESANAN TIDAK DITEMUKAN
  // ============================================================

  if (!order) {
    return (
      <main className="min-h-screen bg-[#F5F9FF]">

        <header className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-4">

            <button
              onClick={() =>
                router.push(
                  "/dashboard-kasir/pesanan"
                )
              }
              className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium transition"
            >
              Kembali
            </button>

          </div>
        </header>

        <div className="max-w-3xl mx-auto px-6 py-10">

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">

            <div className="text-4xl mb-4">
              ⚠️
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              Pesanan tidak ditemukan
            </h2>

            <p className="text-gray-500 mt-2">
              {error ||
                "Data pesanan tidak tersedia."}
            </p>

          </div>

        </div>
      </main>
    );
  }

  // ============================================================
  // HALAMAN DETAIL
  // ============================================================

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
                Detail Pesanan
              </p>

            </div>

          </div>

          <button
            onClick={() =>
              router.push(
                "/dashboard-kasir/pesanan"
              )
            }
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            Kembali
          </button>

        </div>

      </header>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* TITLE */}
        <div className="mb-8">

          <p className="text-sm text-gray-500">
            Nomor Pesanan
          </p>

          <div className="flex items-center gap-4 mt-1">

            <h2 className="text-3xl font-bold text-gray-900">
              {order.nomorPesanan}
            </h2>

            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
                order.status
              )}`}
            >
              {getStatusLabel(
                order.status
              )}
            </span>

          </div>

          <p className="text-gray-500 mt-2">
            Dibuat pada{" "}
            {formatTanggal(
              order.createdAt
            )}
          </p>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* STATUS */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">

          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Status Pesanan
          </h3>

          {renderStatusButton()}

        </div>

        {/* DATA PELANGGAN */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">

          <h3 className="text-lg font-bold text-gray-900 mb-5">
            Data Pelanggan
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <p className="text-sm text-gray-500">
                Nama
              </p>

              <p className="font-semibold text-gray-900 mt-1">
                {order.customer.nama}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Nomor Telepon
              </p>

              <p className="font-semibold text-gray-900 mt-1">
                {order.customer.noTelepon}
              </p>
            </div>

            {order.customer.alamat && (
              <div className="md:col-span-2">

                <p className="text-sm text-gray-500">
                  Alamat
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  {order.customer.alamat}
                </p>

              </div>
            )}

          </div>

        </div>

        {/* DETAIL LAYANAN */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">

          <h3 className="text-lg font-bold text-gray-900 mb-5">
            Detail Layanan
          </h3>

          <div className="space-y-4">

            {order.details.map((detail) => (

              <div
                key={detail.id}
                className="border border-gray-200 rounded-xl p-4"
              >

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <h4 className="font-semibold text-gray-900">
                      {detail.service.namaLayanan}
                    </h4>

                    <p className="text-sm text-gray-500 mt-1">
                      {detail.service.tipe} •{" "}
                      {detail.service.satuan}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      {detail.jumlah}{" "}
                      {detail.service.satuan} ×{" "}
                      {formatRupiah(
                        detail.harga
                      )}
                    </p>

                  </div>

                  <p className="font-semibold text-gray-900">
                    {formatRupiah(
                      detail.subtotal
                    )}
                  </p>

                </div>

              </div>

            ))}

          </div>

          {/* TOTAL */}
          <div className="border-t border-gray-200 mt-6 pt-5 flex items-center justify-between">

            <p className="font-bold text-gray-900">
              Total
            </p>

            <p className="text-xl font-bold text-blue-600">
              {formatRupiah(
                order.totalHarga
              )}
            </p>

          </div>

        </div>

        {/* PENGAMBILAN */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">

          <h3 className="text-lg font-bold text-gray-900 mb-5">
            Pengambilan Pesanan
          </h3>

          <div className="space-y-4">

            <div>

              <p className="text-sm text-gray-500">
                Opsi Pengambilan
              </p>

              <p className="font-semibold text-gray-900 mt-1">
                {order.opsiPengambilan ===
                "AMBIL_SENDIRI"
                  ? "Ambil Sendiri"
                  : order.opsiPengambilan ===
                    "DIANTAR"
                  ? "Diantar"
                  : order.opsiPengambilan ===
                    "DIJEMPUT"
                  ? "Dijemput"
                  : order.opsiPengambilan}
              </p>

            </div>

            {order.alamatPengantaran && (
              <div>

                <p className="text-sm text-gray-500">
                  Alamat Pengantaran
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  {order.alamatPengantaran}
                </p>

              </div>
            )}

          </div>

        </div>

        {/* CATATAN */}
        {order.catatan && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Catatan
            </h3>

            <p className="text-gray-600 leading-relaxed">
              {order.catatan}
            </p>

          </div>
        )}

      </div>

    </main>
  );
}