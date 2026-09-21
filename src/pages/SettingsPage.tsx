import { useEffect, useState } from 'react';
import { Percent, Save, SlidersHorizontal } from 'lucide-react';
import { StorageService } from '../storage/storage';
import type { CostSettings } from '../models/types';

const empty: CostSettings = {
  courtFeePerHour: 130000,
  courtFeeFixedPerHour: 130000,
  courtFeeCasualPerHour: 180000,
  shuttleFee: 28000,
  splitMethod: 'EQUAL',
  femaleDiscountPercent: 10,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<CostSettings>(empty);
  useEffect(() => setSettings(StorageService.getSettings()), []);

  const update = (key: keyof CostSettings, value: number | CostSettings['splitMethod']) =>
    setSettings(s => {
      const next = { ...s, [key]: value };
      if (key === 'courtFeeFixedPerHour' && typeof value === 'number') {
        next.courtFeePerHour = value;
      }
      return next;
    });

  return (
    <div className="pb-20 space-y-5">
      <h2 className="text-xl font-extrabold uppercase">THIẾT LẬP CÀI ĐẶT</h2>

      <section className="bg-white rounded-2xl p-5 border border-teal-50 shadow-sm space-y-4">
        <h3 className="font-extrabold flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-primary" />
          CHI PHÍ MẶC ĐỊNH
        </h3>
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

      <section className="bg-white rounded-2xl p-5 border border-teal-50 shadow-sm">
        <h3 className="font-extrabold flex gap-2 items-center">
          <Percent size={18} className="text-primary" />% ƯU ĐÃI CẦU THỦ NỮ
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
