import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HOURS = [
  '08:00','08:30','09:00','09:30','10:00','10:30',
  '11:00','11:30','12:00','12:30','13:00','13:30',
  '14:00','14:30','15:00','15:30','16:00','16:30',
  '17:00','17:30','18:00','18:30','19:00','19:30',
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

const DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

export default function WeekCalendar({ sessions, onSlotClick }) {
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

  // Build a set of booked slots: "date|HH:MM"
  const bookedSet = new Set(
    sessions.map(s => `${s.session_date}|${(s.session_time || '').slice(0, 5)}`)
  );

  const isBooked = (date, time) => bookedSet.has(`${date}|${time}`);

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
      <div className="flex items-center gap-4 px-5 py-3 bg-gray-50/30 border-b border-gray-100 text-[11px] text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-300" />
          <span>Müsait</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gray-200 border border-gray-300" />
          <span>Dolu</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200 opacity-60" />
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
          <div className="max-h-[520px] overflow-y-auto">
            {HOURS.map(hour => (
              <div
                key={hour}
                className="grid border-b border-gray-50 hover:bg-gray-50/40 transition-colors"
                style={{ gridTemplateColumns: '64px repeat(7, 1fr)' }}
              >
                {/* Time label */}
                <div className="flex items-center justify-center py-2">
                  <span className="text-[11px] font-medium text-gray-400">{hour}</span>
                </div>

                {/* Cells */}
                {days.map((day, i) => {
                  const dateStr = toDateStr(day);
                  const booked = isBooked(dateStr, hour);
                  const past = isPast(dateStr, hour);
                  const isToday = dateStr === today;

                  let cellClass = 'border-l border-gray-100 mx-0.5 my-0.5 rounded-lg flex items-center justify-center text-[11px] font-medium transition-all ';

                  if (past) {
                    cellClass += 'bg-gray-50 text-gray-300 cursor-default';
                  } else if (booked) {
                    cellClass += 'bg-gray-200/70 text-gray-400 cursor-not-allowed';
                  } else {
                    cellClass += 'bg-emerald-50 text-emerald-600 cursor-pointer hover:bg-emerald-500 hover:text-white hover:shadow-md hover:shadow-emerald-200 active:scale-95';
                    if (isToday) cellClass += ' ring-1 ring-teal-200';
                  }

                  return (
                    <div
                      key={i}
                      className={cellClass}
                      style={{ minHeight: '40px' }}
                      onClick={() => {
                        if (!booked && !past) {
                          onSlotClick({ date: dateStr, time: hour });
                        }
                      }}
                      title={booked ? 'Bu saat dolu' : past ? 'Geçmiş saat' : `${dateStr} ${hour} için randevu al`}
                    >
                      {booked && (
                        <span className="text-[10px] text-gray-400">●</span>
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
