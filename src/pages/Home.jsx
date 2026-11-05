import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TURKEY_CITIES } from '../lib/turkeyCities';
import { 
  Activity, Clock, CheckCircle, Star, Phone, MapPin, Search, Building2, Calendar, 
  ArrowRight, ShieldCheck, Stethoscope, Sparkles, QrCode, Mail, MessageSquare, 
  Award, CheckCircle2, ChevronRight, UserCheck, HeartHandshake, Layers, X, ExternalLink,
  Zap, Tag, Gift, Filter, RotateCcw, Crosshair, Dumbbell, HeartPulse, Check
} from 'lucide-react';
import { 
  getMarketingSectorKey, setMarketingSectorKey, SECTOR_LIST, SECTOR_PRESETS, getClinicSectorConfig 
} from '../lib/sectorUtils';

const POPULAR_CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Kocaeli', 'Gaziantep'];

const TREATMENTS_SHOWCASE = [
  { 
    id: 'manuel-terapi', 
    title: 'Manuel Terapi & Eklem Mobilizasyonu', 
    desc: 'Omurga ve periferik eklem blokajlarını, faset kilitlenmelerini özel el teknikleriyle açarak doğal hareket açısını ağrısız geri kazandırır.', 
    badge: 'Klinik Mobilizasyon',
    icon: 'Activity',
    tags: ['Faset Blokajı', 'Eklem Mobilizasyonu', 'Ağrısız Hareket']
  },
  { 
    id: 'bel-boyun', 
    title: 'Bel & Boyun Fıtığı (Spinal Dekompresyon)', 
    desc: 'Lomber ve servikal disk hernilerinde ameliyatsız klinik traksiyon, derin omurga stabilizasyonu ve sinir kökü basısını hafifleten dekompresyon.', 
    badge: 'Ameliyatsız Protokol', 
    icon: 'Layers',
    tags: ['Disk Hernisi (Fıtık)', 'Siyatik Sinir', 'Kanal Daralması']
  },
  { 
    id: 'skolyoz-schroth', 
    title: '3D Schroth Skolyoz & Postür Terapisi', 
    desc: '3 boyutlu omurga analizi, rotasyonel açısal solunum ve asimetrik gövde kaslarını dengeleyen uluslararası altın standart Schroth yöntemi.', 
    badge: 'Uluslararası Schroth', 
    icon: 'Sparkles',
    tags: ['Adölesan Skolyoz', 'Kifoz (Kamburluk)', 'Postür Düzeltme']
  },
  { 
    id: 'kuru-igneleme', 
    title: 'Kuru İğneleme (IMS) & Tetik Nokta', 
    desc: 'Kronik kas spazmlarını, inatçı kulunçları ve miyofasiyal ağrı tetik odaklarını ince steril iğnelerle derin kas katmanında çözen medikal terapi.', 
    badge: 'Hedefe Yönelik Tedavi', 
    icon: 'Crosshair',
    tags: ['Miyofasiyal Tetik Nokta', 'Kronik Kulunç', 'Fibromiyalji']
  },
  { 
    id: 'sporcu-sagligi', 
    title: 'Ortopedik & Sporcu Rehabilitasyonu', 
    desc: 'Ön çapraz bağ (ACL), menisküs ve omuz rotator cuff cerrahileri sonrası izokinetik kuvvetlendirme ve spora güvenli dönüş (Return to Play) testleri.', 
    badge: 'Sahaya Dönüş', 
    icon: 'HeartPulse',
    tags: ['Ön Çapraz Bağ (ACL)', 'Menisküs', 'Rotator Cuff']
  },
  { 
    id: 'klinik-pilates', 
    title: 'Klinik Reformer Pilates', 
    desc: 'Fizyoterapist gözetiminde omurga biyomekaniğini koruyan, derin transversus abdominis ve pelvik taban kaslarını güçlendiren medikal reformer.', 
    badge: 'Birebir Uzman', 
    icon: 'Dumbbell',
    tags: ['Core Güçlendirme', 'Boyun Düzleşmesi', 'Hiperlordoz']
  },
  { 
    id: 'cene-eklemi', 
    title: 'Çene Eklemi (TME) Terapisi', 
    desc: 'Diş sıkma (bruksizm), çeneden gelen klik/kütleme sesleri, çiğneme kası spazmları ve çene kaynaklı baş-şakak ağrılarının miyofasiyal tedavisi.', 
    badge: 'TME Uzmanlığı', 
    icon: 'ShieldCheck',
    tags: ['Bruksizm (Diş Sıkma)', 'Klik Sesi', 'Çene Kilitlenmesi']
  },
  { 
    id: 'graston-kupa', 
    title: 'Graston (IASTM) & Medikal Kupa', 
    desc: 'Medikal çelik enstrümanlarla fasyal yapışıklıkların çözülmesi, mikrodolaşımın hızlandırılması ve sertleşmiş skar dokuların gevşetilmesi protokolü.', 
    badge: 'Fasiyal Mobilizasyon', 
    icon: 'Stethoscope',
    tags: ['Fasyal Adezyon', 'Doku Oksijenasyonu', 'Hızlı İyileşme']
  }
];

