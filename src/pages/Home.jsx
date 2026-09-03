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
  },
  { 
    id: 'bel-boyun', 
    title: 'Bel & Boyun Fıtığı', 
    desc: 'Ameliyatsız kişiye özel klinik dekompresyon, çekme ve derin omurga egzersiz terapisi.', 
    badge: 'Uzmanlık', 
  },
  { 
    id: 'skolyoz-postur', 
    title: 'Skolyoz & Postür', 
    desc: '3 boyutlu omurga analizi, Schroth metodu ve duruş bozuklukları için özel düzeltme protokolü.', 
    badge: 'Klinik Protokol', 
  },
  { 
    id: 'sporcu-sagligi', 
    title: 'Sporcu Rehabilitasyonu', 
    desc: 'Menisküs, ön çapraz bağ ve kas yırtılmaları sonrası sahaya güçlü ve hızlı dönüş programı.', 
    badge: 'Rehabilitasyon', 
  },
  { 
    id: 'kuru-igneleme', 
    title: 'Kuru İğneleme & Kupa', 
    desc: 'Kronik kas spazmlarını, tetik noktaları ve kulunçları tek seansta rahatlatan medikal uygulama.', 
    badge: 'Hızlı Rahatlama', 
  },
  { 
    id: 'klinik-pilates', 
    title: 'Klinik Pilates', 
    desc: 'Fizyoterapist eşliğinde omurga sağlığını koruyan, derin kor kaslarını güçlendiren reformer seansları.', 
    badge: 'Birebir Seans', 
  },
];

