import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../lib/api';
import { X, User, Phone, Stethoscope, MessageSquare, CheckCircle } from 'lucide-react';

export default function BookingModal({ slot, treatments, onClose, onSuccess }) {
  const [form, setForm] = useState({ full_name: '', phone: '', treatment_id: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handlePhone = (e) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 11);
    set('phone', cleaned);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleaned = form.phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setError('Lütfen geçerli bir telefon numarası girin (10-11 hane).');
      return;
    }
    if (!form.treatment_id) {
      setError('Lütfen bir tedavi/hizmet seçin.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Hastayı telefona göre ara
      let patientId = null;
      try {
        const patRes = await axios.get(`${API_URL}/patients/by-phone/${cleaned}`);
        patientId = patRes.data?.id;
      } catch {
        // Bulunamadı — yeni hasta oluştur
      }

      // 2. Hasta yoksa oluştur
      if (!patientId) {
        const newPatRes = await axios.post(`${API_URL}/patients`, {
          full_name: form.full_name.trim(),
          phone: cleaned,
          total_sessions: 10,
        });
        patientId = newPatRes.data?.id;
      }

      if (!patientId) throw new Error('Hasta kaydı oluşturulamadı.');

      // 3. Randevu talebi oluştur
      await axios.post(`${API_URL}/session-requests`, {
        patient_id: patientId,
        treatment_id: form.treatment_id,
        requested_date: slot.date,
        requested_time: slot.time,
        notes: form.notes || null,
      });

      onSuccess({ ...form, phone: cleaned, slot });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || '';
      if (msg.includes('session_requests') || msg.includes('relation')) {
        setError('Randevu sistemi henüz yapılandırılmamış. Lütfen bizimle iletişime geçin.');
      } else {
        setError(msg || 'Bir hata oluştu, lütfen tekrar deneyin.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('tr-TR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-500 px-6 py-5 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={15} className="text-white" />
          </button>
          <p className="text-teal-100 text-[12px] font-medium mb-1">Randevu Talebi</p>
          <p className="text-[17px] font-bold">{formatDate(slot.date)}</p>
          <div className="inline-flex items-center gap-2 mt-2 bg-white/20 rounded-full px-3 py-1">
            <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
            <span className="text-[13px] font-semibold">{slot.time} — Müsait</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Ad Soyad *</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                type="text"
                placeholder="Ahmet Yılmaz"
                value={form.full_name}
                onChange={e => set('full_name', e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-[14px] focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Telefon Numarası *</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                type="tel"
                inputMode="numeric"
                maxLength={11}
                placeholder="05XXXXXXXXX"
                value={form.phone}
                onChange={handlePhone}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-[14px] font-medium tracking-wide focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Treatment */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Tedavi / Hizmet *</label>
            <div className="relative">
              <Stethoscope size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                required
                value={form.treatment_id}
                onChange={e => set('treatment_id', e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-[14px] focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all bg-white appearance-none"
              >
                <option value="">Seçiniz...</option>
                {treatments.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Not <span className="text-gray-400 normal-case font-normal">(isteğe bağlı)</span>
            </label>
            <div className="relative">
              <MessageSquare size={15} className="absolute left-3.5 top-3 text-gray-400" />
              <textarea
                rows={2}
                placeholder="Şikayetiniz veya iletmek istediğiniz bilgiler..."
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-[12px] text-red-600 flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !form.full_name || form.phone.length < 10 || !form.treatment_id}
            className="w-full h-12 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-xl text-[14px] font-semibold hover:from-teal-700 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-200"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Gönderiliyor...</span>
              </>
            ) : (
              <><CheckCircle size={16} /> Randevu Talebi Gönder</>
            )}
          </button>

          <p className="text-center text-[11px] text-gray-400">
            Talebiniz klinik tarafından onaylandıktan sonra sizinle iletişime geçilecektir.
          </p>
        </form>
      </div>
    </div>
  );
}
