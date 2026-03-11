import React, { useEffect, useState } from 'react';
import { DispatcherLayout } from '../../components/DispatcherLayout';
import { api } from '../../api/client';

interface SimpleRoute {
  MaLoTrinh: number;
  LoTrinhDuKien: string | null;
  ThoiGianBatDau: string;
  TrangThaiLoTrinh: string;
}

export const AdjustRoutePage: React.FC = () => {
  const [routes, setRoutes] = useState<SimpleRoute[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true);
      try {
        const res = await api.get<SimpleRoute[]>('/routes');
        setRoutes(res.data);
        if (res.data.length > 0) {
          setSelectedId(res.data[0].MaLoTrinh);
          setNote(res.data[0].LoTrinhDuKien || '');
        }
      } catch (e) {
        setError('Không tải được danh sách lộ trình');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const current = routes.find((r) => r.MaLoTrinh === selectedId) || null;

  const handleSave = async () => {
    if (!current) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await api.put(`/routes/${current.MaLoTrinh}`, {
        LoTrinhDuKien: note,
        TrangThaiLoTrinh: current.TrangThaiLoTrinh
      });
      setMessage('Đã lưu điều chỉnh lộ trình');
      setRoutes((prev) =>
        prev.map((r) => (r.MaLoTrinh === res.data.MaLoTrinh ? res.data : r))
      );
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Lỗi khi lưu điều chỉnh');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DispatcherLayout activeSubTab="adjust">
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Điều chỉnh lộ trình</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: 16,
          alignItems: 'flex-start'
        }}
      >
        {/* Danh sách lộ trình cần điều chỉnh */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 10,
            border: '1px solid #E5E7EB',
            padding: 16,
            minHeight: 380
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Danh sách lộ trình</div>
          {loading ? (
            <div>Đang tải...</div>
          ) : routes.length === 0 ? (
            <div>Chưa có lộ trình nào.</div>
          ) : (
            routes.map((r) => (
              <div
                key={r.MaLoTrinh}
                onClick={() => {
                  setSelectedId(r.MaLoTrinh);
                  setNote(r.LoTrinhDuKien || '');
                }}
                style={{
                  borderRadius: 12,
                  border:
                    selectedId === r.MaLoTrinh ? '2px solid #2563EB' : '1px solid #E5E7EB',
                  padding: 16,
                  marginBottom: 12,
                  cursor: 'pointer',
                  background: selectedId === r.MaLoTrinh ? '#EFF6FF' : '#FFFFFF',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>LT{String(r.MaLoTrinh).padStart(3, '0')}</div>
                    <div style={{ padding: '4px 8px', borderRadius: 4, background: r.TrangThaiLoTrinh === 'Đang thực hiện' ? '#DBEAFE' : '#F3F4F6', color: r.TrangThaiLoTrinh === 'Đang thực hiện' ? '#1E40AF' : '#4B5563', fontSize: 12, fontWeight: 500 }}>
                        {r.TrangThaiLoTrinh}
                    </div>
                </div>
                <div style={{ fontSize: 13, color: '#475569', marginBottom: 4 }}>
                    Xe: <span style={{ color: '#111827' }}>51C-11111</span>
                </div>
                <div style={{ fontSize: 13, color: '#475569', marginBottom: 4 }}>
                    Tài xế: <span style={{ color: '#111827' }}>Lê Thanh Nam</span>
                </div>
                <div style={{ fontSize: 13, color: '#475569', marginBottom: 4 }}>
                    Thời gian: <span style={{ color: '#111827' }}>{r.ThoiGianBatDau ? new Date(r.ThoiGianBatDau).toLocaleString('vi-VN') : '06:00:00 17/1/2026'}</span>
                </div>
                <div style={{ fontSize: 13, color: '#475569' }}>
                    Hành khách: <span style={{ color: '#111827' }}>1</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Form điều chỉnh */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 10,
            border: '1px solid #E5E7EB',
            padding: 16
          }}
        >
          {current ? (
            <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #E5E7EB' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>
                    Chi tiết lộ trình: LT{String(current.MaLoTrinh).padStart(3, '0')}
                </h3>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Xe trung chuyển</div>
                <input
                    defaultValue="51B-67890 (Sức chứa: 4 ghế)"
                    style={{
                        width: '100%',
                        height: 42,
                        borderRadius: 8,
                        border: '1px solid #CBD5E1',
                        padding: '0 12px',
                        fontSize: 14,
                        color: '#111827',
                        outline: 'none'
                    }}
                />
            </div>

            <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Tài xế</div>
                <input
                    defaultValue="Nguyễn Minh Tuấn - 0901234567 (Rảnh)"
                    style={{
                        width: '100%',
                        height: 42,
                        borderRadius: 8,
                        border: '1px solid #CBD5E1',
                        padding: '0 12px',
                        fontSize: 14,
                        color: '#111827',
                        outline: 'none'
                    }}
                />
            </div>

            <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Thời gian bắt đầu</div>
                <div style={{ position: 'relative' }}>
                    <input type="datetime-local" defaultValue="2026-01-16T11:00" style={{ width: '100%', height: 42, padding: '0 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 14, color: '#111827', outline: 'none' }} />
                </div>
            </div>

            <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Lộ trình dự kiến</div>
                <input
                    defaultValue="Q5 → Q1 → Nhà xe Phương Trang"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    style={{
                        width: '100%',
                        height: 42,
                        borderRadius: 8,
                        border: '1px solid #CBD5E1',
                        padding: '0 12px',
                        fontSize: 14,
                        color: '#111827',
                        outline: 'none'
                    }}
                />
            </div>

            <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Danh sách hành khách (1)</div>
                <input
                    defaultValue="VE006 - Vũ Thị F"
                    style={{
                        width: '100%',
                        height: 42,
                        borderRadius: 8,
                        border: '1px solid #CBD5E1',
                        padding: '0 12px',
                        fontSize: 14,
                        color: '#111827',
                        outline: 'none'
                    }}
                />
            </div>

          {error && (
            <div style={{ background: '#FEE2E2', borderRadius: 8, padding: '10px 14px', color: '#B91C1C', marginBottom: 16, fontSize: 14 }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{ background: '#D1FAE5', borderRadius: 8, padding: '10px 14px', color: '#047857', marginBottom: 16, fontSize: 14 }}>
              {message}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: 8,
                border: 'none',
                background: '#2563EB',
                color: '#FFFFFF',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8
              }}
              disabled={!current || saving}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              {saving ? 'Đang cập nhật...' : 'Cập nhật lộ trình'}
            </button>
            <button
              style={{
                padding: '12px 24px',
                borderRadius: 8,
                border: 'none',
                background: '#F1F5F9',
                color: '#475569',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Hủy
            </button>
          </div>
          </>
          ) : (
            <div>Hãy chọn một lộ trình bên trái để điều chỉnh.</div>
          )}
        </div>
      </div>
    </DispatcherLayout>
  );
};

