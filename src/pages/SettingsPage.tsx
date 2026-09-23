import { useEffect, useState } from 'react';
import { CalendarDays, Percent, Save } from 'lucide-react';
import { StorageService } from '../storage/storage';
import type { CostSettings, DefaultCourtsByWeekday } from '../models/types';

const empty: CostSettings = {
  courtFeePerHour: 130000,
  courtFeeFixedPerHour: 130000,
  courtFeeCasualPerHour: 180000,
  shuttleFee: 28000,
  splitMethod: 'EQUAL',
  femaleDiscountPercent: 10,
  defaultCourtsByWeekday: {},
};

/** UI order Mon→Sun; value = Date.getDay() */
const WEEKDAYS: { key: keyof DefaultCourtsByWeekday; label: string }[] = [
  { key: '1', label: 'Thứ 2' },
  { key: '2', label: 'Thứ 3' },
  { key: '3', label: 'Thứ 4' },
  { key: '4', label: 'Thứ 5' },
  { key: '5', label: 'Thứ 6' },
  { key: '6', label: 'Thứ 7' },
  { key: '0', label: 'Chủ Nhật' },
];

import { useSession } from '../hooks/useSession';

export default function SettingsPage() {
  const { currentSession, updateSession } = useSession();
  const [settings, setSettings] = useState<CostSettings>(empty);
  const [activeDay, setActiveDay] = useState<keyof DefaultCourtsByWeekday>('1');

  useEffect(() => setSettings(StorageService.getSettings()), []);



  const update = (key: keyof CostSettings, value: number | CostSettings['splitMethod']) =>
    setSettings(s => {
      const next = { ...s, [key]: value };
      if (key === 'courtFeeFixedPerHour' && typeof value === 'number') {
        next.courtFeePerHour = value;
      }
      return next;
    });

  const dayCourts = settings.defaultCourtsByWeekday?.[activeDay] ?? [];

  const toggleCourtForDay = (court: number) => {
    setSettings(s => {
      const map = { ...(s.defaultCourtsByWeekday ?? {}) };
      const current = map[activeDay] ?? [];
      const next = current.includes(court)
        ? current.filter(c => c !== court)
        : [...current, court].sort((a, b) => a - b);
      if (next.length) map[activeDay] = next;
      else delete map[activeDay];
      return { ...s, defaultCourtsByWeekday: map };
    });
  };

  return (
    <div className="pb-20 space-y-5">
      <h2 className="text-xl font-extrabold uppercase">THIẾT LẬP CÀI ĐẶT</h2>

      <section className="bg-white rounded-2xl p-5 border border-teal-50 shadow-sm space-y-4">

        <NumberField
          label="Giá thuê sân cố định / Giờ (VND)"
          value={settings.courtFeeFixedPerHour}
          onChange={v => update('courtFeeFixedPerHour', v)}
        />
        <NumberField
          label="Giá thuê sân vãng lai / Giờ (VND)"
          value={settings.courtFeeCasualPerHour}
          onChange={v => update('courtFeeCasualPerHour', v)}
        />
        <NumberField
          label="Đơn giá cầu / quả (VND)"
          value={settings.shuttleFee}
          onChange={v => update('shuttleFee', v)}
        />
        <label className="block text-sm font-bold">
          Cách chia tiền
          <select
            value={settings.splitMethod}
            onChange={e => update('splitMethod', e.target.value as CostSettings['splitMethod'])}
            className="mt-1.5 w-full rounded-xl border border-teal-100 p-3"
          >
            <option value="EQUAL">Chia đều</option>
            <option value="BY_MATCHES">Theo số trận</option>
          </select>
        </label>
      </section>

      <section className="bg-white rounded-2xl p-5 border border-teal-50 shadow-sm space-y-4">
        <h3 className="font-extrabold flex items-center gap-2">
          <CalendarDays size={18} className="text-primary" />
          SÂN THUÊ CỐ ĐỊNH
        </h3>
        <p className="text-sm text-gray-500">
          Khi tạo buổi chơi, hệ thống sẽ chọn sẵn các sân đã cấu hình cho ngày tương ứng.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {WEEKDAYS.map(d => {
            const count = settings.defaultCourtsByWeekday?.[d.key]?.length ?? 0;
            const active = activeDay === d.key;
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => setActiveDay(d.key)}
                className={`rounded-xl px-2.5 py-1.5 text-xs font-extrabold ${
                  active ? 'bg-primary text-white' : 'border border-teal-100 text-gray-600'
                }`}
              >
                {d.label}
                {count > 0 && (
                  <span className={`ml-1 ${active ? 'text-teal-100' : 'text-primary'}`}>
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 16 }, (_, i) => i + 1).map(c => (
            <button
              key={c}
              type="button"
              onClick={() => toggleCourtForDay(c)}
              className={`rounded-xl py-3 text-2xl font-black transition-colors border ${
                dayCourts.includes(c) ? 'bg-primary border-primary text-white' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {dayCourts.length === 0 && (
          <p className="text-xs text-gray-400">
            Chưa chọn sân cho ngày này — khi tạo buổi sẽ dùng mặc định Sân 1–3.
          </p>
        )}
      </section>

      <section className="bg-white rounded-2xl p-5 border border-teal-50 shadow-sm">
        <h3 className="font-extrabold flex gap-2 items-center">
          <Percent size={18} className="text-primary" />
          ƯU ĐÃI CẦU THỦ NỮ
        </h3>
        <p className="text-sm text-gray-500 mt-1">Tiền phải trả của nữ thấp hơn nam theo tỷ lệ này.</p>
        <div className="flex items-center gap-3 mt-4">
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={settings.femaleDiscountPercent}
            onChange={e => update('femaleDiscountPercent', Number(e.target.value))}
            className="accent-primary flex-1"
          />
          <b className="text-primary w-12 text-right">{settings.femaleDiscountPercent}%</b>
        </div>
      </section>

      <button
        onClick={() => {
          StorageService.saveSettings(settings);
          if (currentSession && !currentSession.isFinalized) {
            updateSession({ ...currentSession, costs: settings });
          }
          alert('Đã lưu cài đặt!');
        }}
        className="w-full bg-primary text-white py-4 rounded-2xl font-extrabold flex justify-center gap-2"
      >
        <Save size={18} />
        LƯU CÀI ĐẶT
      </button>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-sm font-bold">
      {label}
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value) || 0)}
        className="mt-1.5 w-full rounded-xl border border-teal-100 p-3 outline-none focus:ring-2 focus:ring-primary"
      />
    </label>
  );
}
