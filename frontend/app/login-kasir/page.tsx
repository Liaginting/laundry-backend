"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginKasirPage() {
  const router = useRouter();

  const [kodeKasir, setKodeKasir] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/login-kasir",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            kodeKasir,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Kode kasir atau password salah",
        );
      }

      localStorage.setItem(
        "accessToken",
        data.accessToken,
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user),
      );

      router.push("/dashboard-kasir");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat login",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F9FF] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-lg px-8 py-8">

        {/* Kembali */}
        <div className="mb-6">
          <a
            href="/"
            className="text-sm text-gray-500 hover:text-blue-600 transition"
          >
            ← Kembali ke halaman utama
          </a>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">
              🧺
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            WashFlow
          </h1>

          <p className="text-gray-500 mt-2">
            Login Kasir
          </p>
        </div>

        {/* Form */}
        <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-7">

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Selamat Datang
            </h2>

            <p className="text-gray-500 mt-1">
              Masuk menggunakan kode kasir Anda
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* Kode Kasir */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kode Kasir
              </label>

              <input
                type="text"
                value={kodeKasir}
                onChange={(e) =>
                  setKodeKasir(
                    e.target.value.toUpperCase(),
                  )
                }
                placeholder="Contoh: KSR-001"
                required
                className="w-full border border-gray-300 bg-white rounded-xl px-4 py-3 text-gray-900 uppercase outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  placeholder="Masukkan password"
                  required
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

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3.5 rounded-xl transition"
            >
              {loading
                ? "Memproses..."
                : "Login"}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Login sebagai Manager?
            </p>

            <a
              href="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Login Manager
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}