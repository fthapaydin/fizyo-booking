import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import WeekCalendar from '../components/WeekCalendar';
import BookingModal from '../components/BookingModal';
import { Activity, Clock, RefreshCw, ArrowLeft, Phone, MapPin, Stethoscope, User } from 'lucide-react';

export default function Calendar({ clinic, onSuccess, onBack }) {
  const [sessions, setSessions] = useState([]);
  const [sessionRequests, setSessionRequests] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedTherapistId, setSelectedTherapistId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const clinicName = clinic?.name || 'Fizyoterapi Kliniği';
  const clinicPhone = clinic?.phone || '0555 555 55 55';
  const clinicAddress = clinic?.address || 'Merkez';
  const themeColor = clinic?.theme_color || '#059669';

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      let sQuery = supabase.from('sessions').select('*');
      let rQuery = supabase.from('session_requests').select('*');
      let tQuery = supabase.from('treatments').select('*').order('created_at', { ascending: true });
      let staffQuery = supabase.from('staff').select('*').eq('is_active', true).order('created_at', { ascending: true });

      if (clinic?.id) {
        sQuery = sQuery.eq('clinic_id', clinic.id);
        rQuery = rQuery.eq('clinic_id', clinic.id);
        tQuery = tQuery.eq('clinic_id', clinic.id);
        staffQuery = staffQuery.eq('clinic_id', clinic.id);
      }

      const [sRes, rRes, tRes, staffRes] = await Promise.all([sQuery, rQuery, tQuery, staffQuery]);
      setSessions(sRes.data || []);
      setSessionRequests(rRes.data || []);
      setTreatments(tRes.data || []);
      setStaff(staffRes.data || []);
    } catch (err) {
      console.error('Takvim verisi yüklenirken hata:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(interval);
  }, [clinic?.id]);

  // Therapist-scoped sessions
  const filteredSessions = useMemo(() => {
    if (selectedTherapistId === 'all') return sessions;
    return sessions.filter((s) => s.therapist_id === selectedTherapistId);
  }, [sessions, selectedTherapistId]);

  const filteredRequests = useMemo(() => {
    if (selectedTherapistId === 'all') return sessionRequests;
    return sessionRequests.filter((r) => r.therapist_id === selectedTherapistId);
  }, [sessionRequests, selectedTherapistId]);

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
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-gray-200 text-[13px] font-medium text-gray-500 hover:bg-gray-50 transition-all cursor-pointer"
            >
              <ArrowLeft size={15} />
              Geri
            </button>
            <div className="flex items-center gap-2.5">
              {clinic?.logo_url ? (
                <img src={clinic.logo_url} alt="Logo" className="w-8 h-8 rounded-xl object-contain shadow-sm" />
              ) : (
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg text-white"
                  style={{ backgroundColor: themeColor }}
                >
                  <Activity size={15} strokeWidth={2.5} />
                </div>
              )}
              <span className="text-[15px] font-bold text-gray-900">{clinicName}</span>
            </div>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-gray-200 text-[12px] font-medium text-gray-500 hover:bg-gray-50 transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Yenile
          </button>
        </div>
      </nav>

      {/* Page Header & Therapist Filter */}
      <section className="max-w-6xl mx-auto px-4 pt-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Randevu Takvimi</h1>
            <p className="text-[13px] text-gray-500">
              <span className="text-emerald-600 font-semibold">Yeşil</span> alanlara tıklayarak randevu talep edin.
            </p>
          </div>

          {/* Therapist Selection Selector */}
          {staff.length > 0 && (
            <div className="flex items-center gap-2 bg-white p-1.5 px-3 rounded-2xl border border-gray-200/80 shadow-2xs">
              <Stethoscope size={15} className="text-teal-600" />
              <label className="text-[12px] font-semibold text-gray-700 whitespace-nowrap">Fizyoterapist:</label>
              <select
                value={selectedTherapistId}
                onChange={(e) => setSelectedTherapistId(e.target.value)}
                className="text-[12px] font-semibold text-gray-900 bg-transparent outline-none cursor-pointer"
              >
                <option value="all">Fark Etmez / Tüm Terapistler</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.title || 'Fzt.'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
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
            sessions={filteredSessions}
            sessionRequests={filteredRequests}
            onSlotClick={setSelectedSlot}
          />
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                <Activity size={13} />
              </div>
              <span className="text-[14px] font-bold text-gray-800">{clinicName}</span>
            </div>
            <div className="flex flex-wrap items-center gap-5 text-[12px] text-gray-500">
              <div className="flex items-center gap-1.5">
                <Phone size={13} className="text-teal-600" />
                <span>{clinicPhone}</span>
              </div>
              {clinicAddress && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-teal-600" />
                  <span>{clinicAddress}</span>
                </div>
              )}
            </div>
            <div className="text-center md:text-right">
              <p className="text-[11px] text-gray-500">FizyoPanel by <strong className="text-gray-700">FatalSoft</strong></p>
              <a href="mailto:fatalsoft.inc@gmail.com" className="text-[11px] text-teal-600 hover:underline">
                fatalsoft.inc@gmail.com
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      {selectedSlot && (
        <BookingModal
          clinic={clinic}
          slot={selectedSlot}
          treatments={treatments}
          staff={staff}
          defaultTherapistId={selectedTherapistId !== 'all' ? selectedTherapistId : ''}
          onClose={() => setSelectedSlot(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
