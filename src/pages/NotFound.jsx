import { Home, ArrowLeft, Calendar, Stethoscope } from 'lucide-react';

export default function NotFound({ onGoHome }) {
  const handleHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-50 flex items-center justify-center p-4 font-[Inter]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-8 text-center relative overflow-hidden">
          {/* Top Accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" />

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold uppercase tracking-wider mb-4 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>404 Hata</span>
          </div>

          <h1 className="text-7xl font-black text-slate-900 tracking-tight mb-2">
            4<span className="text-teal-600">0</span>4
          </h1>

          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Randevu Sayfası Bulunamadı
          </h2>
          <p className="text-[13px] text-slate-500 leading-relaxed mb-6">
            Ulaşmaya çalıştığınız klinik randevu linki geçerli değil veya sayfa taşınmış olabilir.
          </p>

          <div className="space-y-2.5">
            <button
              onClick={handleHome}
              className="w-full h-11 px-5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-[13px] font-semibold transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Home size={16} />
              <span>Anasayfaya Dön</span>
            </button>

            <button
              onClick={() => window.history.length > 1 ? window.history.back() : handleHome()}
              className="w-full h-11 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[13px] font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Geri Dön</span>
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-4">
          Fizyotim — Online Randevu & Rezervasyon Portalı
        </p>
      </div>
    </div>
  );
}
