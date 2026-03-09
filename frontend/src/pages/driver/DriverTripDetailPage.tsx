import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DriverLayout } from '../../components/DriverLayout';
import { api } from '../../api/client';

interface DriverRoute {
  MaLoTrinh: number;
  MaXe: number;
  BienSo: string;
  ThoiGianBatDau: string;
  ThoiGianKetThuc: string | null;
  LoTrinhDuKien: string | null;
  TrangThaiLoTrinh: string;
  LoaiXe?: string;
  SoCho?: number;
}

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
  KhungGioTrungChuyen: string | null;
  TrangThaiVe: string;
  TenKhachHang: string;
  SoDienThoai: string;
}

interface RouteDetail {
  route: DriverRoute;
  stops: DriverStop[];
}

export const DriverTripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<RouteDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<number | null>(null);

  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentLoc, setIncidentLoc] = useState('');
  const [incidentSaving, setIncidentSaving] = useState(false);
  const [incidentError, setIncidentError] = useState<string | null>(null);
  const navigate = useNavigate();

  const routeId = Number(id);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!routeId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<RouteDetail>(`/routes/${routeId}`);
        setDetail(res.data);
        if (res.data?.stops?.length) {
          setSelectedStopId(res.data.stops[0].MaChiTiet);
        } else {
          setSelectedStopId(null);
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.message ??
            'Lỗi tải thông tin, xin vui lòng thử lại sau.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [routeId]);

  const updateTripStatus = async (newStatus: string) => {
    if (!detail) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await api.put(`/routes/${routeId}`, { TrangThaiLoTrinh: newStatus });
      setDetail((prev) => (prev ? { ...prev, route: res.data } : prev));
      setMessage('Đã cập nhật trạng thái chuyến.');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Không thể cập nhật trạng thái chuyến.');
    } finally {
      setSaving(false);
    }
  };

  const updateStopStatus = async (stopId: number, newStatus: string) => {
    if (!detail) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await api.patch(`/routes/${routeId}/stops/${stopId}/status`, { status: newStatus });
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              stops: prev.stops.map((s) =>
                s.MaChiTiet === stopId ? { ...s, TrangThaiKhach: newStatus } : s
              ),
              route: res.data?.routeAutoCompleted ? { ...prev.route, TrangThaiLoTrinh: 'Hoàn thành' } : prev.route
            }
          : prev
      );
      setMessage(res.data?.routeAutoCompleted ? 'Đã cập nhật. Chuyến đã hoàn thành.' : 'Đã cập nhật trạng thái khách.');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Cập nhật trạng thái không thành công, vui lòng thử lại');
    } finally {
      setSaving(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    let bg = '#E5E7EB';
    let color = '#111827';
    if (status.includes('Hoàn thành')) {
      bg = '#DCFCE7';
      color = '#166534';
    } else if (status.includes('Đang')) {
      bg = '#DBEAFE';
      color = '#1D4ED8';
    } else if (status.includes('Hủy')) {
      bg = '#FEE2E2';
      color = '#B91C1C';
    } else if (status.includes('sự cố')) {
      bg = '#E9D5FF';
      color = '#6B21A8';
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

  const currentStatusRaw: string = detail?.route?.TrangThaiLoTrinh || 'Chưa thực hiện';
  const currentStatus: string = useMemo(() => {
    if (currentStatusRaw === 'Chưa thực hiện') return 'Chưa bắt đầu';
    return currentStatusRaw;
  }, [currentStatusRaw]);

  const canUpdateStops = useMemo(() => {
    return ['Đang thực hiện', 'Đang gặp sự cố'].includes(currentStatusRaw);
  }, [currentStatusRaw]);

  const handleSelectStop = (stopId: number) => {
    setSelectedStopId(stopId);
    const el = document.getElementById(`stop-${stopId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const markerColor = (s: DriverStop) => {
    const st = (s.TrangThaiKhach || '').trim();
    if (selectedStopId === s.MaChiTiet) return '#EF4444';
    if (st === 'Đã trả khách') return '#16A34A';
    if (st === 'Khách hủy') return '#6B7280';
    if (st === 'Đã đón khách') return '#2563EB';
    if (st === 'Đã đến điểm đón') return '#F59E0B';
    return '#1D4ED8';
  };

  const reportIncident = async () => {
    if (!detail) return;
    if (incidentDesc.trim().length < 3) {
      setIncidentError('Vui lòng nhập nội dung sự cố.');
      return;
    }
    setIncidentSaving(true);
    setIncidentError(null);
    setMessage(null);
    try {
      await api.post(`/routes/${routeId}/incident`, {
        description: incidentDesc.trim(),
        location: incidentLoc.trim() ? incidentLoc.trim() : undefined
      });
      setShowIncidentModal(false);
      setIncidentDesc('');
      setIncidentLoc('');
      // reload detail
      const res = await api.get<RouteDetail>(`/routes/${routeId}`);
      setDetail(res.data);
      setMessage('Đã báo cáo sự cố.');
    } catch (err: any) {
      setIncidentError(err?.response?.data?.message ?? 'Không thể báo cáo sự cố, vui lòng thử lại.');
    } finally {
      setIncidentSaving(false);
    }
  };

  return (
    <DriverLayout>
      <button
        type="button"
        onClick={() => navigate(-1)}
        style={{
          border: 'none',
          background: 'none',
          color: '#1E40AF',
          cursor: 'pointer',
          marginBottom: 8
        }}
      >
        ← Quay lại danh sách chuyến
      </button>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
        Xem lộ trình trung chuyển {routeId ? `CX${routeId.toString().padStart(8, '0')}` : ''}
      </h2>

      {loading ? (
        <div>Đang tải chi tiết...</div>
      ) : error ? (
        <div style={{ color: '#B91C1C' }}>{error}</div>
      ) : !detail ? (
        <div>Không tìm thấy lộ trình.</div>
      ) : (
        <>
          {/* Thanh thông tin trạng thái */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              alignItems: 'center',
              marginBottom: 12
            }}
          >
            {renderStatusBadge(currentStatus)}
            <div>
              Biển số: <strong>{detail.route.BienSo}</strong>
            </div>
            <div>
              Bắt đầu dự kiến:{' '}
              {detail.route.ThoiGianBatDau
                ? new Date(detail.route.ThoiGianBatDau).toLocaleString('vi-VN')
                : '--'}
            </div>
            <div>
              Kết thúc dự kiến:{' '}
              {detail.route.ThoiGianKetThuc
                ? new Date(detail.route.ThoiGianKetThuc).toLocaleString('vi-VN')
                : '--'}
            </div>
            <div>
              Hành khách: <strong>{detail.stops.length}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <button
              disabled={saving || currentStatusRaw === 'Đang thực hiện'}
              onClick={() => updateTripStatus('Đang thực hiện')}
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                border: 'none',
                background: '#22C55E',
                color: '#fff',
                cursor: 'pointer',
                opacity: saving || currentStatusRaw === 'Đang thực hiện' ? 0.6 : 1
              }}
            >
              Bắt đầu chuyến
            </button>
            <button
              disabled={saving || currentStatusRaw === 'Hoàn thành'}
              onClick={() => updateTripStatus('Hoàn thành')}
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                border: 'none',
                background: '#15803D',
                color: '#fff',
                cursor: 'pointer',
                opacity: saving || currentStatusRaw === 'Hoàn thành' ? 0.6 : 1
              }}
            >
              Kết thúc chuyến
            </button>
            <button
              disabled={saving}
              onClick={() => {
                setIncidentError(null);
                setIncidentDesc('');
                setIncidentLoc('');
                setShowIncidentModal(true);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                border: 'none',
                background: '#6B21A8',
                color: '#fff',
                cursor: 'pointer',
                opacity: saving ? 0.6 : 1
              }}
            >
              Báo cáo sự cố
            </button>
            <button
              type="button"
              onClick={() => navigate(`/driver/trips/${routeId}/customers`)}
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                border: 'none',
                background: '#E5E7EB',
                color: '#111827',
                cursor: 'pointer'
              }}
            >
              Danh sách khách hàng
            </button>
          </div>

          {message && (
            <div
              style={{
                background: 'rgba(34,197,94,0.15)',
                borderRadius: 8,
                padding: '6px 10px',
                color: '#166534',
                marginBottom: 8
              }}
            >
              {message}
            </div>
          )}

          {/* Thông tin lộ trình dự kiến */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 10,
              border: '1px solid #E5E7EB',
              padding: 12,
              marginBottom: 16
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Thông tin chuyến</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6, fontSize: 14 }}>
              <div>
                <strong>Mã chuyến:</strong>{' '}
                {routeId ? `CX${routeId.toString().padStart(8, '0')}` : '--'}
              </div>
              <div>
                <strong>Lộ trình dự kiến:</strong> {detail.route.LoTrinhDuKien || '--'}
              </div>
              <div>
                <strong>Trạng thái chuyến:</strong> {currentStatus}
              </div>
            </div>
          </div>

          {/* Bản đồ demo + danh sách khách */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.5fr)',
              gap: 16
            }}
          >
            {/* Map demo */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 10,
                border: '1px solid #E5E7EB',
                padding: 16,
                minHeight: 320
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Bản đồ demo</div>
              <div
                style={{
                  position: 'relative',
                  borderRadius: 12,
                  background:
                    'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 40%, #BFDBFE 70%, #EFF6FF 100%)',
                  height: 260,
                  overflow: 'hidden'
                }}
              >
                {/* Đường đi đơn giản */}
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 400 260"
                  preserveAspectRatio="none"
                >
                  <polyline
                    points="40,220 100,180 170,150 230,110 300,80 360,40"
                    fill="none"
                    stroke="#1E40AF"
                    strokeWidth="4"
                  />
                </svg>

                {/* Marker theo thứ tự điểm đón/trả */}
                {detail.stops.map((s, index) => {
                  const t = detail.stops.length <= 1 ? 0 : index / (detail.stops.length - 1);
                  const left = 40 + t * 320;
                  const top = 220 - t * 180;
                  return (
                    <div
                      key={s.MaChiTiet}
                      style={{
                        position: 'absolute',
                        left,
                        top,
                        transform: 'translate(-50%, -50%)',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSelectStop(s.MaChiTiet)}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: markerColor(s),
                          border: '2px solid #F9FAFB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 700
                        }}
                      >
                        {index + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Danh sách khách hàng */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 10,
                border: '1px solid #E5E7EB',
                padding: 16
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Danh sách khách hàng đón/trả</div>
              <div
                style={{
                  maxHeight: 280,
                  overflowY: 'auto',
                  paddingRight: 4
                }}
              >
                {detail.stops.length === 0 ? (
                  <div>Chưa có chi tiết hành khách.</div>
                ) : (
                  detail.stops.map((s, index) => (
                    <div
                      key={s.MaChiTiet}
                      id={`stop-${s.MaChiTiet}`}
                      style={{
                        borderRadius: 8,
                        border:
                          selectedStopId === s.MaChiTiet
                            ? '2px solid #1E40AF'
                            : '1px solid #E5E7EB',
                        padding: 10,
                        marginBottom: 8,
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                        background: selectedStopId === s.MaChiTiet ? 'rgba(219,234,254,0.4)' : '#fff'
                      }}
                      onClick={() => handleSelectStop(s.MaChiTiet)}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: '#1D4ED8',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700
                        }}
                      >
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>
                          {s.TenKhachHang} ({s.SoDienThoai})
                        </div>
                        <div style={{ fontSize: 13, color: '#6B7280' }}>
                          <div>
                            <strong>Thứ tự:</strong> {s.ThuTuDonTra} | <strong>Vé:</strong> {s.MaVe}{' '}
                            | <strong>Số ghế:</strong> {s.SoLuongGhe}
                          </div>
                          <div>
                            <strong>Điểm đón:</strong> {s.DiemDon}
                          </div>
                          <div>
                            <strong>Điểm trả:</strong> {s.DiemTra}
                          </div>
                          <div>
                            <strong>Thời gian đón dự kiến:</strong>{' '}
                            {s.ThoiGianDonDuKien
                              ? new Date(s.ThoiGianDonDuKien).toLocaleString('vi-VN')
                              : '--'}
                          </div>
                          <div>
                            <strong>Trạng thái hiện tại:</strong>{' '}
                            {s.TrangThaiKhach || 'Chưa cập nhật'}
                          </div>
                        </div>
                      </div>
                      <select
                        value={s.TrangThaiKhach || ''}
                        onChange={(e) =>
                          updateStopStatus(s.MaChiTiet, e.target.value || 'Đã đến điểm đón')
                        }
                        disabled={!canUpdateStops || saving}
                        style={{
                          borderRadius: 999,
                          border: '1px solid #D1D5DB',
                          padding: '4px 10px',
                          fontSize: 13,
                          opacity: !canUpdateStops || saving ? 0.6 : 1,
                          cursor: !canUpdateStops || saving ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <option value="">Chưa cập nhật</option>
                        <option value="Đã đến điểm đón">Đã đến điểm đón</option>
                        <option value="Đã đón khách">Đã đón khách</option>
                        <option value="Đã trả khách">Đã trả khách</option>
                        <option value="Khách hủy">Khách hủy</option>
                      </select>
                    </div>
                  ))
                )}
              </div>
              {!canUpdateStops && (
                <div style={{ marginTop: 8, fontSize: 13, color: '#6B7280' }}>
                  Bạn chỉ có thể cập nhật trạng thái khách khi chuyến đang ở trạng thái{' '}
                  <strong>“Đang thực hiện”</strong> (hoặc đang gặp sự cố).
                </div>
              )}
            </div>
          </div>

          {/* Popup báo cáo sự cố */}
          {showIncidentModal && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 60
              }}
              onClick={() => {
                if (!incidentSaving) setShowIncidentModal(false);
              }}
            >
              <div
                style={{
                  width: 520,
                  maxWidth: '92%',
                  background: '#FFFFFF',
                  borderRadius: 10,
                  padding: 20,
                  boxShadow: '0px 10px 30px rgba(0,0,0,0.25)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
                  Báo cáo sự cố
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#374151', marginBottom: 6 }}>
                      Nội dung sự cố
                    </div>
                    <textarea
                      value={incidentDesc}
                      onChange={(e) => setIncidentDesc(e.target.value)}
                      placeholder="Ví dụ: xe hỏng, kẹt xe, sự cố giao thông..."
                      style={{
                        width: '100%',
                        minHeight: 90,
                        borderRadius: 10,
                        border: '1px solid #D1D5DB',
                        padding: 10,
                        fontSize: 14,
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: '#374151', marginBottom: 6 }}>
                      Vị trí hiện tại (tuỳ chọn)
                    </div>
                    <input
                      value={incidentLoc}
                      onChange={(e) => setIncidentLoc(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn Linh, Q. Hải Châu..."
                      style={{
                        width: '100%',
                        borderRadius: 10,
                        border: '1px solid #D1D5DB',
                        padding: '10px 12px',
                        fontSize: 14,
                        outline: 'none'
                      }}
                    />
                  </div>
                  {incidentError && <div style={{ color: '#B91C1C' }}>{incidentError}</div>}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button
                      type="button"
                      disabled={incidentSaving}
                      onClick={() => setShowIncidentModal(false)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid #D1D5DB',
                        background: '#FFFFFF',
                        cursor: 'pointer'
                      }}
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      disabled={incidentSaving}
                      onClick={reportIncident}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: 'none',
                        background: '#6B21A8',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        opacity: incidentSaving ? 0.7 : 1
                      }}
                    >
                      Gửi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </DriverLayout>
  );
};

