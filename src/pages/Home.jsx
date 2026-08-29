import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TURKEY_CITIES } from '../lib/turkeyCities';
import { 
  Activity, Clock, CheckCircle, Star, Phone, MapPin, Search, Building2, Calendar, 
  ArrowRight, ShieldCheck, Stethoscope, Sparkles, QrCode, Mail, MessageSquare, 
  Award, CheckCircle2, ChevronRight, UserCheck, HeartHandshake, Layers, X, ExternalLink,
  Zap, Tag, Gift, Filter, RotateCcw
} from 'lucide-react';

const POPULAR_CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Kocaeli', 'Gaziantep'];

const TREATMENTS_SHOWCASE = [
  { 
    id: 'manuel-terapi', 
    title: 'Manuel Terapi', 
    desc: 'Omurga ve eklem blokajlarını elle açarak ağrısız, doğal hareket kabiliyeti kazandırır.', 
    badge: 'En Çok Tercih Edilen', 
    icon: '💆‍♂️',
    color: 'from-teal-500/10 to-emerald-500/10 border-teal-200'
  },
  { 
    id: 'bel-boyun', 
    title: 'Bel & Boyun Fıtığı', 
    desc: 'Ameliyatsız kişiye özel klinik dekompresyon, çekme ve derin omurga egzersiz terapisi.', 
    badge: 'Uzmanlık', 
    icon: '🦴',
    color: 'from-blue-500/10 to-indigo-500/10 border-blue-200'
  },
  { 
    id: 'skolyoz-postur', 
    title: 'Skolyoz & Postür', 
    desc: '3 boyutlu omurga analizi, Schroth metodu ve duruş bozuklukları için özel düzeltme protokolü.', 
    badge: 'Klinik Protokol', 
    icon: '📐',
    color: 'from-purple-500/10 to-indigo-500/10 border-purple-200'
  },
  { 
    id: 'sporcu-sagligi', 
    title: 'Sporcu Rehabilitasyonu', 
    desc: 'Menisküs, ön çapraz bağ ve kas yırtılmaları sonrası sahaya güçlü ve hızlı dönüş programı.', 
    badge: 'Rehabilitasyon', 
    icon: '🏃‍♂️',
    color: 'from-amber-500/10 to-orange-500/10 border-amber-200'
  },
  { 
    id: 'kuru-igneleme', 
    title: 'Kuru İğneleme & Kupa', 
    desc: 'Kronik kas spazmlarını, tetik noktaları ve kulunçları tek seansta rahatlatan medikal uygulama.', 
    badge: 'Hızlı Rahatlama', 
    icon: '🪡',
    color: 'from-rose-500/10 to-pink-500/10 border-rose-200'
  },
  { 
    id: 'klinik-pilates', 
    title: 'Klinik Pilates', 
    desc: 'Fizyoterapist eşliğinde omurga sağlığını koruyan, derin kor kaslarını güçlendiren reformer seansları.', 
    badge: 'Birebir Seans', 
    icon: '🧘‍♀️',
    color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200'
  },
];

