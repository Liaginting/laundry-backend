"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Service {
  id: number;
  namaLayanan: string;
  tipe: string;
  harga: number;
  satuan: string;
  estimasiWaktu: number;
  satuanWaktu: string;
}

export default function LayananPage() {
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [namaLayanan, setNamaLayanan] = useState("");
  const [tipe, setTipe] = useState("REGULER");
  const [harga, setHarga] = useState("");
  const [satuan, setSatuan] = useState("KG");
  const [estimasiWaktu, setEstimasiWaktu] = useState("2");
  const [satuanWaktu, setSatuanWaktu] = useState("HARI");

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        "http://localhost:3000/api/services",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data layanan");
      }

      const data = await response.json();

      setServices(data);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!namaLayanan.trim() || !harga) {
      setError("Nama layanan dan harga wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("accessToken");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        "http://localhost:3000/api/services",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            namaLayanan: namaLayanan.trim(),
            tipe,
            harga: Number(harga),
            satuan,
            estimasiWaktu: Number(estimasiWaktu),
            satuanWaktu,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();

        throw new Error(
          data.message || "Gagal menambahkan layanan"
        );
      }

      setNamaLayanan("");
      setTipe("REGULER");
      setHarga("");
      setSatuan("KG");
      setEstimasiWaktu("2");
      setSatuanWaktu("HARI");

      await fetchServices();
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

  async function handleDelete(id: number) {
    const yakin = window.confirm(
      "Apakah kamu yakin ingin menghapus layanan ini?"
    );

    if (!yakin) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      const token = localStorage.getItem("accessToken");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:3000/api/services/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();

        throw new Error(
          data.message || "Gagal menghapus layanan"
        );
      }

      setServices((currentServices) =>
        currentServices.filter(
          (service) => service.id !== id
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan"
      );
    } finally {
      setDeletingId(null);
    }
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
                Kelola Layanan Laundry
              </p>
            </div>

          </div>

          {/* KEMBALI */}
          <button
            onClick={() => router.push("/dashboard")}
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            Kembali
          </button>

        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* TITLE */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Layanan Laundry
          </h2>

          <p className="text-gray-500 mt-2">
            Tambahkan dan kelola layanan laundry.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* FORM */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">

          <h3 className="text-xl font-bold text-gray-900 mb-5">
            Tambah Layanan
          </h3>

          <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* NAMA LAYANAN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Layanan
                </label>

                <input
                  type="text"
                  value={namaLayanan}
                  onChange={(e) =>
                    setNamaLayanan(e.target.value)
                  }
                  placeholder="Contoh: Cuci + Setrika"
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* TIPE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Layanan
                </label>

                <select
                  value={tipe}
                  onChange={(e) =>
                    setTipe(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-blue-500"
                >
                  <option value="REGULER">
                    Reguler
                  </option>

                  <option value="EXPRESS">
                    Express
                  </option>
                </select>
              </div>

              {/* HARGA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga
                </label>

                <input
                  type="number"
                  min="0"
                  value={harga}
                  onChange={(e) =>
                    setHarga(e.target.value)
                  }
                  placeholder="Contoh: 7000"
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* SATUAN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Satuan
                </label>

                <select
                  value={satuan}
                  onChange={(e) =>
                    setSatuan(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-blue-500"
                >
                  <option value="KG">
                    KG
                  </option>

                  <option value="PCS">
                    PCS
                  </option>
                </select>
              </div>

              {/* ESTIMASI WAKTU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimasi Waktu
                </label>

                <input
                  type="number"
                  min="1"
                  value={estimasiWaktu}
                  onChange={(e) =>
                    setEstimasiWaktu(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* SATUAN WAKTU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Satuan Waktu
                </label>

                <select
                  value={satuanWaktu}
                  onChange={(e) =>
                    setSatuanWaktu(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-blue-500"
                >
                  <option value="JAM">
                    Jam
                  </option>

                  <option value="HARI">
                    Hari
                  </option>
                </select>
              </div>

            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 w-full md:w-auto rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition disabled:bg-blue-300"
            >
              {saving
                ? "Menyimpan..."
                : "Tambah Layanan"}
            </button>

          </form>
        </div>

        {/* DAFTAR LAYANAN */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          <h3 className="text-xl font-bold text-gray-900 mb-5">
            Daftar Layanan
          </h3>

          {loading ? (
            <p className="text-gray-500">
              Memuat layanan...
            </p>
          ) : services.length === 0 ? (
            <p className="text-gray-500">
              Belum ada layanan.
            </p>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>
                  <tr className="border-b border-gray-200 text-left">

                    <th className="py-3 px-3 text-sm font-semibold text-gray-600">
                      Layanan
                    </th>

                    <th className="py-3 px-3 text-sm font-semibold text-gray-600">
                      Tipe
                    </th>

                    <th className="py-3 px-3 text-sm font-semibold text-gray-600">
                      Harga
                    </th>

                    <th className="py-3 px-3 text-sm font-semibold text-gray-600">
                      Satuan
                    </th>

                    <th className="py-3 px-3 text-sm font-semibold text-gray-600">
                      Estimasi
                    </th>

                    <th className="py-3 px-3 text-sm font-semibold text-gray-600 text-center">
                      Aksi
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {services.map((service) => (
                    <tr
                      key={service.id}
                      className="border-b border-gray-100"
                    >

                      <td className="py-4 px-3 font-medium text-gray-900">
                        {service.namaLayanan}
                      </td>

                      <td className="py-4 px-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            service.tipe === "EXPRESS"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {service.tipe}
                        </span>
                      </td>

                      <td className="py-4 px-3 text-gray-700">
                        Rp{" "}
                        {service.harga.toLocaleString(
                          "id-ID"
                        )}
                      </td>

                      <td className="py-4 px-3 text-gray-700">
                        {service.satuan}
                      </td>

                      <td className="py-4 px-3 text-gray-700">
                        {service.estimasiWaktu}{" "}
                        {service.satuanWaktu}
                      </td>

                      <td className="py-4 px-3 text-center">

                        <button
                          onClick={() =>
                            handleDelete(service.id)
                          }
                          disabled={
                            deletingId === service.id
                          }
                          className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                        >
                          {deletingId === service.id
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