import { CheckCircle, Calendar, Clock, Phone, User, ArrowLeft } from 'lucide-react';
import { getClinicSectorConfig, getMarketingSectorKey, SECTOR_PRESETS } from '../lib/sectorUtils';

export default function Success({ bookingInfo, onBack }) {
  const sector = bookingInfo?.clinic 
    ? getClinicSectorConfig(bookingInfo.clinic) 
    : (SECTOR_PRESETS[getMarketingSectorKey()] || SECTOR_PRESETS.fizyoterapi);

  const formatDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('tr-TR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
          {/* Top banner */}
          <div className="bg-slate-900 px-6 py-8 text-center text-white">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <CheckCircle size={36} />
            </div>
            <h1 className="text-[22px] font-black text-white mb-1">Randevu Talebiniz Alındı!</h1>
            <p className="text-slate-300 text-[13px]">
              {sector.businessSingular}imiz en kısa sürede sizinle iletişime geçecektir.
            </p>
          </div>

          {/* Booking details */}
          <div className="p-6 space-y-3">
            <h2 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-4">
              Talep Özeti
            </h2>

            {bookingInfo?.full_name && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                  <User size={14} className="text-emerald-700" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Ad Soyad</p>
                  <p className="text-[14px] font-bold text-gray-800">{bookingInfo.full_name}</p>
                </div>
              </div>
            )}

            {bookingInfo?.phone && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                  <Phone size={14} className="text-emerald-700" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Telefon</p>
                  <p className="text-[14px] font-bold text-gray-800">{bookingInfo.phone}</p>
                </div>
              </div>
            )}

            {bookingInfo?.slot?.date && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar size={14} className="text-emerald-700" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Tercih Ettiğiniz Tarih</p>
                  <p className="text-[14px] font-bold text-gray-800">{formatDate(bookingInfo.slot.date)}</p>
                </div>
              </div>
            )}

            {bookingInfo?.slot?.time && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                  <Clock size={14} className="text-emerald-700" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Tercih Ettiğiniz Saat</p>
                  <p className="text-[14px] font-bold text-gray-800">{bookingInfo.slot.time}</p>
                </div>
              </div>
            )}

            {bookingInfo?.location_type && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0 text-base">
                  {bookingInfo.location_type === 'evde' ? '🏠' : bookingInfo.location_type === 'uzaktan' ? '💻' : '🏥'}
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Hizmet Yeri Tercihi</p>
                  <p className="text-[14px] font-bold text-gray-800">
                    {bookingInfo.location_type === 'evde' ? 'Evde Ziyaret / Hizmet' :
                     bookingInfo.location_type === 'uzaktan' ? 'Uzaktan / Online Danışmanlık' : `${sector.businessSingular}de Hizmet`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="mx-6 mb-6 bg-amber-50 border border-amber-200/80 rounded-2xl px-4 py-3">
            <p className="text-[12px] text-amber-800 leading-relaxed font-medium">
              ⏳ Randevu talebiniz {sector.businessSingular.toLowerCase()}imiz tarafından incelendikten sonra onaylanacak ve telefonunuza bilgilendirme iletilecektir.
            </p>
          </div>

          {/* Back button */}
          <div className="px-6 pb-6">
            <button
              onClick={onBack}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[13px] font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>Ana Sayfaya Dön</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