export default function Home({ clinic, onSelectClinic, onDirectCalendar }) {
  const [clinics, setClinics] = useState([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCityObj = TURKEY_CITIES.find((c) => c.name === selectedCity);

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    setLoadingClinics(true);
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('status', 'aktif')
        .order('name', { ascending: true });

      if (error) throw error;
      setClinics(data || []);
    } catch (err) {
      console.error('Klinikler yüklenemedi:', err);
    } finally {
      setLoadingClinics(false);
    }
  };

  const filteredClinics = clinics.filter((c) => {
    const matchesCity = !selectedCity || (c.city && c.city.toLowerCase() === selectedCity.toLowerCase());
    const matchesDistrict = !selectedDistrict || (c.district && c.district.toLowerCase() === selectedDistrict.toLowerCase());
    const matchesQuery = !searchQuery || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCity && matchesDistrict && matchesQuery;
  });

  const handleCityChange = (val) => {
    setSelectedCity(val);
    setSelectedDistrict('');
  };

  const handleQuickCityClick = (cityName) => {
    setSelectedCity(cityName);
    setSelectedDistrict('');
    scrollToSection('search-section');
  };

  const handleTreatmentClick = (treatmentName) => {
    setSearchQuery(treatmentName);
    scrollToSection('search-section');
  };

  const resetFilters = () => {
    setSelectedCity('');
    setSelectedDistrict('');
    setSearchQuery('');
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isSpecificClinicMode = clinic && clinic.slug && window.location.search.includes('clinic=');

  return (
    <div className="min-h-screen bg-[#fafcfb] text-slate-800 font-[Inter] antialiased flex flex-col justify-between">

      {/* ─── 1. NAVBAR (STICKY HEADER WITH AMPLE SPACING) ────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/90 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            {clinic?.logo_url ? (
              <img src={clinic.logo_url} alt="Logo" className="w-8 h-8 rounded-xl object-contain shadow-2xs" />
            ) : (
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm text-white shrink-0"
                style={{ backgroundColor: clinic?.theme_color || '#059669' }}
              >
                <Activity size={17} strokeWidth={2.5} />
              </div>
            )}
            <div>
              <span className="text-[15px] font-black text-gray-900 tracking-tight block leading-tight">
                {isSpecificClinicMode ? clinic.name : 'FizyoPanel'}
              </span>
              <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider block leading-tight">
                {isSpecificClinicMode ? 'Online Randevu' : 'Fizyoterapi & Sağlık'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isSpecificClinicMode ? (
              <button
                onClick={onDirectCalendar}
                className="h-9 px-4 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-xl text-[12px] sm:text-[13px] font-bold hover:from-teal-700 hover:to-emerald-600 transition-all shadow-md shadow-teal-200 cursor-pointer shrink-0"
              >
                Hemen Randevu Al
              </button>
            ) : (
              <>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="hidden md:inline-flex items-center h-8 px-2.5 rounded-lg text-[12px] font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Nasıl Çalışır?
                </button>
                <button
                  onClick={() => scrollToSection('treatments-section')}
                  className="hidden md:inline-flex items-center h-8 px-2.5 rounded-lg text-[12px] font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Tedaviler
                </button>
                <button
                  onClick={() => scrollToSection('search-section')}
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-lg text-[12px] font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Search size={14} className="text-teal-600" />
                  <span className="hidden sm:inline">Klinik Bul</span>
                </button>
                <button
                  onClick={() => scrollToSection('pricing-section')}
                  className="hidden lg:inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[12px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <Tag size={13} />
                  <span>Fiyatlar</span>
                </button>
                <button
                  onClick={() => scrollToSection('pricing-section')}
                  className="h-8 sm:h-9 px-3 sm:px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] sm:text-[12px] font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span>Klinikler İçin</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        
        {/* ─── 2. HERO SECTION ──────────────────────────────────── */}
        <section className="relative overflow-hidden pt-12 pb-14 sm:pt-16 sm:pb-20 border-b border-gray-100 bg-gradient-to-b from-teal-50/60 via-white to-slate-50/70">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 rounded-full px-3.5 py-1.5 mb-5 shadow-2xs max-w-full">
              <Sparkles size={14} className="text-emerald-600 shrink-0" />
              <span className="text-[11px] sm:text-[12px] font-bold text-emerald-800 truncate">
                {isSpecificClinicMode ? `${clinic.name} • Canlı Randevu Portalı` : 'FizyoPanel • 81 İlde Fizyoterapi & Manuel Terapi Randevusu'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.18] mb-4 tracking-tight px-2">
              {isSpecificClinicMode ? (
                <>
                  {clinic.name} ile<br />
                  <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
                    Sağlığınızı Ertelemeyin
                  </span>
                </>
              ) : (
                <>
                  Doğru Fizyoterapisti Bulun,<br />
                  <span className="bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-700 bg-clip-text text-transparent">
                    Dakikalar İçinde Randevu Alın
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-[14px] sm:text-[16px] md:text-[17px] text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed font-normal px-2">
              {isSpecificClinicMode
                ? 'Müsait seans saatlerini canlı takvimden görüntüleyin, kayıtlı telefon numaranızla 1 dakikada randevu talebinizi iletin.'
                : 'Şehrinizdeki ve ilçenizdeki uzman fizyoterapistleri keşfedin, müsait seans saatlerini canlı görün ve sıra beklemeden online randevunuzu planlayın.'}
            </p>

            {/* CTA Buttons */}
            {isSpecificClinicMode ? (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={onDirectCalendar}
                  className="h-12 px-8 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-2xl text-[14px] sm:text-[15px] font-bold hover:from-teal-700 hover:to-emerald-600 transition-all shadow-xl shadow-teal-200 cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Müsait Saatleri Gör &amp; Randevu Al</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-w-lg mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => scrollToSection('search-section')}
                    className="w-full sm:w-auto h-12 px-7 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-2xl text-[14px] font-bold hover:from-teal-700 hover:to-emerald-600 transition-all shadow-lg shadow-teal-200 inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Search size={16} />
                    <span>İl &amp; İlçe Seçerek Klinik Bul</span>
                  </button>
                  <button
                    onClick={() => scrollToSection('how-it-works')}
                    className="w-full sm:w-auto h-12 px-6 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-2xl text-[14px] font-semibold transition-all shadow-2xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Nasıl Çalışır?</span>
                  </button>
                </div>

                {/* Quick Popular Cities Filter Pills */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                  <span className="text-[11px] font-bold text-gray-400 mr-1 flex items-center gap-1">
                    <MapPin size={12} className="text-teal-600" /> Popüler İller:
                  </span>
                  {POPULAR_CITIES.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleQuickCityClick(city)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-gray-200/90 text-gray-700 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50/50 transition-all shadow-2xs cursor-pointer"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trust Badges Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mt-12 pt-8 border-t border-gray-200/60 text-left">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/60 sm:bg-transparent">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-gray-900">81 İl Desteği</p>
                  <p className="text-[10px] text-gray-400">A'dan Z'ye tüm iller</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/60 sm:bg-transparent">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-gray-900">Canlı Takvim</p>
                  <p className="text-[10px] text-gray-400">08:00 – 20:00 arası</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/60 sm:bg-transparent">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-gray-900">Doğrulanmış Uzman</p>
                  <p className="text-[10px] text-gray-400">Diplomalı kadro</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/60 sm:bg-transparent">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-gray-900">WhatsApp Onayı</p>
                  <p className="text-[10px] text-gray-400">Anında bildirim</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3. HOW IT WORKS (3 ADIMDA RANDEVU) ────────────────── */}
        <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-14 sm:pt-20 sm:pb-16 scroll-mt-28">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200/80 px-3 py-1 rounded-full uppercase tracking-wider">
              Kolay &amp; Hızlı İşleyiş
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2.5 mb-2 tracking-tight">
              3 Kolay Adımda Randevunuz Hazır
            </h2>
            <p className="text-[13px] text-gray-400">Telefon başında beklemeden, dilediğiniz an randevunuzu ayırtın.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 font-black text-base flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-[16px] font-bold text-gray-900 mb-1.5">Şehir &amp; Klinik Seçin</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Bulunduğunuz il ve ilçedeki kayıtlı merkezleri inceleyin, size en uygun fizyoterapisti ve tedaviyi belirleyin.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 font-black text-base flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-[16px] font-bold text-gray-900 mb-1.5">Canlı Takvimden Saat Seçin</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Terapistin boş ve dolu saatlerini canlı takvimde görün. Size uyan yeşil saat kutucuğuna tıklayın.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 font-black text-base flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-[16px] font-bold text-gray-900 mb-1.5">WhatsApp ile Anında Onay</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Kayıtlı telefon numaranızla talebinizi gönderin. Randevunuz onaylandığı an WhatsApp bildirimi cebinize gelsin.
              </p>
            </div>
          </div>
        </section>

        {/* ─── 4. TREATMENTS SHOWCASE (CLICKABLE TO SEARCH) ──────── */}
        <section id="treatments-section" className="bg-slate-50/80 border-y border-gray-200/80 pt-16 pb-16 sm:pt-20 sm:pb-20 scroll-mt-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200/80 px-3 py-1 rounded-full uppercase tracking-wider">
                Tedavi &amp; Hizmetler
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2.5 mb-2 tracking-tight">
                Kliniklerimizde Sunulan Uzmanlıklar
              </h2>
              <p className="text-[13px] text-gray-400">Tedaviye tıklayarak o alanda uzman klinikleri anında listeleyebilirsiniz.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TREATMENTS_SHOWCASE.map((t) => (
                <div 
                  key={t.id} 
                  onClick={() => handleTreatmentClick(t.title)}
                  className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl p-2 rounded-xl bg-slate-50 group-hover:scale-110 transition-transform">
                        {t.icon}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                        {t.badge}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-[15px] group-hover:text-teal-700 transition-colors mb-1.5">
                      {t.title}
                    </h4>
                    <p className="text-[12px] text-gray-500 leading-relaxed">{t.desc}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-teal-600">
                    <span>Klinikleri Listele</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 5. QR CODE STAND BANNER ──────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-18">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            <div className="space-y-3 max-w-lg text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-[11px] font-semibold text-indigo-200">
                <QrCode size={13} />
                <span>Danışma &amp; Bekleme Salonu Kolaylığı</span>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug">
                Karekod ile Sıra Beklemeden Hızlı Randevu
              </h3>
              <p className="text-[13px] text-slate-300 leading-relaxed">
                Kliniklerimizin bekleme salonlarında ve danışma masalarında yer alan QR kodları telefonunuzla okutarak, bir sonraki seansınızı saniyeler içinde ayırtabilirsiniz.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col items-center gap-2 shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg">
                <QrCode size={80} className="text-slate-900" />
              </div>
              <span className="text-[11px] font-semibold text-indigo-200">Kamera ile Okutun</span>
            </div>
          </div>
        </section>

        {/* ─── 6. CITY & DISTRICT CLINIC SEARCH ENGINE ──────────── */}
        <section id="search-section" className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-16 scroll-mt-28">
          <div className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-7 md:p-8 shadow-xl shadow-slate-200/50">
            
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-teal-600" />
                <h2 className="text-[16px] sm:text-[17px] font-bold text-gray-800">
                  Şehir &amp; İlçe Seçerek Klinik Bul (A-Z Alfabetik)
                </h2>
              </div>

              {(selectedCity || selectedDistrict || searchQuery) && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Filtreleri Temizle</span>
                </button>
              )}
            </div>

            {/* Search Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mb-6">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Şehir (İl) - 81 İl</label>
                <select
                  value={selectedCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-[13px] font-medium text-gray-800 bg-gray-50/50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all cursor-pointer"
                >
                  <option value="">Tüm Türkiye (Tüm Şehirler)</option>
                  {TURKEY_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">İlçe</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  disabled={!selectedCity}
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-[13px] font-medium text-gray-800 bg-gray-50/50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{selectedCity ? 'Tüm İlçeler' : 'Önce İl Seçiniz'}</option>
                  {selectedCityObj?.districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 md:col-span-1">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Klinik / Hekim / Tedavi Ara</label>
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Örn: Manuel Terapi, Fzt. Ahmet..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 placeholder:text-gray-400 bg-gray-50/50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Results List */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <span className="text-[13px] font-bold text-gray-700">
                  {selectedCity ? `${selectedCity} ${selectedDistrict ? `(${selectedDistrict})` : ''} Klinikler` : 'Kayıtlı ve Aktif Klinikler'}
                </span>
                <span className="text-[12px] font-semibold text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-full">
                  {filteredClinics.length} klinik bulundu
                </span>
              </div>

              {loadingClinics ? (
                <div className="py-12 text-center text-gray-400 flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-[13px]">Klinikler yükleniyor...</p>
                </div>
              ) : filteredClinics.length === 0 ? (
                <div className="p-8 rounded-2xl bg-gray-50/80 border border-dashed border-gray-200 text-center text-gray-400 text-[13px]">
                  Seçtiğiniz kriterlere uygun aktif klinik bulunamadı. Farklı bir il, ilçe veya arama terimi deneyebilirsiniz.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredClinics.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl border border-gray-200/80 bg-white hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            {item.logo_url ? (
                              <img src={item.logo_url} alt="Logo" className="w-11 h-11 rounded-xl object-contain border border-gray-100 p-1 shrink-0" />
                            ) : (
                              <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-[16px] text-white shadow-2xs shrink-0"
                                style={{ backgroundColor: item.theme_color || '#059669' }}
                              >
                                {item.name.charAt(0)}
                              </div>
                            )}
                            <div className="truncate">
                              <h3 className="font-bold text-gray-900 text-[15px] truncate">{item.name}</h3>
                              <p className="text-[12px] text-gray-500 font-medium truncate">{item.owner_name}</p>
                            </div>
                          </div>

                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px] shrink-0">
                            ✓ Aktif
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[12px] text-teal-700 bg-teal-50/70 border border-teal-100 px-2.5 py-1 rounded-lg w-fit mb-3">
                          <MapPin size={13} className="text-teal-600 shrink-0" />
                          <span className="font-semibold">{item.city || 'İstanbul'}</span>
                          {item.district && <span>/ {item.district}</span>}
                        </div>

                        <div className="space-y-1 text-[12px] text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Phone size={12} className="text-gray-400 shrink-0" />
                            <span>{item.phone}</span>
                          </div>
                          {item.address && (
                            <p className="text-[11px] text-gray-400 truncate">{item.address}</p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectClinic(item)}
                        className="w-full h-11 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 text-white text-[13px] font-bold transition-all shadow-md shadow-teal-200/50 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <span>Müsait Saatleri Gör &amp; Randevu Al</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── 7. PRICING & CAMPAIGN SECTION ────────────────────── */}
        <section id="pricing-section" className="bg-gradient-to-b from-slate-50/80 via-teal-50/20 to-white py-16 sm:py-20 border-t border-gray-200/80 scroll-mt-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-[12px] font-bold mb-3">
                <Gift size={13} className="text-emerald-700" />
                <span>Lansmana Özel Avantajlı Fiyatlandırma</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                Şeffaf, Ekonomik &amp; Esnek Fiyatlar
              </h2>
              <p className="text-[14px] text-gray-500 mt-2">
                Gizli maliyet yok. 14 gün ücretsiz deneyin, kliniğinizi bugün dijitalleştirin.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
              
              {/* Plan 1: Aylık */}
              <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative">
                <div>
                  <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Aylık Abonelik</span>
                  <h3 className="text-2xl font-extrabold text-gray-900 mt-1 mb-3">Standart Plan</h3>
                  <div className="flex items-baseline gap-1.5 mb-6 pb-6 border-b border-gray-100">
                    <span className="text-4xl font-black text-gray-900">₺250</span>
                    <span className="text-gray-400 font-medium text-sm">/ ay</span>
                  </div>

                  <ul className="space-y-3 text-[13px] text-gray-600 mb-8">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>Sınırsız Hasta ve Randevu Kaydı</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>Canlı Online Randevu Takvimi</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>Çoklu Terapist ve Yetki Yönetimi (RBAC)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>WhatsApp Randevu Onay Bildirimleri</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>Masaüstü / Danışma QR Standı Üretici</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>81 İl Arama Portalı Listelemesi</span>
                    </li>
                  </ul>
                </div>

                <a
                  href="mailto:fatalsoft.inc@gmail.com?subject=FizyoPanel%20Ayl%C4%B1k%20Abonelik%20Talebi&body=Merhaba%2C%20Klini%C4%9Fimiz%20i%C3%A7in%20Ayl%C4%B1k%20(250%20TL)%20paket%20ile%20ba%C5%9Flamak%20istiyoruz."
                  className="w-full h-12 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <span>14 Gün Ücretsiz Başla</span>
                  <ArrowRight size={15} />
                </a>
              </div>

              {/* Plan 2: Yıllık Kampanyalı */}
              <div className="bg-gradient-to-b from-slate-900 to-indigo-950 text-white rounded-3xl border-2 border-indigo-500/50 p-8 shadow-2xl hover:shadow-indigo-500/20 transition-all flex flex-col justify-between relative overflow-hidden">
                
                {/* Campaign Tag */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wide shadow-md">
                  %33 İNDİRİM • 4 AY BEDAVA
                </div>

                <div>
                  <span className="text-[12px] font-bold text-indigo-300 uppercase tracking-wider">Yıllık Lansman Kampanyası</span>
                  <h3 className="text-2xl font-extrabold text-white mt-1 mb-3">Yıllık Avantajlı Plan</h3>
                  
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-black text-white">₺2.000</span>
                    <span className="text-slate-400 font-medium text-sm">/ yıl</span>
                    <span className="text-xs line-through text-slate-400">₺3.000</span>
                  </div>
                  <p className="text-[12px] text-emerald-400 font-semibold mb-6 pb-6 border-b border-slate-800">
                    Ayda sadece ~₺166'ya denk gelir!
                  </p>

                  <ul className="space-y-3 text-[13px] text-slate-200 mb-8">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      <span><strong>Tüm Standart Plan Özellikleri</strong></span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      <span><strong>4 Ay Ücretsiz</strong> Kullanım Avantajı</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      <span>Öncelikli 7/24 Teknik &amp; Canlı Destek</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      <span>Ücretsiz Kurulum &amp; Eski Hasta Veri Aktarımı</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      <span>Şehir/İlçe Portalında <strong>Öne Çıkan Klinik</strong> Rozeti</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      <span>Yıl Boyunca Fiyat Artışından Etkilenmeme Garantisi</span>
                    </li>
                  </ul>
                </div>

                <a
                  href="mailto:fatalsoft.inc@gmail.com?subject=FizyoPanel%20Y%C4%B1ll%C4%B1k%20Kampanya%20Talebi&body=Merhaba%2C%20Klini%C4%9Fimiz%20i%C3%A7in%20Y%C4%B1ll%C4%B1k%20(2.000%20TL)%20Lansman%20Kampanyas%C4%B1ndan%20faydalanmak%20istiyoruz."
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-[14px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <span>Kampanyadan Faydalan &amp; Başla</span>
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── 8. FATALSOFT SAAS SALES & CONTACT FOOTER ─────────── */}
      <footer id="saas-section" className="bg-slate-950 text-slate-400 border-t border-slate-800 scroll-mt-28">
        
        {/* Top CTA Banner for Clinics */}
        <div className="border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950 py-12 sm:py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[12px] font-semibold mb-4">
              <Building2 size={13} />
              <span>Fizyoterapi Klinikleri &amp; Merkezleri İçin</span>
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
              Kliniğiniz İçin FizyoPanel'i Satın Almak İster misiniz?
            </h2>

            <p className="text-[13px] sm:text-[15px] text-slate-300 max-w-2xl mx-auto mb-7 leading-relaxed font-normal">
              Kliniğinizi dijitalleştirin; online randevu takvimi, çoklu fizyoterapist yönetimi, hasta takip sistemi ve otomatik WhatsApp onaylarıyla merkezinizi bir üst seviyeye taşıyın.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="mailto:fatalsoft.inc@gmail.com?subject=FizyoPanel%20Klinik%20Yaz%C4%B1l%C4%B1m%C4%B1%20Sat%C4%B1n%20Alma%20Talebi&body=Merhaba%2C%20Klini%C4%9Fimiz%20i%C3%A7in%20FizyoPanel%20hakk%C4%B1nda%20bilgi%20ve%20fiyat%20teklifi%20almak%20istiyoruz."
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
              >
                <Mail size={15} />
                <span>fatalsoft.inc@gmail.com ile İletişime Geç</span>
              </a>

              <a
                href="mailto:fatalsoft.inc@gmail.com?subject=FizyoPanel%20Demo%20Talebi"
                className="w-full sm:w-auto h-11 px-5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Fiyat &amp; Demo Teklifi Al</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Details & FatalSoft Branding */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center text-white shrink-0">
                <Activity size={14} />
              </div>
              <span className="text-[14px] font-bold text-white tracking-tight">FizyoPanel by FatalSoft</span>
            </div>

            <div className="text-[12px] text-slate-400 flex flex-wrap items-center justify-center gap-4">
              <span>Kurumsal İletişim: <strong className="text-slate-200 font-mono">fatalsoft.inc@gmail.com</strong></span>
            </div>

            <p className="text-[11px] text-slate-400">
              © 2026 <strong className="text-slate-200">FatalSoft Bilişim Teknolojileri</strong>. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
