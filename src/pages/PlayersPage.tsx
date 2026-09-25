import { useState } from 'react';
import { usePlayers } from '../hooks/usePlayers';
import type { Gender, SkillLevel, MemberType, Player } from '../models/types';
import { Pencil, ShieldCheck, Trash2, UserPlus, X } from 'lucide-react';
import GenderAvatar from '../components/GenderAvatar';

const skillLabel = (s: SkillLevel | string) => {
  if (s === 'Y') return 'Yếu';
  if (s === 'TBY') return 'TB Yếu';
  if (s === 'TB') return 'Trung Bình';
  if (s === 'K') return 'Khá';
  return s;
};

export default function PlayersPage() {
  const { players, loading, addPlayer, updatePlayer, removePlayer } = usePlayers();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('MALE');
  const [skill, setSkill] = useState<SkillLevel>('TBY');
  const [memberType, setMemberType] = useState<MemberType>('VÃNG LAI');

  const resetNewMemberDefaults = () => {
    setEditingId(null);
    setName('');
    setGender('MALE');
    setSkill('TBY');
    setMemberType('VÃNG LAI');
  };
  const closeForm = () => {
    setShowForm(false);
    resetNewMemberDefaults();
  };
  const openEdit = (p: Player) => {
    setEditingId(p.id);
    setName(p.name);
    setGender(p.gender);
    setSkill(p.skillLevel);
    setMemberType(p.memberType);
    setShowForm(true);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (editingId) {
        await updatePlayer(editingId, { name: name.trim(), gender, skillLevel: skill, memberType });
      } else {
        await addPlayer({ name: name.trim(), gender, skillLevel: skill, memberType, active: true });
      }
      closeForm();
    } catch (err) {
      alert('Đã xảy ra lỗi khi lưu thông tin.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải danh sách...</div>;
  }

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-extrabold uppercase text-gray-800">DANH SÁCH THÀNH VIÊN</h2>
        </div>
        <button
          onClick={() => {
            resetNewMemberDefaults();
            setShowForm(true);
          }}
          aria-label="Thêm thành viên"
          className="bg-primary text-white p-3 rounded-full shadow-md"
        >
          <UserPlus size={21} />
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-950/45 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-teal-50">
              <h3 className="font-extrabold text-lg uppercase">
                {editingId ? 'CHỈNH SỬA THÀNH VIÊN' : 'THÊM THÀNH VIÊN'}
              </h3>
              <button onClick={closeForm} className="text-gray-500 p-1">
                <X />
              </button>
            </div>
            <form onSubmit={submit} className="p-5 space-y-4">
              <label className="block text-sm font-bold text-gray-700">
                Tên
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-teal-100 p-3 outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nhập tên người chơi"
                  autoFocus
                  required
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-bold text-gray-700">
                  Giới tính
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as Gender)}
                    className="mt-1.5 w-full rounded-xl border border-teal-100 p-3"
                  >
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                  </select>
                </label>
                <label className="text-sm font-bold text-gray-700">
                  Trình độ
                  <select
                    value={skill}
                    onChange={e => setSkill(e.target.value as SkillLevel)}
                    className="mt-1.5 w-full rounded-xl border border-teal-100 p-3"
                  >
                    <option value="Y">Yếu</option>
                    <option value="TBY">Trung bình yếu</option>
                    <option value="TB">Trung bình</option>
                    <option value="K">Khá</option>
                  </select>
                </label>
              </div>
              <label className="block text-sm font-bold text-gray-700">
                Loại thành viên
                <select
                  value={memberType}
                  onChange={e => setMemberType(e.target.value as MemberType)}
                  className="mt-1.5 w-full rounded-xl border border-teal-100 p-3"
                >
                  <option value="CỐ ĐỊNH">Cố định</option>
                  <option value="VÃNG LAI">Vãng lai</option>
                </select>
              </label>
              <button className="w-full bg-primary text-white py-3 rounded-xl font-extrabold uppercase">
                {editingId ? 'LƯU THAY ĐỔI' : 'THÊM THÀNH VIÊN'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {players.map(p => {
          return (
            <div
              key={p.id}
              className="bg-white p-3.5 rounded-2xl shadow-sm border border-teal-50 flex justify-between items-center"
            >
              <div className="flex items-center gap-3 min-w-0">
                <GenderAvatar gender={p.gender} size={44} />
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-800 truncate">{p.name}</h4>
                  <div className="flex flex-wrap gap-1.5 mt-1 text-[11px] font-bold">
                    <span className="rounded-full bg-teal-50 text-primary px-2 py-0.5">{skillLabel(p.skillLevel)}</span>
                    <span className="rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 flex gap-1 items-center">
                      <ShieldCheck size={12} />
                      {p.memberType === 'CỐ ĐỊNH' ? 'Cố định' : 'Vãng lai'}
                    </span>
                    <span className="rounded-full bg-gray-100 text-gray-600 px-2 py-0.5">{(p as any).careerMatches || 0}C</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-shrink-0">
                <button onClick={() => openEdit(p)} aria-label={`Chỉnh sửa ${p.name}`} className="text-primary p-2">
                  <Pencil size={18} />
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm(`Bạn có chắc chắn muốn xoá thành viên "${p.name}"? Hành động này không thể hoàn tác.`)) {
                      try { await removePlayer(p.id); } catch (err) { alert('Lỗi khi xoá.'); }
                    }
                  }}
                  aria-label={`Xoá ${p.name}`}
                  className="text-red-400 p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
        {players.length === 0 && (
          <div className="text-center text-gray-500 py-10 bg-white rounded-2xl">Chưa có thành viên nào.</div>
        )}
      </div>
    </div>
  );
}