export default function Home({ clinic, onSelectClinic, onDirectCalendar }) {
  const [clinics, setClinics] = useState([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Demo & İletişim Form State
  const [demoForm, setDemoForm] = useState({
    full_name: '',
    clinic_name: '',
    phone: '',
    email: '',
    city: '',
    plan: '14-gun-deneme',
    notes: ''
  });
  const [demoSubmitting, setDemoSubmitting] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState(false);

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

  const handleSelectPlan = (planKey) => {
    setDemoForm(prev => ({ ...prev, plan: planKey }));
    scrollToSection('contact-section');
  };

  const handleDemoSubmit = async (e) => {
    e.preventDefault();
    setDemoSubmitting(true);
    try {
      // Try saving to Supabase if table exists
      await supabase.from('demo_requests').insert([{
        full_name: demoForm.full_name,
        clinic_name: demoForm.clinic_name,
        phone: demoForm.phone,
        email: demoForm.email || null,
        city: demoForm.city || null,
        plan: demoForm.plan,
        notes: demoForm.notes || null,
        created_at: new Date().toISOString()
      }]).catch(() => {});

      setDemoSuccess(true);
    } catch {
      setDemoSuccess(true);
    } finally {
      setDemoSubmitting(false);
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
                {isSpecificClinicMode ? clinic.name : 'Fizyotim'}
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
                  onClick={() => scrollToSection('contact-section')}
                  className="h-8 sm:h-9 px-3 sm:px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] sm:text-[12px] font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Building2 size={13} className="text-emerald-400" />
                  <span>Klinikler İçin Demo</span>
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
            <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full px-3.5 py-1 mb-5 max-w-full">
              <span className="text-[11px] sm:text-[12px] font-semibold text-slate-700 truncate">
                {isSpecificClinicMode ? `${clinic.name} • Canlı Randevu Portalı` : 'Fizyotim • 81 İlde Fizyoterapi & Manuel Terapi Randevusu'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.18] mb-4 tracking-tight px-2">
              {isSpecificClinicMode ? (
                <>
                  {clinic.name} ile<br />
                  <span>Sağlığınızı Ertelemeyin</span>
                </>
              ) : (
                <>
                  Doğru Fizyoterapisti Bulun,<br />
                  <span>Dakikalar İçinde Randevu Alın</span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-[14px] sm:text-[16px] text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed font-normal px-2">
              {isSpecificClinicMode
                ? 'Müsait seans saatlerini canlı takvimden görüntüleyin, kayıtlı telefon numaranızla 1 dakikada randevu talebinizi iletin.'
                : 'Şehrinizdeki ve ilçenizdeki uzman fizyoterapistleri keşfedin, müsait seans saatlerini canlı görün ve online randevunuzu planlayın.'}
            </p>

            {/* CTA Buttons */}
            {isSpecificClinicMode ? (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={onDirectCalendar}
                  className="h-11 px-8 bg-slate-900 text-white rounded-xl text-[14px] font-semibold hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Müsait Saatleri Gör &amp; Randevu Al</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-w-lg mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => scrollToSection('search-section')}
                    className="w-full sm:w-auto h-11 px-6 bg-slate-900 text-white rounded-xl text-[13px] font-semibold hover:bg-slate-800 transition-colors shadow-2xs inline-flex items-center justify-center cursor-pointer"
                  >
                    İl &amp; İlçe Seçerek Klinik Bul
                  </button>
                  <button
                    onClick={() => scrollToSection('how-it-works')}
                    className="w-full sm:w-auto h-11 px-6 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-[13px] font-semibold transition-colors shadow-2xs inline-flex items-center justify-center cursor-pointer"
                  >
                    Nasıl Çalışır?
                  </button>
                </div>

                {/* Quick Popular Cities Filter Pills */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                  <span className="text-[11px] font-medium text-slate-400 mr-1">
                    Popüler İller:
                  </span>
                  {POPULAR_CITIES.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleQuickCityClick(city)}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white border border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trust Badges Bar (Tek Renk Kurumsal Kutular) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mt-12 pt-8 border-t border-slate-200/80 text-left">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={15} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900">81 İl Desteği</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Tüm il ve ilçelerde</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar size={15} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900">Canlı Takvim</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">08:00 – 20:00 seanslar</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck size={15} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900">Doğrulanmış Uzman</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Diplomalı fizyoterapistler</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare size={15} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900">Anında Bildirim</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">SMS &amp; WhatsApp onayı</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3. HOW IT WORKS (3 ADIMDA RANDEVU) ────────────────── */}
        <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-14 sm:pt-20 sm:pb-16 scroll-mt-28">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
              Kolay &amp; Hızlı İşleyiş
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2.5 mb-2 tracking-tight">
              3 Kolay Adımda Randevunuz Hazır
            </h2>
            <p className="text-[13px] text-slate-400">Telefon başında beklemeden, dilediğiniz an randevunuzu ayırtın.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono font-bold text-slate-400 block">01</span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Search size={15} />
                </div>
              </div>
              <h3 className="text-[15px] font-bold text-slate-900 mb-1.5">Şehir &amp; Klinik Seçin</h3>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                İl ve ilçenizdeki kayıtlı merkezleri inceleyin, size en uygun fizyoterapisti ve tedaviyi belirleyin.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono font-bold text-slate-400 block">02</span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Calendar size={15} />
                </div>
              </div>
              <h3 className="text-[15px] font-bold text-slate-900 mb-1.5">Canlı Takvimden Saat Seçin</h3>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Terapistin boş ve dolu saatlerini canlı takvimde görün. Size uygun olan seans saatine tıklayın.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono font-bold text-slate-400 block">03</span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <CheckCircle2 size={15} />
                </div>
              </div>
              <h3 className="text-[15px] font-bold text-slate-900 mb-1.5">WhatsApp ile Anında Onay</h3>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Kayıtlı telefon numaranızla talebinizi gönderin. Randevunuz onaylandığı an bildirim cebinize gelsin.
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
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {t.badge}
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-slate-50 text-slate-400 group-hover:text-teal-600 flex items-center justify-center transition-colors">
                        <Activity size={13} />
                      </div>
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
          <div className="bg-slate-900 rounded-xl p-6 sm:p-8 md:p-10 text-white border border-slate-800 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            <div className="space-y-3 max-w-lg text-left">
              <span className="inline-block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Danışma &amp; Bekleme Salonu Kolaylığı
              </span>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-snug">
                Karekod ile Sıra Beklemeden Hızlı Randevu
              </h3>
              <p className="text-[13px] text-slate-400 leading-relaxed">
                Kliniklerimizin bekleme salonlarında ve danışma masalarında yer alan QR kodları telefonunuzla okutarak, bir sonraki seansınızı saniyeler içinde ayırtabilirsiniz.
              </p>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center gap-2 shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white p-2 rounded-lg flex items-center justify-center">
                <QrCode size={80} className="text-slate-900" />
              </div>
              <span className="text-[11px] font-medium text-slate-400">Kamera ile Okutun</span>
            </div>
          </div>
        </section>

        {/* ─── 6. CITY & DISTRICT CLINIC SEARCH ENGINE ──────────── */}
        <section id="search-section" className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-16 scroll-mt-28">
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-7 md:p-8 shadow-2xs">
            
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-[15px] sm:text-[16px] font-bold text-slate-900">
                Şehir &amp; İlçe Seçerek Klinik Bul (A-Z Alfabetik)
              </h2>

              {(selectedCity || selectedDistrict || searchQuery) && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>

            {/* Search Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mb-6">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Şehir (İl) - 81 İl</label>
                <select
                  value={selectedCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-800 bg-white focus:border-slate-400 outline-none transition-all cursor-pointer"
                >
                  <option value="">Tüm Türkiye (Tüm Şehirler)</option>
                  {TURKEY_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">İlçe</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  disabled={!selectedCity}
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-800 bg-white focus:border-slate-400 outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{selectedCity ? 'Tüm İlçeler' : 'Önce İl Seçiniz'}</option>
                  {selectedCityObj?.districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 md:col-span-1">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Klinik / Hekim / Tedavi Ara</label>
                <input
                  type="text"
                  placeholder="Örn: Manuel Terapi, Fzt. Ahmet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 text-[13px] text-slate-800 placeholder:text-slate-400 bg-white focus:border-slate-400 outline-none transition-all"
                />
              </div>
            </div>

            {/* Results List */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <span className="text-[13px] font-bold text-slate-800">
                  {selectedCity ? `${selectedCity} ${selectedDistrict ? `(${selectedDistrict})` : ''} Klinikler` : 'Kayıtlı ve Aktif Klinikler'}
                </span>
                <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
                  {filteredClinics.length} klinik bulundu
                </span>
              </div>

              {loadingClinics ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-[13px]">Klinikler yükleniyor...</p>
                </div>
              ) : filteredClinics.length === 0 ? (
                <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-400 text-[13px]">
                  Seçtiğiniz kriterlere uygun aktif klinik bulunamadı. Farklı bir il, ilçe veya arama terimi deneyebilirsiniz.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredClinics.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between gap-4 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            {item.logo_url ? (
                              <img src={item.logo_url} alt="Logo" className="w-10 h-10 rounded-lg object-contain border border-slate-200 p-1 shrink-0" />
                            ) : (
                              <div
                                className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center font-bold text-[14px] shrink-0"
                              >
                                {item.name.charAt(0)}
                              </div>
                            )}
                            <div className="truncate">
                              <h3 className="font-bold text-slate-900 text-[14px] truncate">{item.name}</h3>
                              <p className="text-[11px] text-slate-500 font-medium truncate">{item.owner_name}</p>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded text-slate-600 bg-slate-100 font-semibold text-[10px] shrink-0">
                            Aktif
                          </span>
                        </div>

                        <div className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded w-fit mb-3">
                          <span>{item.city || 'İstanbul'}</span>
                          {item.district && <span> / {item.district}</span>}
                        </div>

                        <div className="space-y-1 text-[12px] text-slate-500">
                          <p>{item.phone}</p>
                          {item.address && (
                            <p className="text-[11px] text-slate-400 truncate">{item.address}</p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectClinic(item)}
                        className="w-full h-10 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-semibold transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                      >
                        Müsait Saatleri Gör &amp; Randevu Al
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── 7. PRICING & CAMPAIGN SECTION ────────────────────── */}
        <section id="pricing-section" className="bg-white py-16 sm:py-20 border-t border-slate-200 scroll-mt-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="inline-block text-[11px] font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                Lansmana Özel Avantajlı Fiyatlandırma
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Şeffaf, Ekonomik &amp; Esnek Fiyatlar
              </h2>
              <p className="text-[14px] text-slate-500 mt-2">
                Gizli maliyet yok. 14 gün ücretsiz deneyin, kliniğinizi bugün dijitalleştirin.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
              
              {/* Plan 1: Aylık */}
              <div className="bg-white rounded-xl border border-slate-200 p-7 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Aylık Abonelik</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1 mb-3">Standart Plan</h3>
                  <div className="flex items-baseline gap-1.5 mb-6 pb-6 border-b border-slate-100">
                    <span className="text-3xl font-bold text-slate-900">₺250</span>
                    <span className="text-slate-400 font-medium text-sm">/ ay</span>
                  </div>

                  <ul className="space-y-2.5 text-[13px] text-slate-600 mb-8">
                    <li className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">✓</span>
                      <span>Sınırsız Hasta ve Randevu Kaydı</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">✓</span>
                      <span>Canlı Online Randevu Takvimi</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">✓</span>
                      <span>Haftalık &amp; Tekil Seans Kopyalama (Şablon Çoğaltma)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">✓</span>
                      <span>Çoklu Terapist ve Yetki Yönetimi (RBAC)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">✓</span>
                      <span>WhatsApp Randevu Onay Bildirimleri</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">✓</span>
                      <span>Masaüstü / Danışma QR Standı Üretici</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">✓</span>
                      <span>81 İl Arama Portalı Listelemesi</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectPlan('14-gun-deneme')}
                  className="w-full h-10 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[13px] transition-colors cursor-pointer shadow-2xs"
                >
                  14 Gün Ücretsiz Başla
                </button>
              </div>

              {/* Plan 2: Yıllık Kampanyalı */}
              <div className="bg-slate-900 text-white rounded-xl border border-slate-800 p-7 shadow-2xs flex flex-col justify-between relative">
                
                {/* Campaign Tag */}
                <div className="absolute top-4 right-4 bg-slate-800 text-slate-200 border border-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                  %33 İNDİRİM • 4 AY BEDAVA
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Yıllık Lansman Kampanyası</span>
                  <h3 className="text-xl font-bold text-white mt-1 mb-3">Yıllık Avantajlı Plan</h3>
                  
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-white">₺2.000</span>
                    <span className="text-slate-400 font-medium text-sm">/ yıl</span>
                    <span className="text-xs line-through text-slate-500">₺3.000</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-6 pb-6 border-b border-slate-800">
                    Ayda sadece ~₺166'ya denk gelir
                  </p>

                  <ul className="space-y-2.5 text-[13px] text-slate-300 mb-8">
                    <li className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">✓</span>
                      <span><strong>Tüm Standart Plan Özellikleri</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">✓</span>
                      <span><strong>4 Ay Ücretsiz</strong> Kullanım Avantajı</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">✓</span>
                      <span>Öncelikli 7/24 Teknik &amp; Canlı Destek</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">✓</span>
                      <span>Ücretsiz Kurulum &amp; Eski Hasta Veri Aktarımı</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">✓</span>
                      <span>Şehir/İlçe Portalında <strong>Öne Çıkan Klinik</strong> Rozeti</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">✓</span>
                      <span>Yıl Boyunca Fiyat Artışından Etkilenmeme Garantisi</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectPlan('yillik-kampanya')}
                  className="w-full h-10 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-semibold text-[13px] transition-colors cursor-pointer shadow-2xs"
                >
                  Kampanyadan Faydalan &amp; Başla
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 8. KLİNİK DEMO & İLETİŞİM FORMU (INTERACTIVE CONTACT FORM) ─── */}
        <section id="contact-section" className="py-16 sm:py-20 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white border-t border-slate-800 scroll-mt-16 relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-emerald-600/10 blur-[120px] pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[12px] font-bold mb-3">
                <Sparkles size={13} />
                <span>14 Gün Koşulsuz Ücretsiz Deneme</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
                Kliniğiniz İçin Demo &amp; İletişim Talebi
              </h2>
              <p className="text-[14px] text-slate-300 leading-relaxed font-normal">
                Fizyotim'i merkezinizde deneyimlemek, size özel fiyat teklifi almak veya aklınızdaki soruları iletmek için formu doldurun. Uzman ekibimiz aynı gün içinde sizinle iletişime geçsin.
              </p>
            </div>

            {/* Form & Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Info Column */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-6 rounded-3xl bg-slate-800/60 border border-slate-700/80 space-y-5">
                  <h3 className="text-[16px] font-bold text-white flex items-center gap-2">
                    <Building2 size={18} className="text-emerald-400" />
                    <span>Neden Fizyotim?</span>
                  </h3>

                  <ul className="space-y-3.5 text-[13px] text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Dakikalar İçinde Kurulum:</strong> Kredi kartı gerekmeden hemen başlayın.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Canlı Hasta Takvimi:</strong> Hastalarınız 7/24 randevu alsın, tek tıkla onaylayın.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Otomatik WhatsApp:</strong> Hatırlatmalar ve randevu onayları hastanın cebine gitsin.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Masaüstü QR Standı:</strong> Danışma ve bekleme salonu için baskıya hazır stand üretici.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 rounded-3xl bg-emerald-950/40 border border-emerald-800/40 space-y-3">
                  <h4 className="text-[14px] font-bold text-emerald-300 flex items-center gap-2">
                    <Phone size={16} />
                    <span>Hızlı Destek &amp; Doğrudan İletişim</span>
                  </h4>
                  <p className="text-[12px] text-emerald-100/80 leading-relaxed">
                    Form doldurmak yerine doğrudan ekibimize ulaşmak isterseniz kurumsal e-posta üzerinden de yazabilirsiniz:
                  </p>
                  <div className="flex flex-col gap-2 pt-1 text-[13px]">
                    <a
                      href="mailto:fatalsoft.inc@gmail.com?subject=Fizyotim%20Demo%20Talebi"
                      className="text-white hover:text-emerald-300 font-mono font-medium flex items-center gap-2 transition-colors"
                    >
                      <Mail size={14} className="text-emerald-400" />
                      <span>fatalsoft.inc@gmail.com</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Form Column */}
              <div className="lg:col-span-7">
                <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/80 border border-slate-700 shadow-2xl backdrop-blur-md">
                  {demoSuccess ? (
                    <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
                      <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                        <CheckCircle2 size={32} />
                      </div>
                      <h3 className="text-2xl font-black text-white">Talebiniz Başarıyla Alındı!</h3>
                      <p className="text-[14px] text-slate-300 max-w-md mx-auto leading-relaxed">
                        Sayın <strong className="text-emerald-400">{demoForm.full_name}</strong>, talebiniz danışman ekibimize iletildi. En kısa sürede (genellikle 1 saat içinde) <span className="font-mono text-white">{demoForm.phone}</span> numaranızdan sizinle iletişime geçeceğiz.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setDemoSuccess(false);
                          setDemoForm({
                            full_name: '',
                            clinic_name: '',
                            phone: '',
                            email: '',
                            city: '',
                            plan: '14-gun-deneme',
                            notes: ''
                          });
                        }}
                        className="h-10 px-5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-[12px] font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <span>Yeni Bir Talep Gönder</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleDemoSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[12px] font-semibold text-slate-300 mb-1">
                            Yetkili Ad Soyad *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Örn: Dr. Fatih Apaydın"
                            value={demoForm.full_name}
                            onChange={(e) => setDemoForm({ ...demoForm, full_name: e.target.value })}
                            className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-[13px] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] font-semibold text-slate-300 mb-1">
                            Klinik / Merkez Adı *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Örn: Yaşam Fizyoterapi Merkezi"
                            value={demoForm.clinic_name}
                            onChange={(e) => setDemoForm({ ...demoForm, clinic_name: e.target.value })}
                            className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-[13px] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[12px] font-semibold text-slate-300 mb-1">
                            Telefon Numarası *
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="05XXXXXXXXX"
                            value={demoForm.phone}
                            onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                            className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-[13px] font-mono outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] font-semibold text-slate-300 mb-1">
                            E-posta Adresi
                          </label>
                          <input
                            type="email"
                            placeholder="ornek@klinik.com"
                            value={demoForm.email}
                            onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                            className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-[13px] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[12px] font-semibold text-slate-300 mb-1">
                          Şehir / İlçe
                        </label>
                        <input
                          type="text"
                          placeholder="Örn: İstanbul / Kadıköy"
                          value={demoForm.city}
                          onChange={(e) => setDemoForm({ ...demoForm, city: e.target.value })}
                          className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-[13px] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[12px] font-semibold text-slate-300 mb-1.5">
                          İlgilendiğiniz Paket / Seçenek
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setDemoForm({ ...demoForm, plan: '14-gun-deneme' })}
                            className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all text-left cursor-pointer ${
                              demoForm.plan === '14-gun-deneme'
                                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                            }`}
                          >
                            <span className="block font-bold">14 Gün Ücretsiz Deneme</span>
                            <span className="text-[10px] font-normal opacity-80">Taahhüt yok</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDemoForm({ ...demoForm, plan: 'yillik-kampanya' })}
                            className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all text-left cursor-pointer ${
                              demoForm.plan === 'yillik-kampanya'
                                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                            }`}
                          >
                            <span className="block font-bold">Yıllık Avantajlı Plan</span>
                            <span className="text-[10px] font-normal opacity-80">%33 indirim</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDemoForm({ ...demoForm, plan: 'ozel-teklif' })}
                            className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all text-left cursor-pointer ${
                              demoForm.plan === 'ozel-teklif'
                                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                            }`}
                          >
                            <span className="block font-bold">Özel Fiyat &amp; Danışmanlık</span>
                            <span className="text-[10px] font-normal opacity-80">Görüşme talep et</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[12px] font-semibold text-slate-300 mb-1">
                          Not / İhtiyaç Notu (Opsiyonel)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Kliniğinizde kaç fizyoterapist çalışıyor veya sormak istediğiniz bir detay var mı?"
                          value={demoForm.notes}
                          onChange={(e) => setDemoForm({ ...demoForm, notes: e.target.value })}
                          className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-[13px] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={demoSubmitting}
                        className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-[14px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                      >
                        {demoSubmitting ? (
                          <span>Gönderiliyor...</span>
                        ) : (
                          <>
                            <span>🚀 Demo &amp; Bilgi Talebini İlet</span>
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
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
              Kliniğiniz İçin Fizyotim'i Satın Almak İster misiniz?
            </h2>

            <p className="text-[13px] sm:text-[15px] text-slate-300 max-w-2xl mx-auto mb-7 leading-relaxed font-normal">
              Kliniğinizi dijitalleştirin; online randevu takvimi, çoklu fizyoterapist yönetimi, hasta takip sistemi ve otomatik WhatsApp onaylarıyla merkezinizi bir üst seviyeye taşıyın.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => scrollToSection('contact-section')}
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
              >
                <Building2 size={15} />
                <span>Hemen Demo &amp; İletişim Formunu Doldur</span>
              </button>

              <a
                href="mailto:fatalsoft.inc@gmail.com?subject=Fizyotim%20Klinik%20Yaz%C4%B1l%C4%B1m%C4%B1%20Sat%C4%B1n%20Alma%20Talebi"
                className="w-full sm:w-auto h-11 px-5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Mail size={14} className="text-slate-400" />
                <span>E-posta İle Ulaş</span>
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
              <span className="text-[14px] font-bold text-white tracking-tight">Fizyotim by FatalSoft</span>
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
