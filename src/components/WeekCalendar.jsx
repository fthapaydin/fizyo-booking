import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { getClinicSchedule, isBreakSlot, isDayWorkingHour, getDynamicHours } from '../lib/scheduleUtils';


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
  const local = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
  return local.toISOString().split('T')[0];
}

function normalizeTime(t) {
  return (t || '').slice(0, 5);
}

const DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

function getSlotStatus(date, hour, dayKey, bookedSet, pendingSet, pastFn, schedule) {
  if (isBreakSlot(hour, schedule)) return 'break';
  if (!isDayWorkingHour(dayKey, hour, schedule)) return 'closed';
  if (pastFn(date, hour)) return 'past';
  const key = `${date}|${hour}`;
  if (bookedSet.has(key)) return 'booked';
  if (pendingSet.has(key)) return 'pending';
  return 'free';
}

export default function WeekCalendar({ sessions = [], sessionRequests = [], onSlotClick, clinic }) {
  const [weekStart, setWeekStart] = useState(() => getMondayOfWeek(new Date()));

  const clinicSchedule = useMemo(() => getClinicSchedule(clinic), [clinic]);
  const hours = useMemo(() => getDynamicHours(clinicSchedule), [clinicSchedule]);
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

  const bookedSet = new Set([
    ...sessions.map(s => `${s.session_date}|${normalizeTime(s.session_time)}`),
    ...(sessionRequests || [])
      .filter(r => r.status === 'onaylandi')
      .map(r => `${r.requested_date}|${normalizeTime(r.requested_time)}`),
  ]);

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

  const weekEnd = days[6];
  const title = weekStart.getMonth() === weekEnd.getMonth()
    ? `${MONTHS[weekStart.getMonth()]} ${weekStart.getFullYear()}`
    : `${MONTHS[weekStart.getMonth()]} – ${MONTHS[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
            Seans Takvimi
          </span>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            {title}
          </h3>
        </div>
        
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <button
            onClick={goToday}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-[12px] font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            Bugün
          </button>
          <div className="flex items-center rounded-xl border border-slate-200 p-0.5 bg-slate-50 shadow-2xs">
            <button
              onClick={prevWeek}
              className="w-8 h-8 rounded-lg hover:bg-white text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Önceki Hafta"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <button
              onClick={nextWeek}
              className="w-8 h-8 rounded-lg hover:bg-white text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Sonraki Hafta"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3 bg-slate-50/70 border-b border-slate-200 text-[12px] text-slate-600 font-medium">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs"></div>
          <span className="text-slate-800 font-semibold">Müsait</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400 shadow-xs"></div>
          <span>Onay Bekliyor</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-300 shadow-xs"></div>
          <span>Dolu</span>
        </div>
        <div className="flex items-center gap-2 ml-auto text-slate-400 text-[11px]">
          <Info size={14} />
          <span>Randevu almak için yeşil kutulara tıklayın</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Day headers */}
          <div className="grid grid-cols-[70px_repeat(7,1fr)] border-b border-slate-200">
            <div className="bg-slate-50/50"></div>
            {days.map((day, i) => {
              const isToday = toDateStr(day) === today;
              return (
                <div key={i} className={`py-3.5 text-center border-l border-slate-200 flex flex-col items-center justify-center ${isToday ? 'bg-slate-50' : 'bg-white'}`}>
                  <span className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isToday ? 'text-slate-900 font-black' : 'text-slate-400'}`}>
                    {DAY_NAMES[i]}
                  </span>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full text-[15px] font-bold ${isToday ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-800'}`}>
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slots */}
          <div className="bg-slate-50/20">
            {hours.map(hour => (
              <div
                key={hour}
                className="grid grid-cols-[70px_repeat(7,1fr)] border-b border-slate-200 last:border-0"
              >
                {/* Time label */}
                <div className="flex items-center justify-center py-3 bg-white border-r border-slate-200">
                  <span className="text-[12px] font-bold text-slate-400 font-mono">{hour}</span>
                </div>

                {/* Cells */}
                {days.map((day, i) => {
                  const dateStr = toDateStr(day);
                  const status = getSlotStatus(dateStr, hour, DAY_NAMES[i], bookedSet, pendingSet, isPast, clinicSchedule);
                  const isToday = dateStr === today;
                  
                  let cellClass = "relative border-r-2 border-gray-300 last:border-r-0 transition-all duration-200 h-[46px] group";
                  let content = null;

                  if (status === 'past') {
                    cellClass += " bg-gray-50/80";
                  } else if (status === 'booked') {
                    cellClass += " bg-rose-50";
                    content = <div className="absolute inset-1 rounded-md border border-rose-100 flex items-center justify-center"><span className="text-[11px] font-bold text-rose-400 uppercase tracking-wide">Dolu</span></div>;
                  } else if (status === 'pending') {
                    cellClass += " bg-orange-50";
                    content = <div className="absolute inset-1 rounded-md border border-orange-100 flex items-center justify-center"><span className="text-[11px] font-bold text-orange-400 uppercase tracking-wide">Talep</span></div>;
                  } else if (status === 'break') {
                    // Mola saatinde kullanıcıya mola yazısı gösterilmez, sadece seçilemez kilitli alan kalır
                    cellClass += " bg-gray-100/50 cursor-not-allowed";
                    content = null;
                  } else if (status === 'closed') {
                    cellClass += " bg-gray-100/60 cursor-not-allowed";
                    content = (
                      <div className="absolute inset-1 rounded-md flex items-center justify-center select-none">
                        <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">KAPALI</span>
                      </div>
                    );
                  } else if (status === 'free') {
                    cellClass += ` cursor-pointer ${isToday ? 'bg-emerald-50' : ''}`;
                    content = (
                      <div className="absolute inset-[1.5px] rounded-md border-[1.5px] border-emerald-600 bg-emerald-500 group-hover:bg-emerald-600 transition-all flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:shadow-emerald-500/40 z-10">
                        <span className="text-white text-[10px] font-bold tracking-wide group-hover:hidden">MÜSAİT</span>
                        <span className="text-white text-[11px] font-bold tracking-wider hidden group-hover:block">+ RANDEVU</span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={i}
                      className={cellClass}
                      onClick={() => status === 'free' && onSlotClick({ date: dateStr, time: hour })}
                    >
                      {content}
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
