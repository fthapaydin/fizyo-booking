import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Success from './pages/Success';
import { Loader2 } from 'lucide-react';
import './index.css';

export default function App() {
  const [page, setPage] = useState('home'); // 'home' | 'calendar' | 'success'
  const [bookingInfo, setBookingInfo] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [loadingClinic, setLoadingClinic] = useState(true);

  useEffect(() => {
    // URL'den clinic parametresini al (?clinic=slug veya ilk path)
    const params = new URLSearchParams(window.location.search);
    let clinicSlug = params.get('clinic');
    
    if (!clinicSlug) {
      const pathPart = window.location.pathname.replace(/^\//, '').split('/')[0];
      if (pathPart && pathPart !== 'calendar' && pathPart !== 'success') {
        clinicSlug = pathPart;
      }
    }

    const fetchClinic = async () => {
      setLoadingClinic(true);
      try {
        let query = supabase.from('clinics').select('*');
        if (clinicSlug) {
          query = query.eq('slug', clinicSlug.trim().toLowerCase());
        } else {
          // Varsayılan ilk aktif kliniği getir
          query = query.eq('status', 'aktif').limit(1);
        }

        const { data, error } = await query.maybeSingle();
        if (data) {
          setClinic(data);
        } else {
          // Eğer slug bulunamadıysa ilk aktif kliniğe düş
          const { data: defaultClinic } = await supabase.from('clinics').select('*').eq('status', 'aktif').limit(1).maybeSingle();
          setClinic(defaultClinic || {
            name: 'Fizyoterapi Kliniği',
            phone: '0555 555 55 55',
            address: 'Merkez',
            slug: 'demo-klinik'
          });
        }
      } catch (err) {
        console.error('Klinik bilgisi yüklenemedi:', err);
      } finally {
        setLoadingClinic(false);
      }
    };

    fetchClinic();
  }, []);

  const handleSuccess = (info) => {
    setBookingInfo(info);
    setPage('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setBookingInfo(null);
    setPage('home');
  };

  if (loadingClinic) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-teal-600 animate-spin" />
          <p className="text-[13px] text-gray-500 font-medium">Klinik bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (page === 'success') {
    return <Success bookingInfo={bookingInfo} clinic={clinic} onBack={handleBack} />;
  }

  if (page === 'calendar') {
    return (
      <Calendar
        clinic={clinic}
        onSuccess={handleSuccess}
        onBack={() => setPage('home')}
      />
    );
  }

  return <Home clinic={clinic} onCalendar={() => setPage('calendar')} />;
}
