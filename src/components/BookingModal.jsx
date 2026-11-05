import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Phone, Stethoscope, MessageSquare, CheckCircle, AlertTriangle, UserCheck, User, Sparkles } from 'lucide-react';
import { getClinicSchedule, isBreakSlot } from '../lib/scheduleUtils';
import { getTreatmentAssignedStaff } from '../lib/rbacUtils';
import { encodeSessionNotes, getClinicLocations, getSessionLocationMeta } from '../lib/sessionLocationUtils';
import { getClinicSectorConfig } from '../lib/sectorUtils';

export default function BookingModal({ clinic, slot, treatments, staff = [], defaultTherapistId = '', onClose, onSuccess }) {
  const sector = getClinicSectorConfig(clinic);
  const availableLocations = getClinicLocations(clinic);
  const [locationType, setLocationType] = useState(() => availableLocations[0]?.id || 'klinik');
  
  const [form, setForm] = useState({
    phone: '',
    full_name: '',
    treatment_id: treatments[0]?.id || '',
    therapist_id: defaultTherapistId || '',
    notes: '',
  });

  const [isNewPatient, setIsNewPatient] = useState(false);
  const [checkedPatientName, setCheckedPatientName] = useState('');
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  // Telefon 11 hane olduğunda sistemde var mı sessizce kontrol et
  useEffect(() => {
    const cleaned = form.phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('05')) {
      const last10 = cleaned.slice(-10);
      setCheckingPhone(true);
      supabase
        .from('patients')
        .select('id, full_name, phone')
        .ilike('phone', `%${last10}%`)
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setIsNewPatient(false);
            setCheckedPatientName(data.full_name);
            setForm(prev => ({ ...prev, full_name: data.full_name }));
          } else {
            setIsNewPatient(true);
            setCheckedPatientName('');
          }
        })
        .catch(() => {})
        .finally(() => setCheckingPhone(false));
    } else {
      setIsNewPatient(false);
      setCheckedPatientName('');
    }
  }, [form.phone]);

  const handlePhone = (e) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 11);
    set('phone', cleaned);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleaned = form.phone.replace(/\D/g, '');
    if (!cleaned.startsWith('05') || cleaned.length !== 11) {
      setError('Telefon numarası "05" ile başlamalı ve tam 11 haneli olmalıdır (Örn: 05XXXXXXXXX).');
      return;
    }

    if (isNewPatient && !form.full_name.trim()) {
      setError(`Lütfen adınızı ve soyadınızı giriniz.`);
      return;
    }

    if (!form.treatment_id) {
      setError(`Lütfen bir ${sector.serviceSingular.toLowerCase()} seçiniz.`);
      return;
    }

    if (staff.length > 1 && !form.therapist_id) {
      setError(`Lütfen ${sector.staffSingular.toLowerCase()} seçiniz.`);
      return;
    }

    setSubmitting(true);
    try {
      const last10 = cleaned.slice(-10);
      let existingPatient = null;

      // 1. Hasta kontrolü
      const { data: foundPatient, error: searchErr } = await supabase
        .from('patients')
        .select('id, full_name, phone')
        .ilike('phone', `%${last10}%`)
        .limit(1)
        .maybeSingle();

      if (searchErr) throw searchErr;
      existingPatient = foundPatient;

      // Eğer kayıtlı değilse yeni danışan/hasta oluştur
      if (!existingPatient) {
        const { data: newPat, error: createErr } = await supabase
          .from('patients')
          .insert([{
            full_name: form.full_name.trim(),
            phone: cleaned,
            total_sessions: 10,
            clinic_id: clinic?.id,
            complaint: form.notes || null,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (createErr) throw createErr;
        existingPatient = newPat;
      }

      // 2. Mola saati kontrolü
      const clinicSchedule = getClinicSchedule(clinic);
      if (isBreakSlot(slot.time, clinicSchedule)) {
        setError(`Seçtiğiniz saat ${sector.businessSingular.toLowerCase()}mizin mola / öğle arası vaktidir. Lütfen başka bir saat seçiniz.`);
        setSubmitting(false);
        return;
      }

      // 3. Geçmiş tarih ve saat kontrolü
      const slotDateTime = new Date(`${slot.date}T${slot.time}`);
      if (slotDateTime <= new Date()) {
        setError('Geçmiş bir tarih veya saat için randevu talebi oluşturulamaz.');
        setSubmitting(false);
        return;
      }

      // 4. Hastanın bekleyen taleplerini kontrol et
      const { data: existingRequests, error: reqSearchErr } = await supabase
        .from('session_requests')
        .select('id, requested_date, requested_time, status')
        .eq('patient_id', existingPatient.id)
        .eq('status', 'bekliyor');

      if (reqSearchErr) throw reqSearchErr;

      if (existingRequests && existingRequests.length >= 2) {
        setError(`Onay bekleyen 2 adet randevu talebiniz bulunmaktadır. ${sector.businessSingular}miz mevcut taleplerinizi değerlendirmeden yeni bir talep oluşturamazsınız.`);
        setSubmitting(false);
        return;
      }

      const slotConflict = existingRequests?.some(
        r => r.requested_date === slot.date && r.requested_time?.substring(0, 5) === slot.time?.substring(0, 5)
      );
      if (slotConflict) {
        setError(`Bu tarih ve saat (${slot.date} ${slot.time}) için zaten onay bekleyen bir randevu talebiniz bulunmaktadır.`);
        setSubmitting(false);
        return;
      }

      // 5. Randevu talebi oluştur (Hizmet yeri etiketi eklenerek)
      const locMeta = getSessionLocationMeta(locationType, clinic);
      const finalNotes = encodeSessionNotes(form.notes, locationType, locMeta?.label);
      const { error: reqErr } = await supabase
        .from('session_requests')
        .insert([{
          patient_id: existingPatient.id,
          treatment_id: form.treatment_id,
          therapist_id: form.therapist_id || (staff.length === 1 ? staff[0].id : null),
          requested_date: slot.date,
          requested_time: slot.time,
          notes: finalNotes || null,
          status: 'bekliyor',
        }]);

      if (reqErr) throw reqErr;

      onSuccess({
        ...form,
        location_type: locationType,
        full_name: existingPatient.full_name,
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

  const quickTags = sector.quickTags || [
    '🦴 Bel / Fıtık', '💆‍♂️ Boyun Ağrısı', '🦵 Diz & Menisküs', 
    '🏃 Omuz / Kol', '📐 Postür & Skolyoz', '✨ Genel Kontrol'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 z-10 animate-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] overflow-y-auto font-[Inter]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[12px] font-medium mb-2">
            <span>{formattedDate} • {slot.time}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Randevu Talebi Oluştur</h2>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Müsait seans saatine adınıza randevu talebi iletin.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-[12px] flex items-start gap-2.5 leading-relaxed">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Telefon Numarası */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              Cep Telefonu Numaranız <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                required
                placeholder="05XXXXXXXXX"
                value={form.phone}
                onChange={handlePhone}
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all font-mono"
              />
            </div>

            {/* Kayıtlı / Yeni Danışan Durum Bildirimi */}
            {checkingPhone ? (
              <p className="text-[11px] text-slate-400 mt-1.5">Numara kontrol ediliyor...</p>
            ) : checkedPatientName ? (
              <div className="mt-1.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center justify-between">
                <span>✓ Kayıtlı {sector.clientSingular}: <strong>{checkedPatientName}</strong></span>
              </div>
            ) : isNewPatient ? (
              <div className="mt-1.5 p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-[11px] flex items-center gap-1.5">
                <Sparkles size={13} className="text-blue-600 shrink-0" />
                <span>İlk randevunuz! Lütfen aşağıya adınızı ve soyadınızı giriniz.</span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1.5">
                Kayıtlı numaranızdan profiliniz otomatik tanınır.
              </p>
            )}
          </div>

          {/* Yeni Danışan / Hasta İse Ad Soyad Alanı */}
          {isNewPatient && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-150">
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                Adınız ve Soyadınız <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Örn: Ahmet Yılmaz"
                  value={form.full_name}
                  onChange={e => set('full_name', e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-blue-300 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all bg-blue-50/20"
                />
              </div>
            </div>
          )}

          {/* Tedavi / Hizmet / Ders Seçimi */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              {sector.serviceSingular} / Hizmet Seçin <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Stethoscope size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                required
                value={form.treatment_id}
                onChange={e => {
                  const newTrId = e.target.value;
                  const tr = treatments.find(t => t.id === newTrId);
                  const assignedIds = getTreatmentAssignedStaff(tr, clinic);
                  const newEligible = (assignedIds && assignedIds.length > 0)
                    ? staff.filter(s => assignedIds.includes(s.id))
                    : staff.filter(s => s.role === 'therapist' || s.role === 'admin');
                  let newThId = form.therapist_id;
                  if (newThId && !newEligible.some(s => s.id === newThId)) {
                    newThId = newEligible[0]?.id || '';
                  }
                  setForm(prev => ({ ...prev, treatment_id: newTrId, therapist_id: newThId }));
                }}
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all bg-white appearance-none cursor-pointer"
              >
                <option value="">Seçiniz...</option>
                {treatments.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.duration_minutes} dk) — {t.price} ₺
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Uzman / Eğitmen Tercihi */}
          {staff.length > 0 && (
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                {sector.staffSingular} {staff.length > 1 ? <span className="text-red-500">*</span> : '(İsteğe Bağlı)'}
              </label>
              <div className="relative">
                <UserCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  required={staff.length > 1}
                  value={form.therapist_id}
                  onChange={e => set('therapist_id', e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all bg-white appearance-none cursor-pointer"
                >
                  <option value="">{staff.length > 1 ? `${sector.staffSingular} seçiniz *` : `Fark Etmez / İlk Müsait ${sector.staffSingular}`}</option>
                  {(form.treatment_id ? (() => {
                    const tr = treatments.find(t => t.id === form.treatment_id);
                    const assignedIds = getTreatmentAssignedStaff(tr, clinic);
                    if (assignedIds && assignedIds.length > 0) {
                      const matched = staff.filter(s => assignedIds.includes(s.id));
                      return matched.length > 0 ? matched : staff.filter(s => s.role === 'therapist' || s.role === 'admin');
                    }
                    return staff.filter(s => s.role === 'therapist' || s.role === 'admin');
                  })() : staff.filter(s => s.role === 'therapist' || s.role === 'admin')).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.title || sector.staffTitle})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Hizmet Yeri Tercihi */}
          {availableLocations.length > 1 && (
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                Hizmet Yeri Tercihi
              </label>
              <div className={`grid gap-2 ${availableLocations.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
                {availableLocations.map((loc) => {
                  const isSelected = locationType === loc.id || locationType === loc.label;
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => setLocationType(loc.id)}
                      className={`h-10 px-3 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center text-[12px] font-semibold select-none ${
                        isSelected
                          ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate">{loc.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hızlı Şikayet / Konu / Hedef Seçimi */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              Hızlı {sector.complaintLabel} (Seçebilirsiniz)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {quickTags.map((tag) => {
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
                        ? 'bg-slate-900 border-slate-900 text-white font-bold shadow-2xs'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
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
                placeholder={`${sector.complaintLabel} veya eklemek istediğiniz notlar...`}
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 mt-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[14px] font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>İletiliyor...</span>
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
