"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:3000";

type User = {
  nama: string;
  role: string;
};

type Bahan = {
  id: number;
  nama: string;
  stok: number;
  satuan: string;
  stokMinimum?: number;
};

type Riwayat = {
  id: number;
  jumlah: number;
  jenis?: string;
  keterangan?: string;
  createdAt?: string;
  tanggal?: string;
};

export default function BahanLaundryPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [bahan, setBahan] = useState<Bahan[]>([]);
  const [riwayat, setRiwayat] = useState<Riwayat[]>([]);
  const [bahanTerpilih, setBahanTerpilih] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sukses, setSukses] = useState("");

  const [namaBahan, setNamaBahan] = useState("");
  const [satuan, setSatuan] = useState("Liter");
  const [stokAwal, setStokAwal] = useState("0");
  const [jumlahStok, setJumlahStok] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const [menyimpanBahan, setMenyimpanBahan] = useState(false);
  const [menyimpanStok, setMenyimpanStok] = useState(false);

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const idTerpilih = bahanTerpilih ? Number(bahanTerpilih) : null;
  const bahanAktif = bahan.find((item) => item.id === idTerpilih);

  // Kembali ke dashboard, bukan logout
  const handleKeluar = () => {
    router.push("/dashboard");
  };

  const ambilBahan = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push("/");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/bahan-laundry`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data bahan laundry.");
      }

      const data = await response.json();
      const daftar: Bahan[] = Array.isArray(data)
        ? data
        : data.data ?? [];

      setBahan(daftar);

      if (
        bahanTerpilih &&
        !daftar.some((item) => item.id === Number(bahanTerpilih))
      ) {
        setBahanTerpilih("");
        setRiwayat([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  };

  const ambilRiwayat = async (id: number) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const response = await fetch(
        `${API_URL}/bahan-laundry/${id}/riwayat`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil riwayat stok.");
      }

      const data = await response.json();
      setRiwayat(Array.isArray(data) ? data : data.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil riwayat."
      );
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("user");

    if (!token) {
      router.push("/");
      return;
    }

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }

    void ambilBahan();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (idTerpilih !== null) {
      void ambilRiwayat(idTerpilih);
    } else {
      setRiwayat([]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bahanTerpilih]);

  const tambahBahan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/");
      return;
    }

    if (!namaBahan.trim()) {
      setError("Nama bahan harus diisi.");
      return;
    }

    const stok = Number(stokAwal);

    if (!Number.isFinite(stok) || stok < 0) {
      setError("Stok awal tidak boleh negatif.");
      return;
    }

    setError("");
    setSukses("");
    setMenyimpanBahan(true);

    try {
      const response = await fetch(`${API_URL}/bahan-laundry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nama: namaBahan.trim(),
          satuan,
          stok,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Gagal menambahkan bahan.");
      }

      setNamaBahan("");
      setSatuan("Liter");
      setStokAwal("0");
      setSukses("Bahan laundry berhasil ditambahkan.");

      await ambilBahan();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menambahkan bahan."
      );
    } finally {
      setMenyimpanBahan(false);
    }
  };

  const tambahStok = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/");
      return;
    }

    if (!idTerpilih) {
      setError("Pilih bahan terlebih dahulu.");
      return;
    }

    const jumlah = Number(jumlahStok);

    if (!Number.isFinite(jumlah) || jumlah <= 0) {
      setError("Jumlah stok harus lebih dari 0.");
      return;
    }

    setError("");
    setSukses("");
    setMenyimpanStok(true);

    try {
      const response = await fetch(
        `${API_URL}/bahan-laundry/${idTerpilih}/stok`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            jumlah,
            keterangan: keterangan.trim(),
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Gagal menambahkan stok.");
      }

      setJumlahStok("");
      setKeterangan("");
      setSukses("Stok berhasil ditambahkan.");

      await ambilBahan();
      await ambilRiwayat(idTerpilih);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menambahkan stok."
      );
    } finally {
      setMenyimpanStok(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

  const labelClass =
    "mb-2 block text-sm font-medium text-gray-700";

  return (
    <div className="min-h-screen bg-[#F5F9FF] text-gray-800">
      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl">
              🧺
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900">
                WashFlow
              </h1>
              <p className="text-xs text-gray-500">
                Manajemen Bahan Laundry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-gray-900">
                {user?.nama ?? "Pengguna"}
              </p>
              <p className="mt-0.5 text-xs font-medium text-blue-600">
                {user?.role ?? "STAFF"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleKeluar}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* KONTEN */}
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6">
        <div className="mb-7">
          <p className="mb-2 text-sm font-medium text-blue-600">
            Dashboard / Persediaan
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Bahan Laundry
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Kelola persediaan bahan, tambahkan stok, dan pantau
            riwayat perubahan stok dalam satu halaman.
          </p>
        </div>

        {/* NOTIFIKASI */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="font-semibold"
              aria-label="Tutup pesan"
            >
              ✕
            </button>
          </div>
        )}

        {sukses && (
          <div
            role="status"
            className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            <span>{sukses}</span>
            <button
              type="button"
              onClick={() => setSukses("")}
              className="font-semibold"
              aria-label="Tutup pesan"
            >
              ✕
            </button>
          </div>
        )}

        {/* RINGKASAN */}
        <div className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Jenis Bahan
                </p>
                <p className="mt-3 text-3xl font-bold text-gray-900">
                  {loading ? "—" : bahan.length}
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  Bahan yang tercatat dalam sistem
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
                🧴
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Stok Perlu Diperiksa
                </p>
                <p className="mt-3 text-3xl font-bold text-gray-900">
                  {loading
                    ? "—"
                    : bahan.filter(
                        (item) =>
                          item.stokMinimum !== undefined &&
                          item.stok <= item.stokMinimum
                      ).length}
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  Berdasarkan batas minimum stok
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-xl">
                📦
              </div>
            </div>
          </div>
        </div>

        {/* FORM TAMBAH BAHAN DAN DAFTAR */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {isAdmin && (
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h3 className="text-base font-bold text-gray-900">
                  Tambah Bahan
                </h3>
                <p className="mt-1 text-sm leading-5 text-gray-500">
                  Daftarkan bahan baru ke persediaan.
                </p>
              </div>

              <form onSubmit={tambahBahan} className="space-y-4">
                <div>
                  <label htmlFor="namaBahan" className={labelClass}>
                    Nama Bahan
                  </label>
                  <input
                    id="namaBahan"
                    value={namaBahan}
                    onChange={(e) => setNamaBahan(e.target.value)}
                    placeholder="Contoh: Deterjen"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="satuan" className={labelClass}>
                    Satuan
                  </label>
                  <select
                    id="satuan"
                    value={satuan}
                    onChange={(e) => setSatuan(e.target.value)}
                    className={inputClass}
                  >
                    <option value="Liter">Liter</option>
                    <option value="Kg">Kg</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Botol">Botol</option>
                    <option value="Bungkus">Bungkus</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="stokAwal" className={labelClass}>
                    Stok Awal
                  </label>
                  <input
                    id="stokAwal"
                    type="number"
                    min="0"
                    step="any"
                    value={stokAwal}
                    onChange={(e) => setStokAwal(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={menyimpanBahan}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {menyimpanBahan ? "Menyimpan..." : "+ Tambah Bahan"}
                </button>
              </form>
            </section>
          )}

          <section
            className={`min-w-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 ${
              isAdmin ? "lg:col-span-2" : "lg:col-span-3"
            }`}
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Daftar Bahan
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Pilih bahan untuk mengelola stok dan riwayat.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void ambilBahan()}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Muat Ulang
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-gray-500">
                Memuat daftar bahan...
              </div>
            ) : bahan.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center">
                <div className="text-3xl">🧴</div>
                <p className="mt-3 text-sm font-semibold text-gray-700">
                  Belum ada bahan
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Data bahan akan muncul di sini setelah ditambahkan.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[440px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                      <th className="rounded-l-lg px-3 py-3 font-semibold">
                        Nama Bahan
                      </th>
                      <th className="px-3 py-3 font-semibold">Stok</th>
                      <th className="px-3 py-3 font-semibold">Satuan</th>
                      <th className="rounded-r-lg px-3 py-3 font-semibold">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {bahan.map((item) => (
                      <tr
                        key={item.id}
                        className={`border-b border-gray-100 last:border-0 ${
                          idTerpilih === item.id ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="px-3 py-4 font-medium text-gray-800">
                          {item.nama}
                        </td>
                        <td className="px-3 py-4 text-gray-600">
                          {item.stok}
                        </td>
                        <td className="px-3 py-4 text-gray-600">
                          {item.satuan}
                        </td>
                        <td className="px-3 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              setBahanTerpilih(String(item.id))
                            }
                            className="whitespace-nowrap rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                          >
                            {idTerpilih === item.id
                              ? "Dipilih"
                              : "Pilih Bahan"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* TAMBAH STOK DAN RIWAYAT */}
        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h3 className="text-base font-bold text-gray-900">
                Tambah Stok
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Catat stok masuk untuk bahan yang tersedia.
              </p>
            </div>

            <form onSubmit={tambahStok} className="space-y-4">
              <div>
                <label htmlFor="pilihBahan" className={labelClass}>
                  Pilih Bahan
                </label>
                <select
                  id="pilihBahan"
                  value={bahanTerpilih}
                  onChange={(e) => setBahanTerpilih(e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">Pilih bahan laundry</option>
                  {bahan.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nama} — {item.stok} {item.satuan}
                    </option>
                  ))}
                </select>
              </div>

              {bahanAktif && (
                <div className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">
                  <span className="text-sm text-gray-600">
                    Stok saat ini
                  </span>
                  <span className="text-sm font-bold text-blue-700">
                    {bahanAktif.stok} {bahanAktif.satuan}
                  </span>
                </div>
              )}

              <div>
                <label htmlFor="jumlahStok" className={labelClass}>
                  Jumlah Stok Masuk
                </label>
                <input
                  id="jumlahStok"
                  type="number"
                  min="0.01"
                  step="any"
                  value={jumlahStok}
                  onChange={(e) => setJumlahStok(e.target.value)}
                  placeholder="Masukkan jumlah stok"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="keterangan" className={labelClass}>
                  Keterangan
                  <span className="ml-1 font-normal text-gray-400">
                    (Opsional)
                  </span>
                </label>
                <textarea
                  id="keterangan"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Contoh: Pembelian bahan baru"
                  rows={3}
                  className={`${inputClass} resize-y`}
                />
              </div>

              <button
                type="submit"
                disabled={
                  menyimpanStok ||
                  !bahanTerpilih ||
                  bahan.length === 0
                }
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {menyimpanStok ? "Menyimpan..." : "+ Tambah Stok"}
              </button>
            </form>
          </section>

          <section className="min-w-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h3 className="text-base font-bold text-gray-900">
                Riwayat Stok
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {bahanAktif
                  ? `Aktivitas stok ${bahanAktif.nama}`
                  : "Pilih bahan untuk melihat riwayatnya."}
              </p>
            </div>

            {!bahanTerpilih ? (
              <div className="rounded-xl bg-gray-50 px-4 py-10 text-center">
                <div className="text-3xl">📋</div>
                <p className="mt-3 text-sm font-medium text-gray-700">
                  Belum ada bahan dipilih
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Pilih bahan di daftar atau form tambah stok.
                </p>
              </div>
            ) : riwayat.length === 0 ? (
              <div className="rounded-xl bg-gray-50 px-4 py-10 text-center">
                <div className="text-3xl">📦</div>
                <p className="mt-3 text-sm font-medium text-gray-700">
                  Belum ada riwayat stok
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Riwayat akan tampil setelah tersedia di sistem.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {riwayat.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 p-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800">
                        {item.jenis ?? "Perubahan Stok"}
                      </p>
                      <p className="mt-1 break-words text-sm text-gray-500">
                        {item.keterangan || "Tidak ada keterangan"}
                      </p>
                      {(item.createdAt || item.tanggal) && (
                        <p className="mt-2 text-xs text-gray-400">
                          {new Date(
                            item.createdAt ?? item.tanggal!
                          ).toLocaleString("id-ID")}
                        </p>
                      )}
                    </div>

                    <span className="shrink-0 rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
                      +{item.jumlah}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}