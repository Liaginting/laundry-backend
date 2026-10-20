"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Customer {
  id: number;
  nama: string;
  noTelepon: string;
}

interface Service {
  id: number;
  namaLayanan: string;
  tipe: string;
  harga: number;
  satuan: string;
  estimasiWaktu: number;
  satuanWaktu: string;
}

interface OrderDetail {
  serviceId: string;
  jumlah: number;
}

export default function PesananPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [customerId, setCustomerId] = useState("");

  const [details, setDetails] = useState<OrderDetail[]>([
    {
      serviceId: "",
      jumlah: 1,
    },
  ]);

  const [opsiPengambilan, setOpsiPengambilan] =
    useState("AMBIL_SENDIRI");

  const [alamatPengantaran, setAlamatPengantaran] =
    useState("");

  const [catatan, setCatatan] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        router.push("/login");
        return;
      }

      const [customerResponse, serviceResponse] =
        await Promise.all([
          fetch("http://localhost:3000/api/customers", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch("http://localhost:3000/api/services", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      if (!customerResponse.ok) {
        throw new Error(
          "Gagal mengambil data customer"
        );
      }

      if (!serviceResponse.ok) {
        throw new Error(
          "Gagal mengambil data layanan"
        );
      }

      const customerData =
        await customerResponse.json();

      const serviceData =
        await serviceResponse.json();

      setCustomers(customerData);
      setServices(serviceData);
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

  function updateDetail(
    index: number,
    field: keyof OrderDetail,
    value: string | number
  ) {
    setDetails((currentDetails) =>
      currentDetails.map((detail, i) =>
        i === index
          ? {
              ...detail,
              [field]: value,
            }
          : detail
      )
    );
  }

  function addDetail() {
    setDetails((currentDetails) => [
      ...currentDetails,
      {
        serviceId: "",
        jumlah: 1,
      },
    ]);
  }

  function removeDetail(index: number) {
    if (details.length === 1) {
      return;
    }

    setDetails((currentDetails) =>
      currentDetails.filter((_, i) => i !== index)
    );
  }

  function getSubtotal(detail: OrderDetail) {
    const service = services.find(
      (item) =>
        item.id === Number(detail.serviceId)
    );

    if (!service) {
      return 0;
    }

    return service.harga * detail.jumlah;
  }

  const totalHarga = details.reduce(
    (total, detail) =>
      total + getSubtotal(detail),
    0
  );

  async function handleSubmit() {
    try {
      setError("");

      const token =
        localStorage.getItem("accessToken");

      if (!token) {
        router.push("/login");
        return;
      }

      if (!customerId) {
        setError(
          "Silakan pilih customer terlebih dahulu."
        );
        return;
      }

      const validDetails = details.filter(
        (detail) => detail.serviceId
      );

      if (validDetails.length === 0) {
        setError(
          "Silakan pilih minimal satu layanan."
        );
        return;
      }

      const invalidQuantity =
        validDetails.some(
          (detail) => detail.jumlah <= 0
        );

      if (invalidQuantity) {
        setError(
          "Jumlah layanan harus lebih dari 0."
        );
        return;
      }

      if (
        opsiPengambilan === "DIANTAR" &&
        !alamatPengantaran.trim()
      ) {
        setError(
          "Alamat pengantaran wajib diisi."
        );
        return;
      }

      setSaving(true);

      const response = await fetch(
        "http://localhost:3000/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            customerId: Number(customerId),

            opsiPengambilan,

            alamatPengantaran:
              opsiPengambilan === "DIANTAR"
                ? alamatPengantaran.trim()
                : undefined,

            catatan:
              catatan.trim() || undefined,

            details: validDetails.map(
              (detail) => ({
                serviceId: Number(
                  detail.serviceId
                ),
                jumlah: Number(detail.jumlah),
              })
            ),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal membuat pesanan"
        );
      }

      alert(
        `Pesanan ${data.nomorPesanan} berhasil dibuat!`
      );

      router.push("/dashboard-kasir");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat membuat pesanan"
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
                Buat Pesanan Laundry
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
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Buat Pesanan
          </h2>

          <p className="text-gray-500 mt-2">
            Masukkan data pelanggan dan layanan laundry.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">
              Memuat data...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* CUSTOMER */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-5">
                Data Pelanggan
              </h3>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Customer
              </label>

              <select
                value={customerId}
                onChange={(e) =>
                  setCustomerId(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white p-3 outline-none focus:border-blue-500"
              >
                <option value="">
                  -- Pilih Customer --
                </option>

                {customers.map((customer) => (
                  <option
                    key={customer.id}
                    value={customer.id}
                  >
                    {customer.nama} -{" "}
                    {customer.noTelepon}
                  </option>
                ))}
              </select>
            </div>

            {/* LAYANAN */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Layanan Laundry
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Tambahkan satu atau lebih layanan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addDetail}
                  className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100 transition"
                >
                  + Tambah Layanan
                </button>
              </div>

              <div className="space-y-4">
                {details.map(
                  (detail, index) => {
                    const selectedService =
                      services.find(
                        (service) =>
                          service.id ===
                          Number(
                            detail.serviceId
                          )
                      );

                    const subtotal =
                      getSubtotal(detail);

                    return (
                      <div
                        key={index}
                        className="rounded-xl border border-gray-200 p-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <p className="font-semibold text-gray-800">
                            Layanan {index + 1}
                          </p>

                          {details.length >
                            1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeDetail(
                                  index
                                )
                              }
                              className="text-sm font-medium text-red-500 hover:text-red-700"
                            >
                              Hapus
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* SERVICE */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Pilih Layanan
                            </label>

                            <select
                              value={
                                detail.serviceId
                              }
                              onChange={(e) =>
                                updateDetail(
                                  index,
                                  "serviceId",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-xl border border-gray-300 bg-white p-3 outline-none focus:border-blue-500"
                            >
                              <option value="">
                                -- Pilih Layanan --
                              </option>

                              {services.map(
                                (service) => (
                                  <option
                                    key={
                                      service.id
                                    }
                                    value={
                                      service.id
                                    }
                                  >
                                    {
                                      service.namaLayanan
                                    }{" "}
                                    -{" "}
                                    {
                                      service.tipe
                                    }{" "}
                                    - Rp{" "}
                                    {service.harga.toLocaleString(
                                      "id-ID"
                                    )}{" "}
                                    /{" "}
                                    {
                                      service.satuan
                                    }
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          {/* JUMLAH */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Jumlah
                            </label>

                            <input
                              type="number"
                              min="1"
                              value={
                                detail.jumlah
                              }
                              onChange={(e) =>
                                updateDetail(
                                  index,
                                  "jumlah",
                                  Number(
                                    e.target.value
                                  )
                                )
                              }
                              className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        {/* DETAIL LAYANAN */}
                        {selectedService && (
                          <div className="mt-4 rounded-xl bg-blue-50 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="font-semibold text-blue-900">
                                  {
                                    selectedService.namaLayanan
                                  }
                                </p>

                                <p className="text-sm text-blue-700 mt-1">
                                  Tipe:{" "}
                                  {
                                    selectedService.tipe
                                  }{" "}
                                  • Estimasi:{" "}
                                  {
                                    selectedService.estimasiWaktu
                                  }{" "}
                                  {
                                    selectedService.satuanWaktu
                                  }
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-sm text-blue-700">
                                  Subtotal
                                </p>

                                <p className="font-bold text-blue-900">
                                  Rp{" "}
                                  {subtotal.toLocaleString(
                                    "id-ID"
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* PENGAMBILAN */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-5">
                Pengambilan Laundry
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setOpsiPengambilan(
                      "AMBIL_SENDIRI"
                    )
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    opsiPengambilan ===
                    "AMBIL_SENDIRI"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <p className="font-semibold text-gray-900">
                    Ambil Sendiri
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Customer mengambil laundry.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setOpsiPengambilan(
                      "DIANTAR"
                    )
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    opsiPengambilan ===
                    "DIANTAR"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <p className="font-semibold text-gray-900">
                    Diantar
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Laundry diantar ke customer.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setOpsiPengambilan(
                      "DIJEMPUT"
                    )
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    opsiPengambilan ===
                    "DIJEMPUT"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <p className="font-semibold text-gray-900">
                    Dijemput
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Laundry dijemput dari customer.
                  </p>
                </button>
              </div>

              {opsiPengambilan ===
                "DIANTAR" && (
                <div className="mt-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Pengantaran
                  </label>

                  <textarea
                    value={
                      alamatPengantaran
                    }
                    onChange={(e) =>
                      setAlamatPengantaran(
                        e.target.value
                      )
                    }
                    rows={3}
                    placeholder="Masukkan alamat pengantaran..."
                    className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              )}
            </div>

            {/* CATATAN */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-5">
                Catatan
              </h3>

              <textarea
                value={catatan}
                onChange={(e) =>
                  setCatatan(e.target.value)
                }
                rows={4}
                placeholder="Contoh: Jangan gunakan pewangi..."
                className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* TOTAL */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Total Pesanan
                  </p>

                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    Rp{" "}
                    {totalHarga.toLocaleString(
                      "id-ID"
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white hover:bg-blue-700 transition disabled:bg-blue-300"
                >
                  {saving
                    ? "Menyimpan..."
                    : "Buat Pesanan"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}