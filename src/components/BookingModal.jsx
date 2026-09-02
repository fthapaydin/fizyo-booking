import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, User, Phone, Stethoscope, MessageSquare, CheckCircle, AlertTriangle, UserCheck } from 'lucide-react';

export default function BookingModal({ clinic, slot, treatments, staff = [], defaultTherapistId = '', onClose, onSuccess }) {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    treatment_id: treatments[0]?.id || '',
    therapist_id: defaultTherapistId || '',
    notes: '',
  });
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

    if (staff.length > 1 && !form.therapist_id) {
      setError('Lütfen seansı yapacak fizyoterapisti seçiniz.');
      return;
    }

    setSubmitting(true);
    try {
      const last10 = cleaned.slice(-10);
      // 1. Sistemde kayıtlı hasta mı kontrol et (Sadece kliniğin kayıtlı hastaları talep oluşturabilir)
      const { data: existingPatient, error: searchErr } = await supabase
        .from('patients')
        .select('id, full_name, phone')
        .ilike('phone', `%${last10}%`)
        .limit(1)
        .maybeSingle();

      if (searchErr) throw searchErr;

      if (!existingPatient) {
        setError(`Girdiğiniz telefon numarası (${cleaned}) sistemimizde kayıtlı bulunamadı. Randevu talebi oluşturabilmek için lütfen kliniğimiz ile iletişime geçiniz.`);
        setSubmitting(false);
        return;
      }

      // 2. Randevu talebi oluştur
      const { error: reqErr } = await supabase
        .from('session_requests')
        .insert([{
          patient_id: existingPatient.id,
          treatment_id: form.treatment_id,
          therapist_id: form.therapist_id || (staff.length === 1 ? staff[0].id : null),
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

  const formattedDate = new Date(slot.date).toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 z-10 animate-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-[12px] font-semibold mb-2">
            <span>📅 {formattedDate}</span>
            <span>•</span>
            <span>⏰ {slot.time}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Randevu Talebi Oluştur</h2>
          <p className="text-[13px] text-gray-500 mt-1">
            Bilgilerinizi doldurarak talebinizi kliniğimize iletin.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-[12px] flex items-start gap-2.5 leading-relaxed">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Ad Soyad */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              Ad Soyad <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                placeholder="Örn: Ahmet Yılmaz"
                value={form.full_name}
                onChange={e => set('full_name', e.target.value)}
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
              />
            </div>
          </div>

          {/* Telefon Numarası */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              Kayıtlı Telefon Numarası <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                required
                placeholder="05XXXXXXXXX (11 Hane)"
                value={form.phone}
                onChange={handlePhone}
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all font-mono"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              * Yalnızca kliniğimizde kayıtlı hastalar randevu açabilir (05 ile başlayınız).
            </p>
          </div>

          {/* Tedavi / Hizmet Seçimi */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              Tedavi / Hizmet Seçin <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Stethoscope size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                required
                value={form.treatment_id}
                onChange={e => set('treatment_id', e.target.value)}
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all bg-white appearance-none cursor-pointer"
              >
                <option value="">Hizmet seçiniz...</option>
                {treatments.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.duration_minutes} dk) — {t.price} ₺
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fizyoterapist Tercihi */}
          {staff.length > 0 && (
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                Fizyoterapist {staff.length > 1 ? <span className="text-red-500">*</span> : '(İsteğe Bağlı)'}
              </label>
              <div className="relative">
                <UserCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  required={staff.length > 1}
                  value={form.therapist_id}
                  onChange={e => set('therapist_id', e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all bg-white appearance-none cursor-pointer"
                >
                  <option value="">{staff.length > 1 ? 'Fizyoterapist seçiniz *' : 'Fark Etmez / İlk Müsait Terapist'}</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.title || 'Fzt.'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Hızlı Şikayet / Ağrı Bölgesi Seçimi */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              Hızlı Şikayet / Ağrı Bölgesi (Seçebilirsiniz)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {[
                '🦴 Bel / Fıtık', '💆‍♂️ Boyun Ağrısı', '🦵 Diz & Menisküs', 
                '🏃 Omuz / Kol', '📐 Postür & Skolyoz', '🦶 Ayak / Topuk Dikeni', '✨ Genel Kontrol'
              ].map((tag) => {
                const isSelected = form.notes?.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        set('notes', form.notes.replace(tag, '').trim());
                      } else {
                        const current = form.notes ? `${form.notes}, ${tag}` : tag;
                        set('notes', current);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 border-teal-400 text-teal-800 font-bold shadow-2xs'
                        : 'bg-gray-50/80 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <MessageSquare size={16} className="absolute left-3.5 top-3 text-gray-400" />
              <textarea
                rows={2}
                placeholder="Şikayetiniz veya eklemek istediğiniz notlar..."
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 mt-2 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 text-white rounded-xl text-[14px] font-bold shadow-lg shadow-teal-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Kontrol Ediliyor &amp; Gönderiliyor...</span>
              </>
            ) : (
              <>
                <CheckCircle size={17} />
                <span>Randevu Talebini Onayla</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
