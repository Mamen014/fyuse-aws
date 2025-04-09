import { useState } from "react";

export default function PrivacyPolicyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div
        className="bg-[#1C0C1D] text-white p-8 rounded shadow-lg max-w-6xl w-[90vw] overflow-y-auto max-h-[90vh] relative"
        style={{ borderColor: "#848CB1" }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-purple-400 text-xl font-bold"
          aria-label="Close Modal"
        >
          &times;
        </button>

        {/* Modal Content */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-[#F38980]">
          FYUSE Web App – Syarat dan Ketentuan Pengguna
        </h1>
        <div className="prose prose-lg max-w-none text-gray-300 space-y-4">
          <div className="text-lg">Terakhir Diperbarui: [09-April-2025]</div>
          <ol className="space-y-4">
            <li>
              <strong className="text-xl">Penerimaan Syarat dan Ketentuan</strong>
              <div className="text-lg">
                Dengan mengakses dan menggunakan FYUSE (“Platform”), Anda menyetujui Syarat dan Ketentuan (“Syarat”) ini. Jika Anda tidak menyetujuinya, harap tidak menggunakan layanan kami.
              </div>
            </li>
            <li>
              <strong className="text-xl">Ruang Lingkup Layanan</strong>
              <div className="text-lg">
                FYUSE menyediakan layanan sebagai berikut:
                <ul className="list-disc ml-6 space-y-2">
                  <li>Layanan virtual try-on melalui unggahan foto pribadi.</li>
                  <li>Visualisasi pakaian dan analisis kecocokan yang cerdas.</li>
                  <li>Fitur untuk menyimpan dan mengelola hasil try-on dalam “Koleksi Pribadi”.</li>
                  <li>Alat bantu untuk mengambil keputusan gaya dan berbagi outfit dengan orang lain.</li>
                </ul>
              </div>
            </li>
            <li>
              <strong className="text-xl">Kelayakan Pengguna</strong>
              <div className="text-lg">
                Pengguna harus berusia minimal 18 tahun atau mendapatkan persetujuan orang tua/wali yang sah untuk menggunakan layanan ini.
              </div>
            </li>
            <li>
              <strong className="text-xl">Perlindungan Data Pengguna dan Privasi</strong>
              <ol className="list-decimal ml-6 space-y-2">
                <li>
                  <strong className="text-lg">Pengumpulan Data Pribadi</strong>
                  <div className="text-lg">
                    Kami mengumpulkan dan memproses data pribadi seperti: foto tubuh, gambar pakaian, hasil gambar try-on, preferensi pengguna.
                  </div>
                </li>
                <li>
                  <strong className="text-lg">Tujuan Penggunaan Data</strong>
                  <div className="text-lg">
                    Data digunakan untuk menyediakan layanan, personalisasi, penyimpanan hasil try-on, dan analisis layanan dalam bentuk anonim.
                  </div>
                </li>
                <li>
                  <strong className="text-lg">Penyimpanan dan Retensi Data</strong>
                  <div className="text-lg">
                    Data disimpan secara aman di server cloud dan hanya selama diperlukan.
                  </div>
                </li>
                <li>
                  <strong className="text-lg">Persetujuan dan Kontrol Pengguna</strong>
                  <div className="text-lg">
                    Pengguna dapat mengakses, memperbarui, menghapus, atau menarik persetujuan atas penggunaan data mereka.
                  </div>
                </li>
                <li>
                  <strong className="text-lg">Pembagian Data dengan Pihak Ketiga</strong>
                  <div className="text-lg">
                    Data tidak dijual/disewakan. Dibagikan hanya ke penyedia layanan resmi atau pihak berwenang sesuai hukum.
                  </div>
                </li>
                <li>
                  <strong className="text-lg">Standar Perlindungan Data</strong>
                  <div className="text-lg">
                    Mengikuti UU PDP dengan prinsip transparansi, minimalisasi data, dan keamanan data.
                  </div>
                </li>
              </ol>
            </li>
            <li>
              <strong className="text-xl">Hak Kekayaan Intelektual</strong>
              <div className="text-lg">
                Seluruh konten dan teknologi FYUSE dilindungi hukum kekayaan intelektual.
              </div>
            </li>
            <li>
              <strong className="text-xl">Tanggung Jawab Akun</strong>
              <div className="text-lg">
                Pengguna bertanggung jawab atas keamanan akun mereka.
              </div>
            </li>
            <li>
              <strong className="text-xl">Penggunaan yang Dilarang</strong>
              <div className="text-lg">
                Dilarang menggunakan platform untuk tindakan ilegal atau melanggar hak pihak lain.
              </div>
            </li>
            <li>
              <strong className="text-xl">Perubahan dan Penghentian Layanan</strong>
              <div className="text-lg">
                FYUSE berhak mengubah/menghentikan layanan dengan pemberitahuan sebelumnya.
              </div>
            </li>
            <li>
              <strong className="text-xl">Batasan Tanggung Jawab</strong>
              <div className="text-lg">
                FYUSE tidak bertanggung jawab atas kerugian tidak langsung atau insidental.
              </div>
            </li>
            <li>
              <strong className="text-xl">Hukum yang Berlaku</strong>
              <div className="text-lg">
                Tunduk pada hukum Republik Indonesia.
              </div>
            </li>
            <li>
              <strong className="text-xl">Informasi Kontak</strong>
              <div className="text-lg">
                Hubungi: Ryan Iaska Founder of FYUSE
              </div>
              <div className="text-lg">
                Email: ryaniaska14@gmail.com
              </div>
              <div className="text-lg">
                Whatsapp: 081384481108
              </div>
            </li>
            <li>
              <strong className="text-xl">Pembaruan Syarat</strong>
              <div className="text-lg">
                Penggunaan lanjutan menunjukkan persetujuan atas pembaruan Syarat.
              </div>
            </li>
          </ol>
          <div className="mt-4">
            <strong className="text-xl">Pernyataan Persetujuan</strong>
            <div className="text-lg">
              Dengan menggunakan FYUSE, Anda menyatakan setuju atas pengumpulan dan penggunaan data pribadi sesuai UU PDP.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}