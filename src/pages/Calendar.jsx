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
  const [showLookup, setShowLookup] = useState(false);

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
    return sessions.filter((s) => !s.therapist_id || s.therapist_id === selectedTherapistId);
  }, [sessions, selectedTherapistId]);

  const filteredRequests = useMemo(() => {
    if (selectedTherapistId === 'all') return sessionRequests;
    return sessionRequests.filter((r) => !r.therapist_id || r.therapist_id === selectedTherapistId);
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLookup(true)}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-teal-200 bg-teal-50/80 text-teal-800 text-[12px] font-bold hover:bg-teal-100 transition-all cursor-pointer shadow-2xs"
            >
              <Clock size={14} className="text-teal-600" />
              <span>Randevu Durumu Sorgula</span>
            </button>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-gray-200 text-[12px] font-medium text-gray-500 hover:bg-gray-50 transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Yenile</span>
            </button>
          </div>
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

      {/* Lookup Modal */}
      {showLookup && (
        <LookupModal clinic={clinic} onClose={() => setShowLookup(false)} />
      )}
    </div>
  );
}

function LookupModal({ clinic, onClose }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const cleaned = phone.replace(/\D/g, '');
    if (!cleaned.startsWith('05') || cleaned.length !== 11) {
      alert('Lütfen geçerli bir 05XXXXXXXXX telefon numarası giriniz.');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      // 1. Hasta bul
      let pQuery = supabase.from('patients').select('id, full_name').ilike('phone', `%${cleaned}%`);
      if (clinic?.id) pQuery = pQuery.eq('clinic_id', clinic.id);
      const { data: patient } = await pQuery.maybeSingle();

      if (!patient) {
        setResults({ patient: null, items: [] });
        return;
      }

      // 2. Seanslar ve talepleri çek
      let [sRes, rRes] = await Promise.all([
        supabase.from('sessions').select('id, session_date, session_time, status, treatment:treatments(name), therapist:staff(full_name)').eq('patient_id', patient.id).order('session_date', { ascending: false }).limit(5),
        supabase.from('session_requests').select('id, requested_date, requested_time, status, rejection_reason, treatment:treatments(name), therapist:staff(full_name)').eq('patient_id', patient.id).order('created_at', { ascending: false }).limit(5)
      ]);

      const items = [
        ...(sRes.data || []).map(s => ({ ...s, date: s.session_date, time: s.session_time, type: 'session' })),
        ...(rRes.data || []).map(r => ({ ...r, date: r.requested_date, time: r.requested_time, type: 'request' }))
      ].sort((a, b) => b.date?.localeCompare(a.date));

      setResults({ patient, items });
    } catch (err) {
      console.error(err);
      alert('Sorgulama yapılırken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 z-10 animate-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔍</span>
            <h3 className="text-lg font-bold text-gray-900">Randevu Durumu Sorgula</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer">✕</button>
        </div>

        <form onSubmit={handleSearch} className="space-y-3 mb-5">
          <label className="block text-[12px] font-semibold text-gray-600">Kayıtlı Telefon Numaranız</label>
          <div className="flex gap-2">
            <input
              type="tel"
              required
              placeholder="05XXXXXXXXX"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              className="flex-1 h-11 px-3.5 rounded-xl border border-gray-200 text-[13px] font-mono outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-11 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[13px] font-bold shadow-md shadow-teal-200 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? '...' : 'Sorgula'}
            </button>
          </div>
        </form>

        {searched && (
          <div className="space-y-3">
            {!results?.patient ? (
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center text-[13px] text-gray-500">
                Bu telefon numarasına ait kayıtlı bir hasta veya randevu bulunamadı.
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-[13px] font-bold text-gray-800">Sayın {results.patient.full_name}</span>
                  <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md">Kayıtlı Hasta</span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {results.items.length === 0 ? (
                    <p className="text-[12px] text-gray-400 text-center py-4">Henüz bir randevu kaydınız bulunmuyor.</p>
                  ) : (
                    results.items.map((item, i) => {
                      const isApproved = item.status === 'onaylandi';
                      const isPending = item.status === 'bekliyor';
                      const isDone = item.status === 'tamamlandi';
                      const isRejected = item.status === 'reddedildi';

                      return (
                        <div key={i} className="p-3 rounded-xl border border-gray-200/90 bg-white text-[12px] space-y-1 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900">{item.treatment?.name || 'Seans'}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isApproved ? 'bg-blue-50 text-blue-700' :
                              isPending ? 'bg-amber-50 text-amber-700' :
                              isDone ? 'bg-emerald-50 text-emerald-700' :
                              'bg-rose-50 text-rose-700'
                            }`}>
                              {isApproved ? '● Onaylandı' : isPending ? '⏳ Onay Bekliyor' : isDone ? '✓ Tamamlandı' : '✕ Reddedildi'}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-500 flex items-center justify-between">
                            <span>📅 {item.date} • ⏰ {item.time?.substring(0, 5)}</span>
                            {item.therapist?.full_name && <span>Fzt. {item.therapist.full_name}</span>}
                          </div>
                          {item.rejection_reason && (
                            <p className="text-[10px] text-red-600 bg-red-50 p-1.5 rounded-md mt-1">
                              Gerekçe: {item.rejection_reason}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
