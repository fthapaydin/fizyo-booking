import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TURKEY_CITIES } from '../lib/turkeyCities';
import { 
  Activity, Clock, CheckCircle, Star, Phone, MapPin, Search, Building2, Calendar, 
  ArrowRight, ShieldCheck, Stethoscope, Sparkles, QrCode, Mail, MessageSquare, 
  Award, CheckCircle2, ChevronRight, UserCheck, HeartHandshake, Layers
} from 'lucide-react';

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
      (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCity && matchesDistrict && matchesQuery;
  });

  const handleCityChange = (val) => {
    setSelectedCity(val);
    setSelectedDistrict('');
  };

  const isSpecificClinicMode = clinic && clinic.slug && window.location.search.includes('clinic=');

  const treatmentsShowcase = [
    { title: 'Manuel Terapi', desc: 'Omurga ve eklem blokajlarını açarak ağrısız hareket imkanı.', badge: 'Popüler' },
    { title: 'Bel & Boyun Fıtığı', desc: 'Ameliyatsız kişiye özel egzersiz ve dekompresyon terapisi.', badge: 'Uzmanlık' },
    { title: 'Skolyoz & Postür', desc: 'Kişiye özel 3 boyutlu omurga düzeltme ve postür analizi.', badge: 'Klinik' },
    { title: 'Sporcu Sağlığı', desc: 'Yaralanma sonrası sahaya en hızlı ve güçlü dönüş protokolü.', badge: 'Rehabilitasyon' },
    { title: 'Kuru İğneleme', desc: 'Kaslardaki kronik tetik noktaları ve spazmları anında rahatlatma.', badge: 'Hızlı Etki' },
    { title: 'Klinik Pilates', desc: 'Derin kor kaslarını güçlendiren birebir fizyoterapist eşliğinde pilates.', badge: 'Birebir' },
  ];

  return (
    <div className="min-h-screen bg-[#fafcfb] text-slate-800 font-[Inter] antialiased">

      {/* ─── 1. NAVBAR ────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-gray-100 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {clinic?.logo_url ? (
              <img src={clinic.logo_url} alt="Logo" className="w-8 h-8 rounded-xl object-contain shadow-2xs" />
            ) : (
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm text-white"
                style={{ backgroundColor: clinic?.theme_color || '#059669' }}
              >
                <Activity size={16} strokeWidth={2.5} />
              </div>
            )}
            <div>
              <span className="text-[15px] font-extrabold text-gray-900 tracking-tight block">
                {isSpecificClinicMode ? clinic.name : 'FizyoPanel'}
              </span>
              <span className="text-[10px] text-teal-600 font-semibold uppercase tracking-wider block">
                {isSpecificClinicMode ? 'Online Randevu Sistemi' : 'Fizyoterapi & Sağlık Portalı'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isSpecificClinicMode ? (
              <button
                onClick={onDirectCalendar}
                className="h-9 px-4 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-xl text-[13px] font-semibold hover:from-teal-700 hover:to-emerald-600 transition-all shadow-md shadow-teal-200 cursor-pointer"
              >
                Randevu Al
              </button>
            ) : (
              <>
                <a
                  href="#search-section"
                  className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-[12px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Search size={13} />
                  <span>Klinik Ara</span>
                </a>
                <a
                  href="#saas-section"
                  className="h-9 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[12px] font-semibold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>Klinikler İçin Satın Al</span>
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── 2. HERO SECTION ──────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16 pb-14 md:pt-20 md:pb-20 border-b border-gray-100 bg-gradient-to-b from-teal-50/40 via-white to-slate-50/50">
        <div className="max-w-5xl mx-auto px-4 text-center">
          
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 rounded-full px-4 py-1.5 mb-6 shadow-2xs">
            <Sparkles size={14} className="text-emerald-600" />
            <span className="text-[12px] font-bold text-emerald-800">
              {isSpecificClinicMode ? `${clinic.name} • Canlı Randevu Takvimi` : 'Türkiye Geneli 81 İlde Fizyoterapi & Manuel Terapi Randevusu'}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-[1.15] mb-5 tracking-tight">
            {isSpecificClinicMode ? (
              <>
                {clinic.name} ile<br />
                <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
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

          <p className="text-[15px] md:text-[17px] text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
            {isSpecificClinicMode
              ? 'Müsait saatleri canlı takvimden görüntüleyin, kayıtlı telefon numaranızla anında randevu talebinizi iletin.'
              : 'Şehrinizdeki ve ilçenizdeki uzman fizyoterapistleri keşfedin, müsait seans saatlerini canlı görün ve sıra beklemeden online randevunuzu planlayın.'}
          </p>

          {isSpecificClinicMode ? (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onDirectCalendar}
                className="h-12 px-8 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-2xl text-[15px] font-bold hover:from-teal-700 hover:to-emerald-600 transition-all shadow-xl shadow-teal-200 cursor-pointer inline-flex items-center gap-2"
              >
                <span>Müsait Saatleri Gör &amp; Randevu Al</span>
                <ArrowRight size={17} />
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="#search-section"
                className="h-12 px-7 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-2xl text-[14px] font-bold hover:from-teal-700 hover:to-emerald-600 transition-all shadow-lg shadow-teal-200 inline-flex items-center gap-2"
              >
                <Search size={16} />
                <span>İl &amp; İlçe Seçerek Klinik Bul</span>
              </a>
              <a
                href="#how-it-works"
                className="h-12 px-6 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-2xl text-[14px] font-semibold transition-all shadow-2xs inline-flex items-center gap-1.5"
              >
                <span>Nasıl Çalışır?</span>
              </a>
            </div>
          )}

          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mt-12 pt-8 border-t border-gray-200/60 text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-[12px] font-bold text-gray-900">81 İl Desteği</p>
                <p className="text-[10px] text-gray-400">Türkiye genelinde</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Clock size={16} />
              </div>
              <div>
                <p className="text-[12px] font-bold text-gray-900">Canlı Takvim</p>
                <p className="text-[10px] text-gray-400">08:00 – 20:00 arası</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-[12px] font-bold text-gray-900">Doğrulanmış Uzman</p>
                <p className="text-[10px] text-gray-400">Diplomalı fizyoterapist</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
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
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Kolay &amp; Hızlı
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2.5 mb-2">
            3 Kolay Adımda Randevunuz Hazır
          </h2>
          <p className="text-[13px] text-gray-400">Telefon başında beklemeden, dilediğiniz an randevunuzu ayırtın.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs hover:shadow-md transition-all relative">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 font-black text-base flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="text-[16px] font-bold text-gray-900 mb-1.5">Şehir &amp; Klinik Seçin</h3>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              Bulunduğunuz il ve ilçedeki kayıtlı merkezleri inceleyin, size en uygun fizyoterapisti ve tedaviyi belirleyin.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs hover:shadow-md transition-all relative">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 font-black text-base flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="text-[16px] font-bold text-gray-900 mb-1.5">Canlı Takvimden Saat Seçin</h3>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              Terapistin boş ve dolu saatlerini canlı takvimde görün. Size uyan yeşil saat kutucuğuna tıklayın.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-2xs hover:shadow-md transition-all relative">
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

      {/* ─── 4. TREATMENTS SHOWCASE ───────────────────────────── */}
      <section className="bg-slate-50/80 border-y border-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full uppercase tracking-wider">
              Tedavi &amp; Hizmetler
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2.5 mb-2">
              Kliniklerimizde Sunulan Uzmanlıklar
            </h2>
            <p className="text-[13px] text-gray-400">Alanında yetkin fizyoterapistler tarafından uygulanan başlıca terapiler.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {treatmentsShowcase.map((t, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs hover:border-teal-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-900 text-[15px]">{t.title}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                    {t.badge}
                  </span>
                </div>
                <p className="text-[12px] text-gray-500 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. QR CODE STAND BANNER ──────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-lg text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-[11px] font-semibold text-indigo-200">
              <QrCode size={13} />
              <span>Danışma &amp; Bekleme Salonu Kolaylığı</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-snug">
              Karekod ile Sıra Beklemeden Hızlı Randevu
            </h3>
            <p className="text-[13px] text-slate-300 leading-relaxed">
              Kliniklerimizin bekleme salonlarında ve danışma masalarında yer alan QR kodları telefonunuzla okutarak, bir sonraki seansınızı saniyeler içinde ayırtabilirsiniz.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col items-center gap-2 shrink-0">
            <div className="w-28 h-28 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg">
              <QrCode size={90} className="text-slate-900" />
            </div>
            <span className="text-[11px] font-semibold text-indigo-200">Kamera ile Okutun</span>
          </div>
        </div>
      </section>

      {/* ─── 6. CITY & DISTRICT CLINIC SEARCH ENGINE ──────────── */}
      <section id="search-section" className="max-w-5xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-3xl border border-gray-200/90 p-6 md:p-8 shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <MapPin size={18} className="text-teal-600" />
            <h2 className="text-[16px] font-bold text-gray-800">Şehir &amp; İlçe Seçerek Klinik Bul</h2>
          </div>

          {/* Search Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Şehir (İl)</label>
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

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Klinik / Hekim Ara</label>
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Klinik veya doktor adı..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 placeholder:text-gray-400 bg-gray-50/50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Results List */}
          <div>
            <div className="flex items-center justify-between mb-4">
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
                Seçtiğiniz konumda henüz aktif klinik bulunmuyor. Farklı bir il veya ilçe seçebilirsiniz.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredClinics.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl border border-gray-200/80 bg-white hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          {item.logo_url ? (
                            <img src={item.logo_url} alt="Logo" className="w-11 h-11 rounded-xl object-contain border border-gray-100 p-1" />
                          ) : (
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-[16px] text-white shadow-2xs shrink-0"
                              style={{ backgroundColor: item.theme_color || '#059669' }}
                            >
                              {item.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-gray-900 text-[15px]">{item.name}</h3>
                            <p className="text-[12px] text-gray-500 font-medium">{item.owner_name}</p>
                          </div>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                          ✓ Aktif
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[12px] text-teal-700 bg-teal-50/70 border border-teal-100 px-2.5 py-1 rounded-lg w-fit mb-3">
                        <MapPin size={13} className="text-teal-600" />
                        <span className="font-semibold">{item.city || 'İstanbul'}</span>
                        {item.district && <span>/ {item.district}</span>}
                      </div>

                      <div className="space-y-1 text-[12px] text-gray-500 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Phone size={12} className="text-gray-400" />
                          <span>{item.phone}</span>
                        </div>
                        {item.address && (
                          <p className="text-[11px] text-gray-400 truncate">{item.address}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectClinic(item)}
                      className="w-full h-10 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 text-white text-[13px] font-bold transition-all shadow-md shadow-teal-200/50 flex items-center justify-center gap-1.5 cursor-pointer"
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

      {/* ─── 7. FATALSOFT SAAS SALES & CONTACT FOOTER ─────────── */}
      <footer id="saas-section" className="bg-slate-950 text-slate-400 border-t border-slate-800">
        
        {/* Top CTA Banner for Clinics */}
        <div className="border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950 py-14">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[12px] font-semibold mb-4">
              <Building2 size={13} />
              <span>Fizyoterapi Klinikleri &amp; Merkezleri İçin</span>
            </span>

            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-3">
              Kliniğiniz İçin FizyoPanel'i Satın Almak İster misiniz?
            </h2>

            <p className="text-[14px] md:text-[15px] text-slate-300 max-w-2xl mx-auto mb-7 leading-relaxed">
              Kliniğinizi dijitalleştirin; online randevu takvimi, çoklu fizyoterapist yönetimi, hasta takip sistemi ve otomatik WhatsApp onaylarıyla merkezinizi bir üst seviyeye taşıyın.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:fatalsoft.inc@gmail.com?subject=FizyoPanel%20Klinik%20Yaz%C4%B1l%C4%B1m%C4%B1%20Sat%C4%B1n%20Alma%20Talebi&body=Merhaba%2C%20Klini%C4%9Fimiz%20i%C3%A7in%20FizyoPanel%20hakk%C4%B1nda%20bilgi%20ve%20fiyat%20teklifi%20almak%20istiyoruz."
                className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
              >
                <Mail size={15} />
                <span>fatalsoft.inc@gmail.com ile İletişime Geç</span>
              </a>

              <a
                href="mailto:fatalsoft.inc@gmail.com?subject=FizyoPanel%20Demo%20Talebi"
                className="h-11 px-5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-[13px] font-semibold transition-all flex items-center gap-1.5"
              >
                <span>Fiyat &amp; Demo Teklifi Al</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Details & FatalSoft Branding */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                <Activity size={14} />
              </div>
              <span className="text-[14px] font-bold text-white tracking-tight">FizyoPanel by FatalSoft</span>
            </div>

            <div className="text-[12px] text-slate-400 flex flex-wrap items-center justify-center gap-4">
              <span>Kurumsal İletişim: <strong className="text-slate-200 font-mono">fatalsoft.inc@gmail.com</strong></span>
            </div>

            <p className="text-[11px] text-slate-300">
              © 2026 <strong className="text-slate-200">FatalSoft Bilişim Teknolojileri</strong>. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
