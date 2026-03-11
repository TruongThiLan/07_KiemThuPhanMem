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
          gap: 20,
          alignItems: 'flex-start'
        }}
      >
        {/* Danh sách lộ trình */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E5E7EB',
            padding: 16,
            minHeight: 400,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#111827' }}>Danh sách lộ trình</div>
          {loadingList && <div style={{ color: '#6B7280', fontSize: 14 }}>Đang tải...</div>}
          {!loadingList &&
            (routes.length === 0 ? (
              <div style={{ color: '#6B7280', fontSize: 14 }}>Chưa có lộ trình nào.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {routes.map((r) => (
                  <button
                    key={r.MaLoTrinh}
                    onClick={() => setSelectedId(r.MaLoTrinh)}
                    style={{
                      textAlign: 'left',
                      padding: 16,
                      borderRadius: 12,
                      border:
                        selectedId === r.MaLoTrinh
                          ? '2px solid #2563EB'
                          : '1px solid #E5E7EB',
                      background: selectedId === r.MaLoTrinh ? '#EFF6FF' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'block',
                      width: '100%'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{`LT${r.MaLoTrinh.toString().padStart(3, '0')}`}</div>
                    </div>
                    <div style={{ marginBottom: 12 }}>{renderStatusBadge(r.TrangThaiLoTrinh || '')}</div>
                    <div style={{ fontSize: 13, color: '#475569', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="7" cy="15" r="1"></circle><circle cx="17" cy="15" r="1"></circle><path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"></path></svg>
                        51B-{Math.floor(10000 + Math.random() * 90000)}
                    </div>
                    <div style={{ fontSize: 13, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        Tài xế Nguyễn Văn {r.MaTaiXe}
                    </div>
                  </button>
                ))}
              </div>
            ))}
        </div>

        {/* Chi tiết + vị trí */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              border: '1px solid #E5E7EB',
              padding: 24,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                paddingBottom: 16,
                borderBottom: '1px solid #E5E7EB'
              }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#111827' }}>
                Chi tiết lộ trình: {selectedId ? `LT${selectedId.toString().padStart(3, '0')}` : '--'}
              </h3>
              {detail?.route?.TrangThaiLoTrinh && renderStatusBadge(detail.route.TrangThaiLoTrinh)}
            </div>

            {loadingDetail && <div style={{ color: '#6B7280', fontSize: 14 }}>Đang tải chi tiết...</div>}
            {!loadingDetail && detail && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                  <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 8, border: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Xe trung chuyển</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>51B-{Math.floor(10000 + Math.random() * 90000)}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 8, border: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Tài xế</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>Nguyễn Văn {detail.route.MaTaiXe}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 8, border: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Thời gian bắt đầu</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>
                      {detail.route.ThoiGianBatDau ? new Date(detail.route.ThoiGianBatDau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '06:00'}
                    </div>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 8, border: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Hành khách</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>{detail.stops?.length ?? 5} người</div>
                  </div>
                </div>
              </>
            )}
            
            {/* Mock Map / GPS placeholder */}
            <div style={{ fontWeight: 600, marginBottom: 12, color: '#111827', fontSize: 15 }}>Theo dõi vị trí (GPS)</div>
            <div
              style={{
                borderRadius: 12,
                background: '#F1F5F9',
                height: 300,
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
                <img src="/map-placeholder.png" alt="Map" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <div style={{ position: 'absolute', background: 'rgba(255,255,255,0.9)', padding: '8px 16px', borderRadius: 999, fontWeight: 600, color: '#2563EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB', animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                    Đang di chuyển trên đường Điện Biên Phủ
                </div>
            </div>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              border: '1px solid #E5E7EB',
              padding: 24,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: '#111827' }}>Tiến độ đón/trả khách</div>
            <div style={{ position: 'relative', paddingLeft: 24 }}>
                {/* Vertical line */}
                <div style={{ position: 'absolute', left: 8, top: 12, bottom: 12, width: 2, background: '#E5E7EB' }} />
                
                {/* Mock timeline items */}
                {[
                    { id: 1, type: 'start', time: '06:00', title: 'Bắt đầu lộ trình', desc: 'Xe xuất phát từ bãi', status: 'done' },
                    { id: 2, type: 'pickup', time: '06:15', title: 'Đón khách: Lê Thanh Nam (VE001)', desc: 'Tại: 123 Nguyễn Tất Thành, Hải Châu', status: 'done' },
                    { id: 3, type: 'pickup', time: '06:30', title: 'Đón khách: Hoàng Minh Đức (VE002)', desc: 'Tại: 45 Lê Duẩn, Hải Châu', status: 'current' },
                    { id: 4, type: 'dropoff', time: '07:00 (Dự kiến)', title: 'Trả khách tại Bến xe TT Đà Nẵng', desc: 'Nhà xe Phương Trang', status: 'pending' },
                ].map((item, idx) => (
                    <div key={item.id} style={{ position: 'relative', marginBottom: idx === 3 ? 0 : 24 }}>
                        <div style={{ position: 'absolute', left: -24, top: 4, width: 16, height: 16, borderRadius: '50%', background: item.status === 'done' ? '#10B981' : (item.status === 'current' ? '#3B82F6' : '#FFFFFF'), border: `3px solid ${item.status === 'pending' ? '#CBD5E1' : '#FFFFFF'}`, boxShadow: item.status === 'current' ? '0 0 0 4px rgba(59,130,246,0.2)' : 'none', zIndex: 1 }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: item.status === 'current' ? 700 : 600, color: item.status === 'pending' ? '#6B7280' : '#111827', marginBottom: 4 }}>{item.title}</div>
                                <div style={{ fontSize: 13, color: '#6B7280' }}>{item.desc}</div>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: item.status === 'pending' ? '#9CA3AF' : '#475569', background: '#F8FAFC', padding: '4px 8px', borderRadius: 4 }}>
                                {item.time}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </DispatcherLayout>
  );
};

