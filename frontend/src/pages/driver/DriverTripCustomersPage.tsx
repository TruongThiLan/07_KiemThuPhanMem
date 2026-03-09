import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DriverLayout } from '../../components/DriverLayout';
import { api } from '../../api/client';

interface DriverStop {
  MaChiTiet: number;
  ThuTuDonTra: number;
  DiemDon: string;
  DiemTra: string;
  ThoiGianDonDuKien: string | null;
  TrangThaiKhach: string | null;
  MaLoTrinh: number;
  MaVe: number;
  SoLuongGhe: number;
  TenKhachHang: string;
  SoDienThoai: string;
}

interface RouteDetail {
  route: {
    MaLoTrinh: number;
  };
  stops: DriverStop[];
}

export const DriverTripCustomersPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<RouteDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const routeId = Number(id);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!routeId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<RouteDetail>(`/routes/${routeId}`);
        setDetail(res.data);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ??
            'Không thể tải danh sách khách hàng, vui lòng thử lại sau'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [routeId]);

  const stats = useMemo(() => {
    const stops = detail?.stops ?? [];
    const total = stops.length;
    let done = 0;
    let canceled = 0;
    let waiting = 0;
    stops.forEach((s) => {
      const st = (s.TrangThaiKhach || '').trim();
      if (st === 'Khách hủy') canceled += 1;
      else if (st === 'Đã trả khách') done += 1;
      else waiting += 1;
    });
    return { total, done, waiting, canceled };
  }, [detail]);

  const statusBadge = (stRaw: string | null) => {
    const st = (stRaw || '').trim();
    let label = st;
    if (!label) label = 'Đang chờ';

    let bg = '#E5E7EB';
    let color = '#111827';

    if (label === 'Đã đón khách' || label === 'Đã trả khách') {
      bg = '#DBFFE3';
      color = '#166534';
    } else if (label === 'Khách hủy') {
      bg = '#FEE2E2';
      color = '#B91C1C';
    } else {
      // Đang chờ / Đã đến điểm đón ...
      bg = 'rgba(248,255,205,0.83)';
      color = '#7E6704';
    }

    return (
      <span
        style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: 999,
          fontSize: 13,
          background: bg,
          color
        }}
      >
        {label}
      </span>
    );
  };

  return (
    <DriverLayout>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 16,
          color: '#0F172A'
        }}
      >
        Xem danh sách khách hàng
      </h2>

      {loading ? (
        <div>Đang tải danh sách...</div>
      ) : error ? (
        <div style={{ color: '#B91C1C' }}>{error}</div>
      ) : !detail ? (
        <div>Không tìm thấy dữ liệu chuyến.</div>
      ) : (
        <>
          {/* Dòng thống kê trên cùng */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 20,
              marginBottom: 18,
              alignItems: 'center'
            }}
          >
            <div
              style={{
                padding: '14px 24px',
                minWidth: 220,
                background: '#FFFFFF',
                borderRadius: 10,
                border: '1px solid #E5E7EB',
                boxShadow: '0px 6px 15px rgba(15,23,42,0.08)'
              }}
            >
              <div style={{ fontSize: 14, color: '#4B5563', marginBottom: 4 }}>Chuyến đi</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>
                {`CX${detail.route.MaLoTrinh.toString().padStart(8, '0')}`}
              </div>
            </div>

            <div
              style={{
                padding: '14px 24px',
                minWidth: 220,
                background: '#FFFFFF',
                borderRadius: 10,
                border: '1px solid #E5E7EB',
                boxShadow: '0px 6px 15px rgba(15,23,42,0.08)'
              }}
            >
              <div style={{ fontSize: 14, color: '#4B5563', marginBottom: 4 }}>
                Tổng số khách hàng
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1E40AF' }}>
                {stats.total.toString().padStart(2, '0')}
              </div>
            </div>

            <div
              style={{
                padding: '14px 24px',
                minWidth: 180,
                background: '#FFFFFF',
                borderRadius: 10,
                border: '1px solid #E5E7EB',
                boxShadow: '0px 6px 15px rgba(15,23,42,0.08)'
              }}
            >
              <div style={{ fontSize: 14, color: '#4B5563', marginBottom: 4 }}>Đã hoàn thành</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#16A34A' }}>
                {stats.done.toString().padStart(2, '0')}
              </div>
            </div>

            <div
              style={{
                padding: '14px 24px',
                minWidth: 180,
                background: '#FFFFFF',
                borderRadius: 10,
                border: '1px solid #E5E7EB',
                boxShadow: '0px 6px 15px rgba(15,23,42,0.08)'
              }}
            >
              <div style={{ fontSize: 14, color: '#4B5563', marginBottom: 4 }}>Đang chờ</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#F59E0B' }}>
                {stats.waiting.toString().padStart(2, '0')}
              </div>
            </div>

            <div
              style={{
                padding: '14px 24px',
                minWidth: 180,
                background: '#FFFFFF',
                borderRadius: 10,
                border: '1px solid #E5E7EB',
                boxShadow: '0px 6px 15px rgba(15,23,42,0.08)',
                flexGrow: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: 14, color: '#4B5563', marginBottom: 4 }}>Đã hủy</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#EF4444' }}>
                  {stats.canceled.toString().padStart(2, '0')}
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/driver/trips/${routeId}`)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 999,
                  border: 'none',
                  background: '#1E40AF',
                  color: '#FFFFFF',
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>🗺</span>
                <span>Xem bản đồ</span>
              </button>
            </div>
          </div>

          {/* Bảng khách hàng */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 10,
              border: '1px solid #E5E7EB',
              padding: 0,
              overflowX: 'auto',
              boxShadow: '0px 10px 25px rgba(15,23,42,0.12)'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#E5F0FF' }}>
                  <th style={{ padding: 10, textAlign: 'left' }}>STT</th>
                  <th style={{ padding: 10, textAlign: 'left' }}>Tên khách hàng</th>
                  <th style={{ padding: 10, textAlign: 'left' }}>Số điện thoại</th>
                  <th style={{ padding: 10, textAlign: 'left' }}>Điểm đón</th>
                  <th style={{ padding: 10, textAlign: 'left' }}>Điểm trả</th>
                  <th style={{ padding: 10, textAlign: 'left' }}>Số lượng ghế</th>
                  <th style={{ padding: 10, textAlign: 'left' }}>Thời gian đón dự kiến</th>
                  <th style={{ padding: 10, textAlign: 'left' }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {detail.stops.map((s, index) => (
                  <tr
                    key={s.MaChiTiet}
                    style={{
                      borderTop: '1px solid #E5E7EB',
                      backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F9FAFB'
                    }}
                  >
                    <td style={{ padding: 10 }}>{index + 1}</td>
                    <td style={{ padding: 10 }}>{s.TenKhachHang}</td>
                    <td style={{ padding: 10 }}>{s.SoDienThoai}</td>
                    <td style={{ padding: 10 }}>{s.DiemDon}</td>
                    <td style={{ padding: 10 }}>{s.DiemTra}</td>
                    <td style={{ padding: 10 }}>{s.SoLuongGhe}</td>
                    <td style={{ padding: 10 }}>
                      {s.ThoiGianDonDuKien
                        ? new Date(s.ThoiGianDonDuKien).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '--'}
                    </td>
                    <td style={{ padding: 10 }}>{statusBadge(s.TrangThaiKhach)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DriverLayout>
  );
};

