import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../lib/api';
import WeekCalendar from '../components/WeekCalendar';
import BookingModal from '../components/BookingModal';
import { Activity, Phone, MapPin, Clock, CheckCircle, Star } from 'lucide-react';

export default function Home({ onSuccess }) {
  const [sessions, setSessions] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/sessions`).catch(() => ({ data: [] })),
      axios.get(`${API_URL}/treatments`).catch(() => ({ data: [] })),
    ]).then(([s, t]) => {
      setSessions(s.data);
      setTreatments(t.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleSuccess = (bookingInfo) => {
    setSelectedSlot(null);
    onSuccess(bookingInfo);
  };

  const features = [
    { icon: CheckCircle, title: 'Uzman Kadro', desc: 'Alanında uzman fizyoterapistlerle' },
    { icon: Clock, title: 'Esnek Saatler', desc: '08:00 – 20:00 arası randevu imkânı' },
    { icon: Star, title: 'Kişisel Tedavi', desc: 'Size özel tedavi planı hazırlanır' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/40">

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-200">
              <Activity size={15} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-[15px] font-bold text-gray-900">Fizyoterapi Kliniği</span>
            </div>
          </div>
          <button
            onClick={() => document.getElementById('calendar-section').scrollIntoView({ behavior: 'smooth' })}
            className="h-9 px-4 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-xl text-[13px] font-semibold hover:from-teal-700 hover:to-emerald-600 transition-all shadow-md shadow-teal-200"
          >
            Randevu Al
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-14 text-center">
        <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
          <span className="text-[12px] font-semibold text-teal-700">Online Randevu Sistemi</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
          Randevunuzu<br />
          <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
            Kolayca Planlayın
          </span>
        </h1>
        <p className="text-[16px] text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">
          Müsait saatleri takvimden seçin, ad-soyad ve telefon numaranızla dakikalar içinde randevu talebinde bulunun.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-sm text-left">
              <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center mb-3">
                <f.icon size={17} className="text-teal-600" />
              </div>
              <p className="text-[13px] font-semibold text-gray-800">{f.title}</p>
              <p className="text-[12px] text-gray-400 mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => document.getElementById('calendar-section').scrollIntoView({ behavior: 'smooth' })}
          className="h-12 px-8 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-2xl text-[15px] font-bold hover:from-teal-700 hover:to-emerald-600 transition-all shadow-xl shadow-teal-200 hover:shadow-teal-300"
        >
          Müsait Saatleri Gör →
        </button>
      </section>

      {/* Calendar Section */}
      <section id="calendar-section" className="max-w-6xl mx-auto px-4 pb-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Randevu Takvimi</h2>
          <p className="text-[14px] text-gray-500">
            🟢 <strong>Yeşil</strong> saat dilimlerine tıklayarak randevu talebinde bulunabilirsiniz.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-[13px] text-gray-400">Takvim yükleniyor...</p>
            </div>
          </div>
        ) : (
          <WeekCalendar sessions={sessions} onSlotClick={setSelectedSlot} />
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-teal-600 to-emerald-500 rounded-lg flex items-center justify-center">
                <Activity size={13} className="text-white" />
              </div>
              <span className="text-[14px] font-bold text-gray-700">Fizyoterapi Kliniği</span>
            </div>
            <div className="flex items-center gap-5 text-[12px] text-gray-400">
              <div className="flex items-center gap-1.5">
                <Clock size={13} />
                <span>Hft İçi 08:00 – 20:00</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400">© 2026 Fizyoterapi Kliniği — Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      {selectedSlot && (
        <BookingModal
          slot={selectedSlot}
          treatments={treatments}
          onClose={() => setSelectedSlot(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
