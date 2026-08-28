import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, User, Phone, Stethoscope, MessageSquare, CheckCircle, AlertTriangle } from 'lucide-react';

export default function BookingModal({ clinic, slot, treatments, onClose, onSuccess }) {
  const [form, setForm] = useState({ full_name: '', phone: '', treatment_id: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handlePhone = (e) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 11);
    set('phone', cleaned);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = form.full_name.trim();
    if (!trimmedName || trimmedName.length < 3) {
      setError('Lütfen geçerli bir Ad Soyad giriniz.');
      return;
    }

    const cleaned = form.phone.replace(/\D/g, '');
    if (!cleaned.startsWith('05') || cleaned.length !== 11) {
      setError('Telefon numarası "05" ile başlamalı ve tam 11 haneli olmalıdır (Örn: 05XXXXXXXXX).');
      return;
    }

    if (!form.treatment_id) {
      setError('Lütfen bir tedavi/hizmet seçin.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Sistemde kayıtlı hasta mı kontrol et (Sadece kliniğin kayıtlı hastaları talep oluşturabilir)
      let patientQuery = supabase
        .from('patients')
        .select('id, full_name, phone')
        .ilike('phone', `%${cleaned}%`);

      if (clinic?.id) {
        patientQuery = patientQuery.eq('clinic_id', clinic.id);
      }

      const { data: existingPatient, error: searchErr } = await patientQuery.limit(1).maybeSingle();

      if (searchErr) throw searchErr;

      if (!existingPatient) {
        setError(`Girdiğiniz telefon numarası ${clinic?.name || 'kliniğimiz'} sisteminde kayıtlı bulunamadı. Randevu talebi oluşturabilmek için lütfen kliniğimiz ile iletişime geçiniz.`);
        setSubmitting(false);
        return;
      }

      // 2. Randevu talebi oluştur
      const { error: reqErr } = await supabase
        .from('session_requests')
        .insert([{
          clinic_id: clinic?.id || null,
          patient_id: existingPatient.id,
          treatment_id: form.treatment_id,
          requested_date: slot.date,
          requested_time: slot.time,
          notes: form.notes?.trim() || null,
          status: 'bekliyor',
        }]);

      if (reqErr) throw reqErr;

      onSuccess({
        ...form,
        full_name: existingPatient.full_name || trimmedName,
        phone: cleaned,
        slot
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Bir hata oluştu, lütfen tekrar deneyin.');
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
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                placeholder="Adınız Soyadınız"
                value={form.full_name}
                onChange={e => { set('full_name', e.target.value); if (error) setError(''); }}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-[14px] focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Telefon Numarası (05XXXXXXXXX) *</label>
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
            <p className="text-[11px] text-gray-400 mt-1">Sadece kliniğimizde kayıtlı telefon numaraları ile talep oluşturulabilir.</p>
          </div>

          {/* Treatment */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Tedavi / Hizmet *</label>
            <div className="relative">
              <Stethoscope size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                required
                value={form.treatment_id}
                onChange={e => { set('treatment_id', e.target.value); if (error) setError(''); }}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-[14px] focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all bg-white appearance-none"
              >
                <option value="">Seçiniz...</option>
                {treatments.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.price} ₺)</option>
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
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-[12px] text-red-700 flex items-start gap-2.5 leading-relaxed">
              <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !form.full_name.trim() || form.phone.length !== 11 || !form.phone.startsWith('05') || !form.treatment_id}
            className="w-full h-12 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-xl text-[14px] font-semibold hover:from-teal-700 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-200"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Kontrol ediliyor...</span>
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

