import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// 1 saatlik aralıklar — 08:00'den 20:00'ye
const HOURS = [
  '08:00','09:00','10:00','11:00','12:00','13:00',
  '14:00','15:00','16:00','17:00','18:00','19:00','20:00',
];

function getWeekDays(startDate) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateStr(d) {
  return d.toISOString().split('T')[0];
}

// Saat string'ini normalize et: "09:00:00" → "09:00"
function normalizeTime(t) {
  return (t || '').slice(0, 5);
}

const DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

// Slot durumu:
// 'past'     → geçmiş saat (gri, pasif)
// 'booked'   → onaylanmış seans veya onaylanmış talep (kırmızı, tıklanamaz)
// 'pending'  → bekleyen talep (turuncu, tıklanamaz)
// 'free'     → müsait (yeşil, tıklanabilir)

function getSlotStatus(date, hour, bookedSet, pendingSet, pastFn) {
  if (pastFn(date, hour)) return 'past';
  const key = `${date}|${hour}`;
  if (bookedSet.has(key)) return 'booked';
  if (pendingSet.has(key)) return 'pending';
  return 'free';
}

const STATUS_STYLES = {
  past: {
    cell: 'bg-gray-50 text-gray-300 cursor-default border border-gray-100',
    label: '',
    icon: '',
  },
  booked: {
    cell: 'bg-red-100 text-red-400 cursor-not-allowed border border-red-200',
    label: 'Dolu',
    icon: '✕',
  },
  pending: {
    cell: 'bg-orange-100 text-orange-500 cursor-not-allowed border border-orange-200',
    label: 'Talep Var',
    icon: '⏳',
  },
  free: {
    cell: 'bg-emerald-50 text-emerald-600 cursor-pointer border border-emerald-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-200 active:scale-95',
    label: 'Müsait',
    icon: '+',
  },
};

export default function WeekCalendar({ sessions, sessionRequests, onSlotClick }) {
  const [weekStart, setWeekStart] = useState(() => getMondayOfWeek(new Date()));

  const days = getWeekDays(weekStart);
  const today = toDateStr(new Date());

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const goToday = () => setWeekStart(getMondayOfWeek(new Date()));

  // Onaylı/aktif seanslar → kırmızı
  // Onaylı session_requests → kırmızı
  const bookedSet = new Set([
    ...sessions.map(s => `${s.session_date}|${normalizeTime(s.session_time)}`),
    ...(sessionRequests || [])
      .filter(r => r.status === 'onaylandi')
      .map(r => `${r.requested_date}|${normalizeTime(r.requested_time)}`),
  ]);

  // Bekleyen (henüz onaylanmamış) session_requests → turuncu
  const pendingSet = new Set(
    (sessionRequests || [])
      .filter(r => r.status === 'bekliyor')
      .map(r => `${r.requested_date}|${normalizeTime(r.requested_time)}`)
  );

  const isPast = (date, time) => {
    const now = new Date();
    const slotDt = new Date(`${date}T${time}:00`);
    return slotDt <= now;
  };

  // Week title
  const weekEnd = days[6];
  const title = weekStart.getMonth() === weekEnd.getMonth()
    ? `${MONTHS[weekStart.getMonth()]} ${weekStart.getFullYear()}`
    : `${MONTHS[weekStart.getMonth()]} – ${MONTHS[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">{title}</h2>
          <p className="text-[12px] text-gray-400 mt-0.5">
            {days[0].getDate()} – {days[6].getDate()} arası hafta
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="h-8 px-3 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Bugün
          </button>
          <button
            onClick={prevWeek}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={nextWeek}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 px-5 py-3 bg-gray-50/30 border-b border-gray-100 text-[11px] text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[9px] text-emerald-600 font-bold">+</div>
          <span className="font-medium text-emerald-700">Müsait — Tıkla, randevu al</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-orange-100 border border-orange-200 flex items-center justify-center text-[9px] text-orange-500">⏳</div>
          <span>Talep var (onay bekliyor)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-red-100 border border-red-200 flex items-center justify-center text-[9px] text-red-400 font-bold">✕</div>
          <span>Dolu (onaylanmış)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200" />
          <span>Geçmiş</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Day headers */}
          <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: '64px repeat(7, 1fr)' }}>
            <div className="py-3" />
            {days.map((day, i) => {
              const dateStr = toDateStr(day);
              const isToday = dateStr === today;
              return (
                <div key={i} className={`py-3 text-center border-l border-gray-100 ${isToday ? 'bg-teal-50' : ''}`}>
                  <p className={`text-[11px] font-semibold uppercase tracking-wide ${isToday ? 'text-teal-600' : 'text-gray-400'}`}>
                    {DAY_NAMES[i]}
                  </p>
                  <p className={`text-[18px] font-bold mt-0.5 ${isToday ? 'text-teal-700' : 'text-gray-800'}`}>
                    {day.getDate()}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Slots */}
          <div>
            {HOURS.map(hour => (
              <div
                key={hour}
                className="grid border-b border-gray-50"
                style={{ gridTemplateColumns: '64px repeat(7, 1fr)' }}
              >
                {/* Time label */}
                <div className="flex items-center justify-center py-1.5 bg-gray-50/40 border-r border-gray-100">
                  <span className="text-[12px] font-semibold text-gray-500">{hour}</span>
                </div>

                {/* Cells */}
                {days.map((day, i) => {
                  const dateStr = toDateStr(day);
                  const status = getSlotStatus(dateStr, hour, bookedSet, pendingSet, isPast);
                  const style = STATUS_STYLES[status];
                  const isToday = dateStr === today;

                  const titleMap = {
                    past: 'Geçmiş saat',
                    booked: 'Bu saat dolu — başka bir saat seçin',
                    pending: 'Bu saatte onay bekleyen talep var',
                    free: `${dateStr} — ${hour} için randevu talep et`,
                  };

                  return (
                    <div
                      key={i}
                      className={`mx-1 my-1 rounded-xl flex flex-col items-center justify-center transition-all duration-150 select-none ${style.cell} ${isToday && status === 'free' ? 'ring-2 ring-teal-300' : ''}`}
                      style={{ minHeight: '52px' }}
                      onClick={() => {
                        if (status === 'free') {
                          onSlotClick({ date: dateStr, time: hour });
                        }
                      }}
                      title={titleMap[status]}
                    >
                      {status !== 'past' && (
                        <>
                          <span className="text-[14px] leading-none">{style.icon}</span>
                          <span className="text-[9px] mt-0.5 font-medium opacity-80">{style.label}</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
