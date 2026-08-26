import { useState } from 'react';
import Home from './pages/Home';
import Success from './pages/Success';
import './index.css';

export default function App() {
  const [page, setPage] = useState('home'); // 'home' | 'success'
  const [bookingInfo, setBookingInfo] = useState(null);

  const handleSuccess = (info) => {
    setBookingInfo(info);
    setPage('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setBookingInfo(null);
    setPage('home');
  };

  if (page === 'success') {
    return <Success bookingInfo={bookingInfo} onBack={handleBack} />;
  }

  return <Home onSuccess={handleSuccess} />;
}
