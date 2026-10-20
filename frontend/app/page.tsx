export default function Home() {
  return (
    <main className="min-h-screen bg-[#F5F9FF] flex items-center justify-center px-6">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-10 items-center">

        {/* Bagian kiri */}
        <div>
          <p className="text-blue-600 font-semibold text-lg mb-3">
            WashFlow
          </p>

          <h1 className="text-5xl font-bold text-gray-900 leading-tight">
            Kelola Laundry
            <br />
            Jadi Lebih Mudah
          </h1>

          <p className="text-gray-500 text-lg mt-5 max-w-md leading-relaxed">
            Sistem manajemen laundry untuk membantu mengelola
            pelanggan, pesanan, layanan, dan transaksi dengan
            lebih praktis.
          </p>
        </div>

        {/* Bagian kanan */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="text-center mb-8">

            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🧺</span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              Selamat Datang
            </h2>

            <p className="text-gray-500 mt-2">
              Pilih akses untuk melanjutkan
            </p>
          </div>

          <div className="space-y-4">

            {/* Login Manager */}
            <a
              href="/login"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold py-4 rounded-xl transition"
            >
              Admin
            </a>

            {/* Login Kasir */}
            <a
              href="/login-kasir"
              className="block w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-center font-semibold py-4 rounded-xl transition"
            >
              Kasir
            </a>

          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Belum memiliki laundry?
            </p>

            <a
              href="/daftar"
              className="text-blue-600 font-semibold hover:underline"
            >
              Daftarkan Laundry
            </a>
          </div>
        </div>

      </div>
    </main>
  );
}