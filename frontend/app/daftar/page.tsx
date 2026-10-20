"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DaftarPage() {
  const router = useRouter();

  const [namaLaundry, setNamaLaundry] = useState("");
  const [alamat, setAlamat] = useState("");
  const [noTelepon, setNoTelepon] = useState("");

  const [namaAdmin, setNamaAdmin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            namaLaundry,
            alamat,
            noTelepon,
            namaAdmin,
            email,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Pendaftaran gagal",
        );
      }

      alert("Pendaftaran laundry berhasil!");

      router.push("/login");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mendaftar",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F9FF] flex items-center justify-center px-6 py-10">

      {/* Container Putih */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-lg px-8 py-8">

        {/* ================= KEMBALI ================= */}
        <div className="mb-6">
          <a
            href="/"
            className="text-sm text-gray-500 hover:text-blue-600 transition"
          >
            ← Kembali ke halaman utama
          </a>
        </div>

        {/* ================= HEADER ================= */}
        <div className="text-center mb-8">

          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🧺</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            WashFlow
          </h1>

          <p className="text-gray-500 mt-2">
            Daftarkan Laundry Anda
          </p>

        </div>

        {/* ================= FORM CARD ================= */}
        <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-7">

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Buat Akun
            </h2>

            <p className="text-gray-500 mt-1">
              Masukkan informasi laundry dan admin
            </p>
          </div>

          <form
            onSubmit={handleRegister}
            className="space-y-5"
          >

            {/* ================= DATA LAUNDRY ================= */}

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Informasi Laundry
              </h3>

              {/* Nama Laundry */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Laundry
                </label>

                <input
                  type="text"
                  value={namaLaundry}
                  onChange={(e) =>
                    setNamaLaundry(e.target.value)
                  }
                  placeholder="Contoh: Laundry Binatu"
                  required
                  className="w-full border border-gray-300 bg-white rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Nomor Telepon */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon
                </label>

                <input
                  type="tel"
                  value={noTelepon}
                  onChange={(e) =>
                    setNoTelepon(e.target.value)
                  }
                  placeholder="Contoh: 081234567890"
                  required
                  className="w-full border border-gray-300 bg-white rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Alamat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat
                </label>

                <textarea
                  value={alamat}
                  onChange={(e) =>
                    setAlamat(e.target.value)
                  }
                  placeholder="Masukkan alamat laundry"
                  rows={3}
                  required
                  className="w-full border border-gray-300 bg-white rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Garis */}
            <div className="border-t border-gray-200" />

            {/* ================= DATA MANAGER ================= */}

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Informasi Admin
              </h3>

              {/* Nama Manager */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Admin
                </label>

                <input
                  type="text"
                  value={namaAdmin}
                  onChange={(e) =>
                    setNamaAdmin(e.target.value)
                  }
                  placeholder="Masukkan nama admin"
                  required
                  className="w-full border border-gray-300 bg-white rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Admin
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Masukkan email"
                  required
                  className="w-full border border-gray-300 bg-white rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>

                <div className="relative">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Buat password"
                    required
                    minLength={6}
                    className="w-full border border-gray-300 bg-white rounded-xl px-4 py-3 pr-24 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-blue-600 font-medium"
                  >
                    {showPassword
                      ? "Sembunyikan"
                      : "Lihat"}
                  </button>

                </div>

              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Tombol Daftar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3.5 rounded-xl transition"
            >
              {loading
                ? "Mendaftarkan..."
                : "Daftarkan Laundry"}
            </button>

          </form>

          {/* ================= LOGIN ================= */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">

            <p className="text-sm text-gray-500">
              Sudah memiliki akun?
            </p>

            <a
              href="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Login sebagai Admin
            </a>

          </div>

        </div>

      </div>

    </main>
  );
}