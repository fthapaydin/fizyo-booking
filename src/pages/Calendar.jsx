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
              <p className="text-[11px] text-gray-500">Fizyotim by <strong className="text-gray-700">FatalSoft</strong></p>
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

function maskName(name) {
  if (!name) return 'Değerli Hastamız';
  return name.trim().split(/\s+/).map(part => {
    if (part.length <= 2) return part[0] + '*';
    return part.substring(0, 2) + '*'.repeat(Math.min(4, Math.max(2, part.length - 2)));
  }).join(' ');
}

function maskTreatment(name) {
  if (!name) return 'Fizyoterapi Seansı';
  return name.trim().split(/\s+/).map(part => {
    if (part.length <= 2) return part;
    return part.substring(0, 2) + '*'.repeat(Math.min(3, Math.max(2, part.length - 2)));
  }).join(' ');
}

function maskTherapist(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  return parts.map(part => {
    if (part.toLowerCase().startsWith('dr') || part.toLowerCase().startsWith('fzt')) return part;
    return part[0] + '***';
  }).join(' ');
}

function LookupModal({ clinic, onClose }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError('');
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setSearchError('Lütfen en az 10 haneli geçerli bir telefon numarası giriniz.');
      return;
    }

    const last10 = cleaned.slice(-10);

    setLoading(true);
    setSearched(true);
    try {
      // 1. Hasta bul (son 10 haneye göre esnek eşleşme)
      // 1. Hasta bul (son 10 haneye göre esnek eşleşme)
      const { data: patient, error: pErr } = await supabase
        .from('patients')
        .select('id, full_name, phone, total_sessions')
        .ilike('phone', `%${last10}%`)
        .limit(1)
        .maybeSingle();

      if (pErr) throw pErr;

      if (!patient) {
        setResults({ patient: null, items: [], stats: null });
        return;
      }

      // 2. Seanslar ve talepleri çek
      const [sRes, rRes] = await Promise.all([
        supabase
          .from('sessions')
          .select('id, session_date, session_time, status, treatment:treatments(name), therapist:staff(full_name)')
          .eq('patient_id', patient.id)
          .order('session_date', { ascending: false }),
        supabase
          .from('session_requests')
          .select('id, requested_date, requested_time, status, rejection_reason, treatment:treatments(name), therapist:staff(full_name)')
          .eq('patient_id', patient.id)
          .order('created_at', { ascending: false })
      ]);

      const allSessions = sRes.data || [];
      const allRequests = rRes.data || [];

      // Seans istatistikleri hesaplama
      const totalPlanned = Number(patient.total_sessions) > 0 ? Number(patient.total_sessions) : 10;
      const completedSessions = allSessions.filter(s => s.status === 'tamamlandi').length;
      const pendingSessions = allSessions.filter(s => s.status === 'bekliyor').length + 
                              allRequests.filter(r => r.status === 'bekliyor').length;
      const remainingSessions = Math.max(0, totalPlanned - completedSessions);

      const items = [
        ...allSessions.map(s => ({ ...s, date: s.session_date, time: s.session_time, type: 'session' })),
        ...allRequests.map(r => ({ ...r, date: r.requested_date, time: r.requested_time, type: 'request' }))
      ].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

      setResults({ 
        patient, 
        items,
        stats: {
          total: totalPlanned,
          completed: completedSessions,
          remaining: remainingSessions,
          pending: pendingSessions
        }
      });
    } catch (err) {
      console.error('Sorgulama hatası:', err);
      setSearchError('Sorgulama yapılırken bağlantı hatası oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 z-10 animate-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">Randevu Durumu Sorgula</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer text-xs font-semibold">✕</button>
        </div>

        <form onSubmit={handleSearch} className="space-y-3 mb-4">
          <label className="block text-[12px] font-semibold text-gray-600">Kayıtlı Telefon Numaranız</label>
          <div className="flex gap-2">
            <input
              type="tel"
              required
              placeholder="05XXXXXXXXX"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              className="flex-1 h-11 px-3.5 rounded-xl border border-gray-200 text-[13px] font-mono outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-11 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? '...' : 'Sorgula'}
            </button>
          </div>
        </form>

        {searchError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-[12px] text-rose-700 mb-4">
            <span>{searchError}</span>
          </div>
        )}

        {searched && !searchError && (
          <div className="space-y-3">
            {!results?.patient ? (
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center text-[13px] text-gray-500">
                Bu telefon numarasına ait kayıtlı bir hasta veya randevu bulunamadı.
              </div>
            ) : (
              <div>
                {/* Masked patient greeting & privacy notice */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 mb-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-gray-900">
                      Sayın {maskName(results.patient.full_name)}
                    </span>
                    <span className="text-[10px] text-slate-700 font-semibold bg-slate-200/80 px-2 py-0.5 rounded">
                      Kayıtlı Hasta
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    KVKK Güvenliği: Kişisel verileriniz ve tedavi detaylarınız maskelenmiştir.
                  </p>
                </div>

                {/* Seans İstatistikleri (Toplam / Kalan / Bekleyen / Tamamlanan) */}
                {results.stats && (
                  <div className="mb-3 space-y-2">
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      {/* Toplam Seans */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Toplam</span>
                        <span className="text-base font-black text-slate-900 font-mono block leading-tight mt-0.5">
                          {results.stats.total}
                        </span>
                        <span className="text-[9px] text-slate-500 block">Paket Seans</span>
                      </div>

                      {/* Tamamlanan */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Tamamlanan</span>
                        <span className="text-base font-black text-slate-900 font-mono block leading-tight mt-0.5">
                          {results.stats.completed}
                        </span>
                        <span className="text-[9px] text-slate-500 block">Gerçekleşen</span>
                      </div>

                      {/* Kalan Seans */}
                      <div className="p-2.5 rounded-xl bg-slate-900 text-white border border-slate-900 shadow-2xs">
                        <span className="text-[10px] uppercase font-bold text-slate-300 block tracking-wider">Kalan</span>
                        <span className="text-base font-black text-white font-mono block leading-tight mt-0.5">
                          {results.stats.remaining}
                        </span>
                        <span className="text-[9px] text-slate-300 block font-medium">Kullanılabilir</span>
                      </div>

                      {/* Bekleyen Seans */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Bekleyen</span>
                        <span className="text-base font-black text-slate-900 font-mono block leading-tight mt-0.5">
                          {results.stats.pending}
                        </span>
                        <span className="text-[9px] text-slate-500 block">Planlanan</span>
                      </div>
                    </div>

                    {/* Tamamlanma Oranı */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
                      <span className="font-medium text-slate-700">Seans Tamamlanma Durumu:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-slate-900 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.round((results.stats.completed / (results.stats.total || 1)) * 100))}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-900 text-[11px]">
                          %{Math.min(100, Math.round((results.stats.completed / (results.stats.total || 1)) * 100))}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Randevu Listesi */}
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Randevu Geçmişi &amp; Talepler ({results.items.length})
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {results.items.length === 0 ? (
                    <p className="text-[12px] text-gray-400 text-center py-4">Henüz bir randevu kaydınız bulunmuyor.</p>
                  ) : (
                    results.items.map((item, i) => {
                      const isApproved = item.status === 'onaylandi';
                      const isPending = item.status === 'bekliyor';
                      const isDone = item.status === 'tamamlandi';
                      const isRejected = item.status === 'reddedildi';

                      return (
                        <div key={i} className="p-3 rounded-xl border border-gray-200/90 bg-white text-[12px] space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900">
                              {maskTreatment(item.treatment?.name)}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              isApproved ? 'bg-slate-100 text-slate-800' :
                              isPending ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                              isDone ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                              'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}>
                              {isApproved ? '● Onaylandı' : isPending ? '● Onay Bekliyor' : isDone ? '✓ Tamamlandı' : '✕ Reddedildi'}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-500 flex items-center justify-between">
                            <span className="font-mono text-slate-700">{item.date} · {item.time?.substring(0, 5)}</span>
                            {item.therapist?.full_name && <span className="text-slate-600 font-medium">{maskTherapist(item.therapist.full_name)}</span>}
                          </div>
                          {item.rejection_reason && (
                            <p className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 p-2 rounded-lg mt-1">
                              Randevu durumu için lütfen kliniğimiz ile iletişime geçiniz.
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
