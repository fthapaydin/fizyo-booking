import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TURKEY_CITIES } from '../lib/turkeyCities';
import { 
  Activity, Clock, CheckCircle, Star, Phone, MapPin, Search, Building2, Calendar, ArrowRight, ShieldCheck, Stethoscope, Sparkles 
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-emerald-50/30 font-[Inter]">

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {clinic?.logo_url ? (
              <img src={clinic.logo_url} alt="Logo" className="w-8 h-8 rounded-xl object-contain shadow-2xs" />
            ) : (
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md text-white"
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
                {isSpecificClinicMode ? 'Online Randevu' : 'Türkiye Fizyoterapi Portalı'}
              </span>
            </div>
          </div>

          {isSpecificClinicMode ? (
            <button
              onClick={onDirectCalendar}
              className="h-9 px-4 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-xl text-[13px] font-semibold hover:from-teal-700 hover:to-emerald-600 transition-all shadow-md shadow-teal-200 cursor-pointer"
            >
              Doğrudan Randevu Al
            </button>
          ) : (
            <a
              href="#search-section"
              className="h-9 px-4 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl text-[13px] font-semibold hover:bg-teal-100 transition-all flex items-center gap-1.5"
            >
              <Search size={14} />
              <span>Klinik Bul</span>
            </a>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 pt-14 pb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200/80 rounded-full px-4 py-1.5 mb-5 shadow-2xs">
          <Sparkles size={14} className="text-teal-600" />
          <span className="text-[12px] font-bold text-teal-800">
            {isSpecificClinicMode ? `${clinic.name} Online Randevu` : '81 İlde Fizyoterapi & Manuel Terapi Randevusu'}
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4 tracking-tight">
          {isSpecificClinicMode ? (
            <>
              {clinic.name} ile<br />
              <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                Randevunuzu Planlayın
              </span>
            </>
          ) : (
            <>
              Şehrinizdeki En İyi<br />
              <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                Fizyoterapi Kliniklerini Keşfedin
              </span>
            </>
          )}
        </h1>

        <p className="text-[15px] md:text-[16px] text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
          {isSpecificClinicMode
            ? 'Aşağıdaki takvimden müsait saatleri inceleyin, kayıtlı telefon numaranızla anında randevu oluşturun.'
            : 'Bulunduğunuz il ve ilçeyi seçin, uzman fizyoterapistlerin müsait saatlerini canlı görün ve dakikalar içinde randevu alın.'}
        </p>

        {isSpecificClinicMode && (
          <div className="mb-10">
            <button
              onClick={onDirectCalendar}
              className="h-12 px-8 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-2xl text-[15px] font-bold hover:from-teal-700 hover:to-emerald-600 transition-all shadow-xl shadow-teal-200 cursor-pointer inline-flex items-center gap-2"
            >
              <span>{clinic.name} Takvimini Aç</span>
              <ArrowRight size={17} />
            </button>
          </div>
        )}
      </section>

      {/* City & District Search Engine Section */}
      <section id="search-section" className="max-w-5xl mx-auto px-4 pb-14">
        <div className="bg-white rounded-3xl border border-gray-200/90 p-6 md:p-8 shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <MapPin size={18} className="text-teal-600" />
            <h2 className="text-[16px] font-bold text-gray-800">Şehir &amp; İlçe Seçerek Klinik Bul</h2>
          </div>

          {/* Search Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6">
            {/* City Selector */}
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

            {/* District Selector */}
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

            {/* Search Query */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Klinik Adı / Arama</label>
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
                {selectedCity ? `${selectedCity} ${selectedDistrict ? `(${selectedDistrict})` : ''} Klinikler` : 'Kayıtlı Klinikler'}
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
                      {/* Top info */}
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

                      {/* Location Badge */}
                      <div className="flex items-center gap-1.5 text-[12px] text-teal-700 bg-teal-50/70 border border-teal-100 px-2.5 py-1 rounded-lg w-fit mb-3">
                        <MapPin size={13} className="text-teal-600" />
                        <span className="font-semibold">{item.city || 'İstanbul'}</span>
                        {item.district && <span>/ {item.district}</span>}
                      </div>

                      {/* Contact & Address */}
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

                    {/* Booking Action Button */}
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

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-teal-600 to-emerald-500 rounded-lg flex items-center justify-center text-white">
                <Activity size={13} />
              </div>
              <span className="text-[14px] font-bold text-gray-800">FizyoPanel Randevu Sistemi</span>
            </div>
            <p className="text-[12px] text-gray-400">
              Türkiye genelindeki tüm fizik tedavi ve manuel terapi klinikleri için online randevu portalı.
            </p>
            <p className="text-[11px] text-gray-400">© 2026 FizyoPanel</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
