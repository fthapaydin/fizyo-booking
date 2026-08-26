import { CheckCircle, Calendar, Clock, Phone, User, ArrowLeft } from 'lucide-react';

export default function Success({ bookingInfo, onBack }) {
  const formatDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('tr-TR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Top green bar */}
          <div className="bg-gradient-to-r from-teal-600 to-emerald-500 px-6 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={36} className="text-white" />
            </div>
            <h1 className="text-[22px] font-bold text-white mb-1">Talebiniz Alındı!</h1>
            <p className="text-teal-100 text-[13px]">Kliniğimiz en kısa sürede sizinle iletişime geçecektir.</p>
          </div>

          {/* Booking details */}
          <div className="p-6 space-y-3">
            <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-4">Talep Özeti</h2>

            {bookingInfo?.full_name && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
                  <User size={14} className="text-teal-600" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Ad Soyad</p>
                  <p className="text-[14px] font-semibold text-gray-800">{bookingInfo.full_name}</p>
                </div>
              </div>
            )}

            {bookingInfo?.phone && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
                  <Phone size={14} className="text-teal-600" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Telefon</p>
                  <p className="text-[14px] font-semibold text-gray-800">{bookingInfo.phone}</p>
                </div>
              </div>
            )}

            {bookingInfo?.slot?.date && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar size={14} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Tercih Ettiğiniz Tarih</p>
                  <p className="text-[14px] font-semibold text-gray-800">{formatDate(bookingInfo.slot.date)}</p>
                </div>
              </div>
            )}

            {bookingInfo?.slot?.time && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                  <Clock size={14} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Tercih Ettiğiniz Saat</p>
                  <p className="text-[14px] font-semibold text-gray-800">{bookingInfo.slot.time}</p>
                </div>
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="mx-6 mb-6 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
            <p className="text-[12px] text-amber-700 leading-relaxed">
              ⏳ Randevu talebiniz kliniğimiz tarafından incelendikten sonra onaylanacak ve sizinle iletişime geçilecektir.
            </p>
          </div>

          {/* Back button */}
          <div className="px-6 pb-6">
            <button
              onClick={onBack}
              className="w-full h-11 flex items-center justify-center gap-2 border border-gray-200 rounded-xl text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={15} /> Yeni Randevu Talebi
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-5">
          Fizyoterapi Kliniği — Online Randevu Sistemi
        </p>
      </div>
    </div>
  );
}
