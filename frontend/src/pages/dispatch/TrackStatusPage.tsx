import React, { useEffect, useState } from 'react';
import { DispatcherLayout } from '../../components/DispatcherLayout';
import { api } from '../../api/client';

interface RouteSummary {
  MaLoTrinh: number;
  ThoiGianBatDau: string;
  TrangThaiLoTrinh: string;
  MaXe: number;
  MaTaiXe: number;
}

interface RouteDetail {
  route: any;
  stops: any[];
}

export const TrackStatusPage: React.FC = () => {
  const [routes, setRoutes] = useState<RouteSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<RouteDetail | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoadingList(true);
      try {
        const res = await api.get<RouteSummary[]>('/routes');
        setRoutes(res.data);
        if (res.data.length > 0) {
          setSelectedId(res.data[0].MaLoTrinh);
        }
      } catch (e) {
        // giữ im lặng, có thể chưa có dữ liệu
      } finally {
        setLoadingList(false);
      }
    };
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const fetchDetail = async () => {
      setLoadingDetail(true);
      try {
        const res = await api.get<RouteDetail>(`/routes/${selectedId}`);
        setDetail(res.data);
      } catch {
        setDetail(null);
      } finally {
        setLoadingDetail(false);
      }
    };
    fetchDetail();
  }, [selectedId]);

  const renderStatusBadge = (status: string) => {
    let bg = '#E5E7EB';
    let color = '#111827';
    if (status.includes('Đang thực hiện')) {
      bg = '#DBEAFE';
      color = '#1D4ED8';
    } else if (status.includes('Chưa thực hiện')) {
      bg = '#FEF9C3';
      color = '#854D0E';
    } else if (status.includes('Hoàn thành')) {
      bg = '#DCFCE7';
      color = '#166534';
    }
    return (
      <span
        style={{
          padding: '4px 10px',
          borderRadius: 999,
          fontSize: 12,
          background: bg,
          color
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <DispatcherLayout activeSubTab="track">
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
        Theo dõi trạng thái trung chuyển
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: 16,
          alignItems: 'flex-start'
        }}
      >
        {/* Danh sách lộ trình */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 10,
            border: '1px solid #E5E7EB',
            padding: 16,
            minHeight: 400
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Danh sách lộ trình</div>
          {loadingList && <div>Đang tải...</div>}
          {!loadingList &&
            (routes.length === 0 ? (
              <div>Chưa có lộ trình nào.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {routes.map((r) => (
                  <button
                    key={r.MaLoTrinh}
                    onClick={() => setSelectedId(r.MaLoTrinh)}
                    style={{
                      textAlign: 'left',
                      padding: 12,
                      borderRadius: 8,
                      border:
                        selectedId === r.MaLoTrinh
                          ? '2px solid #1E5FA8'
                          : '1px solid #E5E7EB',
                      background: selectedId === r.MaLoTrinh ? '#EFF6FF' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{`LT${r.MaLoTrinh
                      .toString()
                      .padStart(3, '0')}`}</div>
                    <div style={{ fontSize: 14, color: '#4B5563' }}>
                      Trạng thái: {renderStatusBadge(r.TrangThaiLoTrinh || '')}
                    </div>
                  </button>
                ))}
              </div>
            ))}
        </div>

        {/* Chi tiết + vị trí */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 10,
              border: '1px solid #E5E7EB',
              padding: 16
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12
              }}
            >
              <div style={{ fontWeight: 600 }}>
                Chi tiết lộ trình:{' '}
                {selectedId ? `LT${selectedId.toString().padStart(3, '0')}` : '--'}
              </div>
              {detail?.route?.TrangThaiLoTrinh &&
                renderStatusBadge(detail.route.TrangThaiLoTrinh)}
            </div>

            {loadingDetail && <div>Đang tải chi tiết...</div>}
            {!loadingDetail && detail && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>Xe</div>
                    <div>{detail.route.MaXe}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>Thời gian bắt đầu</div>
                    <div>
                      {detail.route.ThoiGianBatDau &&
                        new Date(detail.route.ThoiGianBatDau).toLocaleString('vi-VN')}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>Tài xế</div>
                    <div>{detail.route.MaTaiXe}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>Số hành khách</div>
                    <div>{detail.stops?.length ?? 0}</div>
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>
                    Lộ trình dự kiến
                  </div>
                  <div>{detail.route.LoTrinhDuKien || 'Chưa có mô tả lộ trình'}</div>
                </div>
              </>
            )}
          </div>

          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 10,
              border: '1px solid #E5E7EB',
              padding: 16,
              minHeight: 180
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Vị trí hiện tại</div>
            <div
              style={{
                borderRadius: 12,
                background: '#F9FAFB',
                padding: 32,
                textAlign: 'center',
                color: '#1F2937'
              }}
            >
              {/* Chưa tích hợp GPS thật nên hiển thị placeholder */}
              Đang tại vị trí mới nhất (mock) – có thể thay bằng dữ liệu bảng TheoDoiTrangThai.
            </div>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 10,
              border: '1px solid #E5E7EB',
              padding: 16
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Danh sách hành khách</div>
            {detail?.stops && detail.stops.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {detail.stops.map((s: any) => (
                  <li key={s.MaChiTiet}>
                    Vé: {s.MaVe} – {s.DiemDon} → {s.DiemTra} ({s.TrangThaiKhach || 'Chưa xử lý'})
                  </li>
                ))}
              </ul>
            ) : (
              <div>Chưa có chi tiết hành khách.</div>
            )}
          </div>
        </div>
      </div>
    </DispatcherLayout>
  );
};

