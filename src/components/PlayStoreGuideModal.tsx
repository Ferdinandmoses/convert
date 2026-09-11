import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  CheckCircle, 
  UploadCloud, 
  FileCheck, 
  ShieldAlert, 
  Image as ImageIcon,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface PlayStoreGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GuideStep {
  number: number;
  title: string;
  badge: string;
  summary: string;
  details: string[];
}

const PLAY_STEPS: GuideStep[] = [
  {
    number: 1,
    title: 'Buka Google Play Console & Buat Aplikasi',
    badge: 'Langkah Awal',
    summary: 'Daftar atau masuk ke akun developer Google Play Anda.',
    details: [
      'Buka situs resmi: play.google.com/console',
      'Klik tombol biru "+ Buat Aplikasi" (Create app) di kanan atas dashboard.',
      'Masukkan Nama Aplikasi yang telah Anda tentukan.',
      'Pilih Bahasa Default (misal: Bahasa Indonesia).',
      'Tentukan jenis aplikasi: Aplikasi (App) atau Game, serta Gratis (Free) atau Berbayar (Paid).',
      'Centang persetujuan Panduan Developer dan Hukum Ekspor AS, lalu klik Buat Aplikasi.'
    ]
  },
  {
    number: 2,
    title: 'Unggah Berkas .AAB (Android App Bundle)',
    badge: 'Kunci Utama',
    summary: 'Google Play hanya menerima format .AAB untuk aplikasi baru.',
    details: [
      'Di bilah menu kiri Play Console, buka menu Rilis (Release) > Produksi (Production) atau Pengujian Tertutup (Closed testing).',
      'Klik tombol "Buat rilis baru" (Create new release).',
      'Pada bagian Google Play App Signing, gunakan opsi default (Google mengelola kunci penandatanganan).',
      'Tarik dan letakkan berkas app-release.aab yang Anda unduh dari Web2App Studio (otomatis mendukung perangkat Android 10 ke atas hingga Android 15 dengan Target SDK 35).',
      'Beri Nama Rilis (contoh: 1.0.0) dan tulis Catatan Rilis (Release notes) untuk pengguna.',
      'Klik tombol "Simpan" lalu "Tinjau Rilis".'
    ]
  },
  {
    number: 3,
    title: 'Siapkan Aset Gambar Listing Toko (Store Listing)',
    badge: 'Visual Toko',
    summary: 'Gambar dan teks yang dilihat pengguna saat mencari aplikasi Anda.',
    details: [
      'Ikon Aplikasi: Ukuran 512 x 512 piksel, format PNG 32-bit (maks 1 MB).',
      'Grafis Fitur (Feature Graphic): Ukuran 1024 x 500 piksel, format JPG/PNG.',
      'Tangkapan Layar (Screenshots): Minimal 2 screenshot resolusi ponsel (rasio 16:9 atau 9:16) dari aplikasi web Anda.',
      'Deskripsi Singkat: Maksimal 80 karakter (ringkasan memikat tentang aplikasi Anda).',
      'Deskripsi Lengkap: Maksimal 4.000 karakter yang menjelaskan fitur dan kegunaan aplikasi.'
    ]
  },
  {
    number: 4,
    title: 'Konten Aplikasi & Kebijakan Privasi (Privacy Policy)',
    badge: 'Kepatuhan Wajib',
    summary: 'Kebijakan wajib dari Google untuk verifikasi keamanan data pengguna.',
    details: [
      'Kebijakan Privasi: Wajib memasukkan URL link kebijakan privasi website Anda (misal: https://website-anda.com/privacy-policy).',
      'Izin Push Notifikasi & Data Safety (Android 13+ / SDK 35): Berkas .AAB sudah mencakup izin POST_NOTIFICATIONS & Firebase Cloud Messaging (FCM). Di bagian formulir Data Safety Google Play, cantumkan bahwa aplikasi mengumpulkan Token Perangkat FCM untuk pengiriman notifikasi yang diprakarsai pengguna.',
      'Akses Aplikasi: Nyatakan apakah aplikasi memerlukan kredensial login (jika ya, berikan akun demo untuk tim peninjau Google).',
      'Iklan: Deklarasikan apakah website/aplikasi Anda mengandung iklan Google AdSense / banner.',
      'Audiens Target & Konten: Pilih rentang usia pengguna (misal: 18 tahun ke atas).',
      'Kuesioner Rating Konten (IARC): Jawab survei singkat mengenai kekerasan atau bahasa kasar (biasanya mendapatkan rating Semua Umur / PEGI 3).'
    ]
  },
  {
    number: 5,
    title: 'Kirim untuk Ditinjau & Publikasi',
    badge: 'Publikasi',
    summary: 'Aplikasi akan diperiksa oleh tim review Google Play sebelum tayang ke publik.',
    details: [
      'Buka menu "Ringkasan Rilis" (Publishing overview).',
      'Pastikan seluruh checklist tanda centang hijau telah lengkap.',
      'Klik tombol "Mulai peluncuran ke Produksi" (Start rollout to Production).',
      'Proses review Google Play biasanya memakan waktu antara 1 hingga 3 hari kerja.',
      'Setelah disetujui, aplikasi Anda akan otomatis tersedia dan dapat diunduh oleh jutaan pengguna Android di Google Play Store!'
    ]
  }
];

export const PlayStoreGuideModal: React.FC<PlayStoreGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeStep, setActiveStep] = useState(1);

  if (!isOpen) return null;

  const current = PLAY_STEPS.find((s) => s.number === activeStep) || PLAY_STEPS[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Panduan Lengkap Unggah ke Google Play Store</h3>
              <p className="text-xs text-slate-400">Langkah demi langkah dari berkas .AAB hingga rilis resmi</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content with Steps Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[420px]">
          {/* Step Selector Sidebar */}
          <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/40 p-3 sm:p-4 space-y-1.5">
            {PLAY_STEPS.map((step) => {
              const isCurrent = step.number === activeStep;
              return (
                <button
                  key={step.number}
                  onClick={() => setActiveStep(step.number)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 ${
                    isCurrent
                      ? 'bg-blue-600/15 border border-blue-500/40 text-white'
                      : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                    isCurrent ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {step.number}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate">{step.title}</div>
                    <div className="text-[10px] text-slate-500 truncate">{step.badge}</div>
                  </div>
                </button>
              );
            })}

            {/* Link to Play Console */}
            <div className="pt-3 border-t border-slate-800 mt-2">
              <a
                href="https://play.google.com/console"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Buka Play Console</span>
                <ExternalLink className="w-3 h-3 text-blue-400" />
              </a>
            </div>
          </div>

          {/* Active Step Details Panel */}
          <div className="md:col-span-8 p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {current.badge}
                </span>
                <span className="text-xs text-slate-500">Langkah {current.number} dari {PLAY_STEPS.length}</span>
              </div>

              <h4 className="text-base sm:text-lg font-bold text-white mb-1.5">
                {current.title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mb-4 pb-3 border-b border-slate-800">
                {current.summary}
              </p>

              <div className="space-y-2.5">
                {current.details.map((point, index) => (
                  <div key={index} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons between Steps */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                disabled={activeStep === 1}
                onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                Langkah Sebelumnya
              </button>

              {activeStep < PLAY_STEPS.length ? (
                <button
                  onClick={() => setActiveStep((prev) => Math.min(PLAY_STEPS.length, prev + 1))}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Langkah Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Tutup & Mulai Unggah
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
