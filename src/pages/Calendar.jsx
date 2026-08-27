import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../lib/api';
import { supabase } from '../lib/supabase';
import WeekCalendar from '../components/WeekCalendar';
import BookingModal from '../components/BookingModal';
import { Activity, Clock, RefreshCw, ArrowLeft } from 'lucide-react';

export default function Calendar({ onSuccess, onBack }) {
  const [sessions, setSessions] = useState([]);
  const [sessionRequests, setSessionRequests] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [sRes, rRes, tRes] = await Promise.all([
        supabase.from('sessions').select('*'),
        supabase.from('session_requests').select('*'),
        supabase.from('treatments').select('*'),
      ]);
      setSessions(sRes.data || []);
      setSessionRequests(rRes.data || []);
      setTreatments(tRes.data || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSuccess = (bookingInfo) => {
    setSelectedSlot(null);
    fetchData();
    onSuccess(bookingInfo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/40">

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-gray-200 text-[13px] font-medium text-gray-500 hover:bg-gray-50 transition-all"
            >
              <ArrowLeft size={15} />
              Geri
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-200">
                <Activity size={15} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[15px] font-bold text-gray-900">Fizyoterapi Kliniği</span>
            </div>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-gray-200 text-[12px] font-medium text-gray-500 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Yenile
          </button>
        </div>
      </nav>

      {/* Page Header */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Randevu Takvimi</h1>
        <p className="text-[13px] text-gray-500">
          <span className="text-emerald-600 font-semibold">Yeşil</span> alanlara tıklayarak randevu talep edin.
        </p>
      </section>

      {/* Calendar */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-3xl border border-gray-100">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-[3px] border-teal-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-[13px] text-gray-400">Takvim yükleniyor...</p>
            </div>
          </div>
        ) : (
          <WeekCalendar
            sessions={sessions}
            sessionRequests={sessionRequests}
            onSlotClick={setSelectedSlot}
          />
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
            <div className="flex items-center gap-2 text-[12px] text-gray-400">
              <Clock size={13} />
              <span>Hafta İçi &amp; Hafta Sonu 08:00 – 20:00</span>
            </div>
            <p className="text-[11px] text-gray-400">© 2026 Fizyoterapi Kliniği</p>
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