export default function Home({ clinic, onSelectClinic, onDirectCalendar }) {
  const [clinics, setClinics] = useState([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Dinamik Branş / Sektör Seçimi (URL parametresi ?sektor= ile beslenir)
  const [activeSectorKey, setActiveSectorKey] = useState(() => getMarketingSectorKey());
  const activeConfig = SECTOR_PRESETS[activeSectorKey] || SECTOR_PRESETS.fizyoterapi;

  const handleSelectSector = (sectorId) => {
    setActiveSectorKey(sectorId);
    setMarketingSectorKey(sectorId);
    // URL parametresini sessizce güncelle (sayfa yenilemeden)
    if (window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.set('sektor', sectorId);
      window.history.replaceState({}, '', url.toString());
    }
  };

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
      c.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      await supabase.from('demo_requests').insert([{
        full_name: demoForm.full_name,
        clinic_name: demoForm.clinic_name,
        phone: demoForm.phone,
        email: demoForm.email || null,
        city: demoForm.city || null,
        plan: demoForm.plan,
        notes: `[Sektör: ${activeConfig.badge}] ${demoForm.notes || ''}`.trim(),
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

      {/* ─── 1. NAVBAR (STICKY HEADER) ────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/90 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            {isSpecificClinicMode && clinic?.logo_url ? (
              <img src={clinic.logo_url} alt="Logo" className="w-8 h-8 rounded-xl object-contain shadow-2xs border border-gray-100" />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shadow-xs text-white shrink-0 font-black text-[13px] tracking-tight">
                {activeConfig.icon || 'FT'}
              </div>
            )}
            <div>
              <span className="text-[15px] font-black text-slate-900 tracking-tight block leading-tight">
                {isSpecificClinicMode ? clinic.name : 'Randevu Sistemi'}
              </span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block leading-tight">
                {isSpecificClinicMode ? `${activeConfig.businessSingular.toUpperCase()} RANDEVU SİSTEMİ` : `${activeConfig.shortLabel.toUpperCase()} & ONLİNE RANDEVU SİSTEMİ`}
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
                  {activeConfig.servicePlural}
                </button>
                <button
                  onClick={() => scrollToSection('search-section')}
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-lg text-[12px] font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Search size={14} className="text-teal-600" />
                  <span className="hidden sm:inline">{activeConfig.businessSingular} Bul</span>
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
                  <span>İşletmeler İçin Demo</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        
        {/* ─── 2. HERO SECTION ──────────────────────────────────── */}
        <section className="relative overflow-hidden pt-10 pb-16 sm:pt-14 sm:pb-22 border-b border-slate-200/60 bg-white">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:48px_48px] opacity-50 pointer-events-none" />
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
            
            {/* Multi-Sector Switcher Pills (Pazarlama ve çoklu branş seçimi) */}
            {!isSpecificClinicMode && (
              <div className="mb-6 flex flex-wrap items-center justify-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Sektör Modu:
                </span>
                {SECTOR_LIST.map((s) => {
                  const isActive = s.id === activeSectorKey;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleSelectSector(s.id)}
                      className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-sm ring-2 ring-emerald-500'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{s.icon}</span>
                      <span>{s.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-slate-900 text-white rounded-full px-4 py-1.5 mb-5 max-w-full shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
              <span className="text-[11px] sm:text-[12px] font-semibold tracking-wide truncate">
                {isSpecificClinicMode ? `${clinic.name} • Canlı Randevu Portalı` : `${activeConfig.badge} • 81 İlde Canlı Randevu`}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-[32px] sm:text-5xl md:text-6xl font-black text-slate-900 leading-[1.12] mb-5 tracking-tight px-2">
              {isSpecificClinicMode ? (
                <>
                  {clinic.name} ile<br />
                  <span className="text-slate-500">Sağlığınızı Ertelemeyin</span>
                </>
              ) : (
                <>
                  {activeConfig.marketing.portalHeadline.includes(',') ? (
                    <>
                      {activeConfig.marketing.portalHeadline.split(',')[0]},<br />
                      <span className="text-slate-500">{activeConfig.marketing.portalHeadline.split(',')[1]}</span>
                    </>
                  ) : (
                    activeConfig.marketing.portalHeadline
                  )}
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-[15px] sm:text-[17px] text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed font-normal px-2">
              {isSpecificClinicMode
                ? 'Müsait seans saatlerini canlı takvimden görüntüleyin, kayıtlı telefon numaranızla 1 dakikada randevu talebinizi iletin.'
                : activeConfig.marketing.portalSub}
            </p>

            {/* CTA Buttons */}
            {isSpecificClinicMode ? (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={onDirectCalendar}
                  className="h-12 px-8 bg-slate-900 text-white rounded-xl text-[14px] font-bold hover:bg-slate-800 transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Müsait Saatleri Gör &amp; Randevu Al</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            ) : (
              <div className="space-y-5 max-w-lg mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => scrollToSection('search-section')}
                    className="w-full sm:w-auto h-12 px-7 bg-slate-900 text-white rounded-xl text-[14px] font-bold hover:bg-slate-800 transition-all shadow-md inline-flex items-center justify-center cursor-pointer"
                  >
                    {activeConfig.businessSingular} Bul &amp; Randevu Al
                  </button>
                  <button
                    onClick={() => scrollToSection('how-it-works')}
                    className="w-full sm:w-auto h-12 px-6 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-[13px] font-semibold transition-colors shadow-2xs inline-flex items-center justify-center cursor-pointer"
                  >
                    Nasıl Çalışır?
                  </button>
                </div>

                {/* Quick Popular Cities Filter Pills */}
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  <span className="text-[11px] font-medium text-slate-400 mr-0.5">
                    Hızlı Seçim:
                  </span>
                  {POPULAR_CITIES.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleQuickCityClick(city)}
                      className="px-3 py-1 rounded-full text-[11px] font-medium bg-slate-100 border border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Bar */}
            {!isSpecificClinicMode && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 rounded-2xl overflow-hidden max-w-3xl mx-auto mt-12 border border-slate-200 shadow-sm">
                <div className="p-4 sm:p-5 bg-white text-center">
                  <p className="text-2xl font-black text-slate-900 tracking-tight">81</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-1">İl Kapsamı</p>
                </div>
                <div className="p-4 sm:p-5 bg-white text-center">
                  <p className="text-2xl font-black text-slate-900 tracking-tight">7/24</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-1">Canlı Takvim</p>
                </div>
                <div className="p-4 sm:p-5 bg-white text-center">
                  <p className="text-2xl font-black text-slate-900 tracking-tight">%100</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-1">Sertifikalı {activeConfig.staffPlural}</p>
                </div>
                <div className="p-4 sm:p-5 bg-white text-center">
                  <p className="text-2xl font-black text-slate-900 tracking-tight">Anlık</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-1">Onay &amp; Bildirim</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─── 3. HOW IT WORKS (3 ADIMDA RANDEVU) ────────────────── */}
        <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-14 sm:pt-20 sm:pb-16 scroll-mt-28">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-3">
              İşleyiş
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
              3 Adımda Randevunuz Hazır
            </h2>
            <p className="text-[13px] text-slate-400 leading-relaxed">Telefon başında beklemeden, dilediğiniz saatten randevunuzu ayırtın.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-2xs hover:border-slate-300 hover:shadow-md transition-all border-l-4 border-l-slate-900">
              <p className="text-[40px] font-black text-slate-100 leading-none mb-5 font-mono select-none">01</p>
              <h3 className="text-[16px] font-bold text-slate-900 mb-2">Şehir &amp; {activeConfig.businessSingular} Seçin</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                İl ve ilçenizdeki kayıtlı merkezleri inceleyin, size en uygun {activeConfig.staffSingular.toLowerCase()}i ve hizmeti belirleyin.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-2xs hover:border-slate-300 hover:shadow-md transition-all border-l-4 border-l-slate-400">
              <p className="text-[40px] font-black text-slate-100 leading-none mb-5 font-mono select-none">02</p>
              <h3 className="text-[16px] font-bold text-slate-900 mb-2">Canlı Takvimden Saat Seçin</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                {activeConfig.staffSingular}in boş ve dolu saatlerini canlı takvimde görün. Size uygun seans saatine tıklayın.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-2xs hover:border-slate-300 hover:shadow-md transition-all border-l-4 border-l-emerald-500">
              <p className="text-[40px] font-black text-slate-100 leading-none mb-5 font-mono select-none">03</p>
              <h3 className="text-[16px] font-bold text-slate-900 mb-2">Anında Onay Bildirimi</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Telefon numaranızla talebinizi gönderin. {activeConfig.businessSingular} onayladığı an bildirim cebinize gelsin.
              </p>
            </div>
          </div>
        </section>

        {/* ─── 4. SHOWCASE (BRANŞA GÖRE ÖRNEK HİZMETLER) ──────── */}
        <section id="treatments-section" className="bg-slate-50 border-y border-slate-200 pt-16 pb-16 sm:pt-20 sm:pb-20 scroll-mt-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-3">
                {activeConfig.shortLabel} Hizmet Alanları
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
                Öne Çıkan {activeConfig.servicePlural}
              </h2>
              <p className="text-[13px] sm:text-[14px] text-slate-500 leading-relaxed">
                İlgilendiğiniz alana tıklayarak o alandaki {activeConfig.businessSingular.toLowerCase()}leri anında filtreleyin.
              </p>
            </div>

            {activeSectorKey === 'fizyoterapi' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {TREATMENTS_SHOWCASE.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleTreatmentClick(t.title)}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-slate-800 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="mb-3.5">
                        <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 tracking-tight border border-slate-200">
                          {t.badge}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-[14px] group-hover:text-slate-900 transition-colors mb-2 leading-snug">
                        {t.title}
                      </h4>
                      <p className="text-[12px] text-slate-500 leading-relaxed mb-3.5">
                        {t.desc}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {t.tags?.map((tag, idx) => (
                          <span key={idx} className="text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-slate-900 transition-colors">
                      <span>{activeConfig.businessSingular}leri Listele</span>
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(activeConfig.sampleServices || []).map((srv, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleTreatmentClick(srv.name)}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:border-slate-800 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 tracking-tight border border-emerald-200">
                          {activeConfig.shortLabel}
                        </span>
                        <span className="text-[12px] font-bold text-emerald-600 font-mono">
                          {srv.price} ₺
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-[15px] group-hover:text-slate-900 transition-colors mb-2 leading-snug">
                        {srv.name}
                      </h4>
                      <p className="text-[12px] text-slate-500 leading-relaxed mb-3">
                        {activeConfig.staffSingular} eşliğinde ortalama {srv.duration_minutes} dakikalık profesyonel seans.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-slate-900 transition-colors">
                      <span>{activeConfig.businessSingular} Ara</span>
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ─── 5. PLATFORM TANITIM BANNER ─────────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-18">
          <div className="bg-slate-900 rounded-2xl p-7 sm:p-10 text-white border border-slate-800 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="inline-block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {activeConfig.businessSingular} Yönetim Altyapısı
                </span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                  {activeConfig.businessSingular}iniz için Randevu Yazılımını Keşfedin
                </h3>
                <p className="text-[13px] text-slate-400 leading-relaxed">
                  Online randevu portalı, çoklu {activeConfig.staffSingular.toLowerCase()} takvimi, {activeConfig.clientSingular.toLowerCase()} takip sistemi, kurumsal PDF raporlama ve Excel analitiğiyle işletmenizi dijitalleştirin.
                </p>
                <button
                  type="button"
                  onClick={() => scrollToSection('contact-section')}
                  className="h-11 px-6 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-[13px] inline-flex items-center gap-2 transition-colors cursor-pointer mt-2"
                >
                  <span>Demo &amp; Bilgi Al</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Dinamik Takvim', sub: 'Mola koruması dahil' },
                  { label: 'Kurumsal PDF', sub: 'Logo & antetli raporlar' },
                  { label: 'RBAC Yetki', sub: `Yönetici / ${activeConfig.staffSingular} / Sekreter` },
                  { label: 'Excel Raporu', sub: 'Ciro & performans analitiği' },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                    <p className="text-[13px] font-bold text-white">{item.label}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── 6. CITY & DISTRICT SEARCH ENGINE ──────────── */}
        <section id="search-section" className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-16 scroll-mt-28">
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-7 md:p-8 shadow-2xs">
            
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-[15px] sm:text-[16px] font-bold text-slate-900">
                Şehir &amp; İlçe Seçerek {activeConfig.businessSingular} Bul (A-Z Alfabetik)
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
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{activeConfig.businessSingular} / {activeConfig.staffSingular} / Hizmet Ara</label>
                <input
                  type="text"
                  placeholder={`Örn: ${activeConfig.sampleServices?.[0]?.name || activeConfig.serviceSingular}...`}
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
                  {selectedCity ? `${selectedCity} ${selectedDistrict ? `(${selectedDistrict})` : ''} ${activeConfig.businessSingular}ler` : `Kayıtlı ve Aktif ${activeConfig.businessSingular}ler`}
                </span>
                <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
                  {filteredClinics.length} {activeConfig.businessSingular.toLowerCase()} bulundu
                </span>
              </div>

              {loadingClinics ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-[13px]">{activeConfig.businessSingular}ler yükleniyor...</p>
                </div>
              ) : filteredClinics.length === 0 ? (
                <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-400 text-[13px]">
                  Seçtiğiniz kriterlere uygun aktif {activeConfig.businessSingular.toLowerCase()} bulunamadı. Farklı bir il, ilçe veya arama terimi deneyebilirsiniz.
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
                Gizli maliyet yok. 14 gün ücretsiz deneyin, {activeConfig.businessSingular.toLowerCase()}inizi bugün dijitalleştirin.
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
                      <span>Sınırsız {activeConfig.clientSingular} ve Randevu Kaydı</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">✓</span>
                      <span>Dinamik Takvim &amp; Mola Koruması</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">✓</span>
                      <span>Canlı Online Randevu Portalı &amp; Onay Sistemi</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">✓</span>
                      <span>Çoklu {activeConfig.staffSingular} ve Yetki Yönetimi (RBAC)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">✓</span>
                      <span>Hizmet Yeri Seçimi ({activeConfig.businessSingular}de / Evde / Online)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">✓</span>
                      <span>Toplu Tahsilat &amp; Otomatik FIFO Borç Kapatma</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">✓</span>
                      <span>Kurumsal PDF Makbuz &amp; Excel Ciro Analizi</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">✓</span>
                      <span>Masaüstü Danışma QR Standı Üretici</span>
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
                      <span>Öncelikli 7/24 Destek</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">✓</span>
                      <span>Ücretsiz Kurulum &amp; Eski {activeConfig.clientSingular} Veri Aktarımı</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">✓</span>
                      <span>Şehir/İlçe Portalında <strong>Öne Çıkan {activeConfig.businessSingular}</strong> Rozeti</span>
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

        {/* ─── 8. DEMO & İLETİŞİM FORMU ─── */}
        <section id="contact-section" className="py-16 sm:py-20 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white border-t border-slate-800 scroll-mt-16 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-emerald-600/10 blur-[120px] pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[12px] font-bold mb-3">
                <Sparkles size={13} />
                <span>14 Gün Koşulsuz Ücretsiz Deneme</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
                {activeConfig.businessSingular}iniz İçin Demo &amp; İletişim Talebi
              </h2>
              <p className="text-[14px] text-slate-300 leading-relaxed font-normal">
                Sistemi {activeConfig.businessSingular.toLowerCase()}inizde deneyimlemek, size özel teklif almak veya merak ettiğiniz detayları sormak için formu doldurun. Ekibimiz aynı gün içinde sizinle iletişime geçsin.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Info Column */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-5">
                  <h3 className="text-[16px] font-bold text-white">
                    Neden Bu Sistemi Seçmelisiniz?
                  </h3>

                  <ul className="space-y-4 text-[13px] text-slate-300">
                    {[
                      { n: '01', title: 'Dakikalar İçinde Kurulum', desc: 'Kredi kartı gerekmeden hemen başlayın.' },
                      { n: '02', title: `Canlı ${activeConfig.clientSingular} Takvimi`, desc: `${activeConfig.clientPlural} 7/24 randevu alsın, tek tıkla onaylayın.` },
                      { n: '03', title: 'Hizmet Yeri Takibi', desc: `${activeConfig.businessSingular}de / evde / online seans ayrımı yapın.` },
                      { n: '04', title: 'Otomatik Bilgilendirme', desc: 'Randevu onayları ve hatırlatmaları anında iletin.' },
                      { n: '05', title: 'Kurumsal PDF & Toplu Tahsilat', desc: 'FIFO borç dağıtımı, tek tıkla antetli makbuz.' },
                      { n: '06', title: 'Masaüstü QR Standı', desc: 'Bekleme salonu ve danışma için baskıya hazır QR standı.' },
                    ].map((item) => (
                      <li key={item.n} className="flex items-start gap-3">
                        <span className="text-[10px] font-mono font-bold text-slate-500 mt-0.5 shrink-0 w-5">{item.n}</span>
                        <span><strong className="text-white font-semibold">{item.title}:</strong> {item.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <h4 className="text-[13px] font-bold text-white">
                    Hızlı Destek &amp; Doğrudan İletişim
                  </h4>
                  <p className="text-[12px] text-slate-400 leading-relaxed">
                    Form doldurmak yerine doğrudan mail adresimize yazabilirsiniz:
                  </p>
                  <a
                    href={`mailto:fatalsoft.inc@gmail.com?subject=${encodeURIComponent(activeConfig.badge + ' Demo Talebi')}`}
                    className="text-emerald-400 hover:text-emerald-300 font-mono text-[13px] font-medium transition-colors block pt-1"
                  >
                    fatalsoft.inc@gmail.com
                  </a>
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
                        Sayın <strong className="text-emerald-400">{demoForm.full_name}</strong>, talebiniz ekibimize iletildi. En kısa sürede <span className="font-mono text-white">{demoForm.phone}</span> numaranızdan veya e-postanızdan sizinle iletişime geçeceğiz.
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
                            placeholder={activeConfig.marketing.demoRolePlaceholder}
                            value={demoForm.full_name}
                            onChange={(e) => setDemoForm({ ...demoForm, full_name: e.target.value })}
                            className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-[13px] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] font-semibold text-slate-300 mb-1">
                            {activeConfig.businessSingular} Adı *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={activeConfig.marketing.demoBusinessPlaceholder}
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
                            placeholder="ornek@isletme.com"
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
                          placeholder={`${activeConfig.businessSingular}inizde kaç ${activeConfig.staffSingular.toLowerCase()} çalışıyor veya sormak istediğiniz bir detay var mı?`}
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

      {/* ─── 8. FOOTER ─────────── */}
      <footer id="saas-section" className="bg-slate-950 text-slate-400 border-t border-slate-800 scroll-mt-28">
        
        {/* Top CTA Banner */}
        <div className="border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950 py-12 sm:py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[12px] font-semibold mb-4">
              <Building2 size={13} />
              <span>{activeConfig.badge}</span>
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
              {activeConfig.businessSingular}iniz İçin Randevu Altyapısını Satın Alın
            </h2>

            <p className="text-[13px] sm:text-[15px] text-slate-300 max-w-2xl mx-auto mb-7 leading-relaxed font-normal">
              {activeConfig.businessSingular}inizi dijitalleştirin; online canlı randevu takvimi, çoklu {activeConfig.staffSingular.toLowerCase()} yönetimi, {activeConfig.clientSingular.toLowerCase()} takip sistemi ve anlık onay bildirimleriyle işletmenizi bir üst seviyeye taşıyın.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => scrollToSection('contact-section')}
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
              >
                <Building2 size={15} />
                <span>Hemen Demo Formunu Doldur</span>
              </button>

              <a
                href={`mailto:fatalsoft.inc@gmail.com?subject=${encodeURIComponent(activeConfig.badge + ' Yazılımı Satın Alma Talebi')}`}
                className="w-full sm:w-auto h-11 px-5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Mail size={14} className="text-slate-400" />
                <span>E-posta İle Ulaş</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Details & Branding */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-white shrink-0 font-black text-[11px] tracking-tight">
                {activeConfig.icon || 'FT'}
              </div>
              <span className="text-[14px] font-bold text-white tracking-tight">Randevu Sistemi by FatalSoft</span>
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
