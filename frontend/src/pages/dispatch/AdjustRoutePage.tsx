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
                  borderRadius: 8,
                  border:
                    selectedId === r.MaLoTrinh ? '2px solid #1E5FA8' : '1px solid #E5E7EB',
                  padding: 10,
                  marginBottom: 8,
                  cursor: 'pointer',
                  background: selectedId === r.MaLoTrinh ? '#EFF6FF' : '#FFFFFF'
                }}
              >
                <div style={{ fontWeight: 600 }}>LT{String(r.MaLoTrinh).padStart(3, '0')}</div>
                <div style={{ fontSize: 14, color: '#4B5563' }}>
                  {r.LoTrinhDuKien || 'Chưa có mô tả lộ trình'}
                </div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>{r.TrangThaiLoTrinh}</div>
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
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            Chi tiết điều chỉnh lộ trình
          </h3>
          {current ? (
            <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 16,
              marginBottom: 16
            }}
          >
            <Field label="Lộ trình hiện tại" value="Q5 → Q1 → Nhà xe Phương Trang" />
            <Field label="Lý do điều chỉnh" value="Khách đổi điểm đón" />
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 14, marginBottom: 4 }}>Điểm dừng mới</div>
            <textarea
              style={{
                width: '100%',
                minHeight: 80,
                borderRadius: 8,
                border: '1px solid #D1D5DB',
                padding: 10,
                fontSize: 14
              }}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 14, marginBottom: 4 }}>Ghi chú cho tài xế</div>
            <textarea
              style={{
                width: '100%',
                minHeight: 60,
                borderRadius: 8,
                border: '1px solid #D1D5DB',
                padding: 10,
                fontSize: 14
              }}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(248,113,113,0.2)',
                borderRadius: 8,
                padding: '8px 12px',
                color: '#B91C1C',
                marginBottom: 8,
                fontSize: 14
              }}
            >
              {error}
            </div>
          )}

          {message && (
            <div
              style={{
                background: 'rgba(34,197,94,0.2)',
                borderRadius: 8,
                padding: '8px 12px',
                color: '#166534',
                marginBottom: 8,
                fontSize: 14
              }}
            >
              {message}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                border: '1px solid #E5E7EB',
                background: '#FFFFFF',
                cursor: 'pointer'
              }}
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                border: 'none',
                background: '#1E5FA8',
                color: '#FFFFFF',
                cursor: 'pointer'
              }}
              disabled={!current || saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu điều chỉnh'}
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

interface FieldProps {
  label: string;
  value: string;
}

const Field: React.FC<FieldProps> = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>{label}</div>
    <div
      style={{
        borderRadius: 8,
        border: '1px solid #E5E7EB',
        padding: 10,
        fontSize: 14
      }}
    >
      {value}
    </div>
  </div>
);

