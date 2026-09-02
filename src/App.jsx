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
    // URL'den clinic parametresini al (?clinic=slug)
    const params = new URLSearchParams(window.location.search);
    const clinicSlug = params.get('clinic');

    const fetchInitialClinic = async () => {
      setLoadingClinic(true);
      try {
        if (clinicSlug) {
          const { data, error } = await supabase
            .from('clinics')
            .select('*')
            .eq('slug', clinicSlug.trim().toLowerCase())
            .maybeSingle();

          if (data) {
            setClinic(data);
            setLoadingClinic(false);
            return;
          }
        }

        // Eğer doğrudan slug yoksa varsayılan ilk kliniği al
        const { data: defaultClinic } = await supabase
          .from('clinics')
          .select('*')
          .eq('status', 'aktif')
          .limit(1)
          .maybeSingle();

        setClinic(defaultClinic || {
          name: 'Fizyotim Demo Klinik',
          phone: '0555 555 55 55',
          city: 'İstanbul',
          district: 'Kadıköy',
          address: 'Merkez',
          slug: 'demo-klinik',
          theme_color: '#059669'
        });
      } catch (err) {
        console.error('Klinik bilgisi yüklenemedi:', err);
      } finally {
        setLoadingClinic(false);
      }
    };

    fetchInitialClinic();
  }, []);

  const handleSelectClinic = (selected) => {
    setClinic(selected);
    setPage('calendar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
          <p className="text-[13px] text-gray-500 font-medium">Fizyotim yükleniyor...</p>
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

  return (
    <Home
      clinic={clinic}
      onSelectClinic={handleSelectClinic}
      onDirectCalendar={() => setPage('calendar')}
    />
  );
}
