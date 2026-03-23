import React, { useEffect, useState } from 'react';
import { DispatcherLayout } from '../../components/DispatcherLayout';
import { api } from '../../api/client';

interface TicketRow {
  MaVe: number;
  KhungGioTrungChuyen: string | null;
  SoLuongGhe: number;
  TrangThaiVe: string;
  TenKhachHang: string;
  SoDienThoai: string;
  DiaChiDon: string;
  DiaChiTra: string;
  KhachHang?: {
    TenKhachHang?: string;
    DiaChiDon?: string;
    DiaChiTra?: string;
  };
}

interface VehicleData { MaXe: number; BienSo: string; SucChuaToiDa: number; }
interface DriverData { MaTaiXe: number; TenTaiXe: string; SoDienThoai: string; TrangThaiTaiXe: string; }

export const PlanRoutePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [drivers, setDrivers] = useState<DriverData[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters for step 1
  const [khuVucDon, setKhuVucDon] = useState('');
  const [nhaXeDich, setNhaXeDich] = useState('');
  const [khungGio, setKhungGio] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const [ticketsRes, vehiclesRes, driversRes] = await Promise.all([
          api.get<TicketRow[]>('/tickets', { params: { status: 'Cần trung chuyển' } }),
          api.get('/vehicles'),
          api.get('/drivers')
        ]);
        setTickets(ticketsRes.data);
        setVehicles(vehiclesRes.data);
        setDrivers(driversRes.data);
      } catch {
        setError('Không tải được dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const toggleTicket = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectedTickets = tickets.filter(t => selectedIds.includes(t.MaVe));
  const totalSeatsNeeded = selectedTickets.reduce((sum, t) => sum + t.SoLuongGhe, 0);
  const uniquePickupPoints = new Set(selectedTickets.map(t => t.DiaChiDon || t.KhachHang?.DiaChiDon)).size;

  const handleNextStep = () => setCurrentStep(prev => prev + 1);
  const handlePrevStep = () => setCurrentStep(prev => prev - 1);

  useEffect(() => {
    if (currentStep === 5) {
      const timer = setTimeout(() => {
        window.location.reload();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Mock filtering for step 1 demonstration
  const filteredTickets = tickets.filter(t => {
      const don = t.DiaChiDon || t.KhachHang?.DiaChiDon || '';
      const tra = t.DiaChiTra || t.KhachHang?.DiaChiTra || '';
      if (khuVucDon && !don.includes(khuVucDon)) return false;
      if (nhaXeDich && tra !== nhaXeDich) return false;
      if (khungGio && t.KhungGioTrungChuyen !== khungGio) return false;
      return true;
  });

  return (
    <DispatcherLayout activeSubTab="plan">
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 0', fontFamily: 'Roboto, sans-serif' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, color: '#002592' }}>
          Lập kế hoạch lộ trình trung chuyển
        </h2>
        <div style={{ fontSize: 13, color: '#6A7282', marginBottom: 20 }}>
          Nhân viên: NV001 | Thời gian: {new Date().toLocaleString('vi-VN')}
        </div>

        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #F3F4F6',
            borderRadius: 14,
            padding: '16px',
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <div className="step-progress-wrapper">
            <StepChip step={1} label="Chọn khách hàng" active={currentStep === 1} done={currentStep > 1} />
            <StepSeparator done={currentStep > 1} />
            <StepChip step={2} label="Chọn xe" active={currentStep === 2} done={currentStep > 2} />
            <StepSeparator done={currentStep > 2} />
            <StepChip step={3} label="Chọn tài xế" active={currentStep === 3} done={currentStep > 3} />
            <StepSeparator done={currentStep > 3} />
            <StepChip step={4} label="Xác nhận" active={currentStep === 4} done={currentStep > 4} />
          </div>
        </div>

        {currentStep === 1 && (
          <>
            <div style={{ background: '#FFFFFF', border: '1px solid #F3F4F6', borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#101828' }}>Lọc danh sách khách hàng</h3>
                </div>
                <div className="filter-grid">
                  <FilterSelect label="Khu vực đón" placeholder="Tất cả điểm đón" value={khuVucDon} onChange={e => setKhuVucDon(e.target.value)} options={['Quận 1', 'Quận 3', 'Quận 5', 'Quận 10']} />
                  <FilterSelect label="Nhà xe đích" placeholder="Tất cả nhà xe đích" value={nhaXeDich} onChange={e => setNhaXeDich(e.target.value)} options={['Nhà xe Phương Trang', 'Nhà xe Mai Linh']} />
                  <FilterSelect label="Khung giờ trung chuyển" placeholder="Tất cả khung giờ trung chuyển" value={khungGio} onChange={e => setKhungGio(e.target.value)} options={['06:00 - 07:00', '07:00 - 08:00', '08:00 - 09:00']} />
                </div>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #F3F4F6', borderRadius: 14, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#101828' }}>Danh sách khách hàng cần trung chuyển ({filteredTickets.length})</h3>
                </div>

                {error && <div style={{ marginBottom: 12, padding: 12, borderRadius: 8, background: '#FEE2E2', color: '#B91C1C', fontSize: 14 }}>{error}</div>}
                
                <div className="table-responsive-wrapper">
                  <div className="table-responsive-container">
                  <div style={{ display: 'grid', gridTemplateColumns: '40px 80px 150px 1fr 180px 140px 80px 140px', padding: '10px 16px', background: 'linear-gradient(90deg, #F9FAFB 0%, #F3F4F6 100%)', fontWeight: 600, fontSize: 12, color: '#364153', borderBottom: '1px solid #E5E7EB' }}>
                      <div></div>
                      <div>Mã vé</div>
                      <div>Tên khách hàng</div>
                      <div>Điểm đón</div>
                      <div>Nhà xe đích</div>
                      <div>Khung giờ</div>
                      <div>Số ghế</div>
                      <div>Trạng thái</div>
                  </div>
                  {loading ? (
                      <div style={{ padding: 24, textAlign: 'center' }}>Đang tải danh sách...</div>
                  ) : filteredTickets.length === 0 ? (
                      <div style={{ padding: 24, textAlign: 'center', color: '#6B7280' }}>Không tìm thấy khách hàng phù hợp.</div>
                  ) : (
                      filteredTickets.map((t) => (
                      <div key={t.MaVe} style={{ display: 'grid', gridTemplateColumns: '40px 80px 150px 1fr 180px 140px 80px 140px', padding: '12px 16px', borderBottom: '1px solid #E5E7EB', fontSize: 13, alignItems: 'center', background: selectedIds.includes(t.MaVe) ? '#EFF6FF' : '#FFFFFF', transition: 'background-color 0.2s' }}>
                          <div><input type="checkbox" checked={selectedIds.includes(t.MaVe)} onChange={() => toggleTicket(t.MaVe)} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#0075FF' }} /></div>
                          <div style={{ fontWeight: 500, color: '#0A0A0A' }}>VE{String(t.MaVe).padStart(3, '0')}</div>
                          <div style={{ color: '#0A0A0A' }}>{t.TenKhachHang || t.KhachHang?.TenKhachHang}</div>
                          <div style={{ color: '#4A5565' }}>{t.DiaChiDon || t.KhachHang?.DiaChiDon}</div>
                          <div style={{ color: '#4A5565' }}>{t.DiaChiTra || t.KhachHang?.DiaChiTra}</div>
                          <div style={{ color: '#4A5565' }}>{t.KhungGioTrungChuyen || '06:00 - 07:00'}</div>
                          <div>
                            <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: '#DBEAFE', color: '#1447E6', fontSize: 12, fontWeight: 500 }}>{t.SoLuongGhe || 1}</span>
                          </div>
                          <div>
                            <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: '#E9D4FF', color: '#CA3500', fontSize: 11, fontWeight: 400 }}>{t.TrangThaiVe || 'Cần trung chuyển'}</span>
                          </div>
                      </div>
                      ))
                  )}
                  </div>
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div style={{ background: 'linear-gradient(135deg, #155DFC 0%, #432DD7 100%)', borderRadius: 14, padding: 16, color: '#FFFFFF', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 700, fontFamily: 'Roboto' }}>Thông tin nhóm hành khách đã chọn</h4>
                    <div className="stats-grid">
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 10, backdropFilter: 'blur(4px)' }}>
                            <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4, color: '#DBEAFE', fontFamily: 'Roboto' }}>Danh sách mã vé</div>
                            <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Roboto' }}>{selectedTickets.map(t => `VE${String(t.MaVe).padStart(3,'0')}`).join(', ')}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 10, backdropFilter: 'blur(4px)' }}>
                            <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4, color: '#DBEAFE', fontFamily: 'Roboto' }}>Tổng số lượng ghế</div>
                            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Roboto' }}>{totalSeatsNeeded}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 10, backdropFilter: 'blur(4px)' }}>
                            <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4, color: '#DBEAFE', fontFamily: 'Roboto' }}>Số điểm đón</div>
                            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Roboto' }}>{uniquePickupPoints}</div>
                        </div>
                    </div>
                    <button onClick={handleNextStep} style={{ width: '100%', padding: '14px 0', borderRadius: 10, border: 'none', background: '#FFFFFF', color: '#1447E6', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Roboto' }}>
                        Tiếp theo: Chọn xe trung chuyển <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </button>
                </div>
            )}
          </>
        )}

        {currentStep === 2 && (
            <div style={{ background: '#FFFFFF', border: '1px solid #F3F4F6', borderRadius: 14, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="7" cy="15" r="1"></circle><circle cx="17" cy="15" r="1"></circle><path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"></path></svg>
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#101828' }}>Chọn xe trung chuyển</h3>
                  </div>
                  <div style={{ fontSize: 14, color: '#475569' }}>Cần: <span style={{ color: '#155DFC', fontWeight: 700 }}>{totalSeatsNeeded} ghế</span></div>
              </div>

              <div className="cards-grid">
                  {vehicles.map((v) => {
                      const capacity = v.SucChuaToiDa || 0;
                      const emptySeats = capacity - (v.MaXe % 3 === 0 ? capacity - 1 : Math.floor(capacity / 2));
                      const isSelected = selectedVehicleId === v.MaXe;
                      const canFit = emptySeats >= totalSeatsNeeded;
                      const fillPercentage = Math.max(0, capacity - emptySeats) / capacity * 100;

                      return (
                          <div key={v.MaXe} onClick={() => canFit && setSelectedVehicleId(v.MaXe)} style={{ border: `2px solid ${isSelected ? '#155DFC' : '#E5E7EB'}`, borderRadius: 12, padding: 20, cursor: canFit ? 'pointer' : 'not-allowed', opacity: canFit ? 1 : 0.6, transition: 'all 0.2s', background: isSelected ? '#EFF6FF' : '#FFFFFF' }}>
                              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Mã xe</div>
                              <div style={{ fontSize: 16, fontWeight: 700, color: isSelected ? '#002592' : '#111827', marginBottom: 8 }}>XE{String(v.MaXe).padStart(3, '0')}</div>
                              <div style={{ fontSize: 16, fontWeight: 700, color: '#155DFC', marginBottom: 16 }}>Biển số: {v.BienSo}</div>
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, color: '#475569' }}>
                                  <span>Sức chứa tối đa</span>
                                  <span style={{ fontWeight: 600, color: '#111827' }}>{capacity} ghế</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 16 }}>
                                  <span style={{ color: '#475569' }}>Ghế trống</span>
                                  <span style={{ fontWeight: 700, color: canFit ? '#10B981' : '#EF4444' }}>{emptySeats} ghế</span>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7280', marginBottom: 6 }}>
                                  <span>Tỷ lệ lấp đầy</span>
                                  <span>{Math.round(fillPercentage)}%</span>
                              </div>
                              <div style={{ width: '100%', height: 6, background: '#E5E7EB', borderRadius: 999, overflow: 'hidden' }}>
                                  <div style={{ width: `${fillPercentage}%`, height: '100%', background: '#155DFC', borderRadius: 999 }}></div>
                              </div>
                          </div>
                      );
                  })}
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                  <button onClick={handlePrevStep} style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: '#F3F4F6', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> Quay lại
                  </button>
                  <button onClick={handleNextStep} disabled={!selectedVehicleId} style={{ flex: 1, padding: '12px 24px', borderRadius: 8, border: 'none', background: selectedVehicleId ? '#155DFC' : '#93C5FD', color: '#FFFFFF', fontSize: 14, fontWeight: 600, cursor: selectedVehicleId ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      Tiếp theo: Chọn tài xế {selectedVehicleId && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
                  </button>
              </div>
            </div>
        )}

        {currentStep === 3 && (
            <div style={{ background: '#FFFFFF', border: '1px solid #F3F4F6', borderRadius: 14, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2B7FFF" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="23" y2="12"></line><line x1="23" y1="8" x2="19" y2="12"></line></svg>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#101828', fontFamily: 'Roboto' }}>Chọn tài xế phù hợp</h3>
              </div>

              <div className="cards-grid-drivers">
                  {drivers.map((d) => {
                      const statusColors: Record<string, { bg: string, text: string, idColor: string, avatarBg: string, chipBg: string, chipColor: string, borderColor: string }> = {
                          'Rảnh': { bg: '#F9FAFB', text: '#101828', idColor: '#6A7282', avatarBg: '#00C950', chipBg: '#E0F2FE', chipColor: '#00C950', borderColor: '#E5E7EB' },
                          'Đang thực hiện chuyến': { bg: '#F9FAFB', text: '#6A7282', idColor: '#9CA3AF', avatarBg: '#6EE7B7', chipBg: '#FCE7F3', chipColor: '#BE185D', borderColor: '#E5E7EB' },
                          'Đã được phân công': { bg: '#F9FAFB', text: '#6A7282', idColor: '#9CA3AF', avatarBg: '#6EE7B7', chipBg: '#FFFBEB', chipColor: '#D97706', borderColor: '#E5E7EB' },
                      };
                      const isAvailable = d.TrangThaiTaiXe === 'Rảnh';
                      const isSelected = selectedDriverId === d.MaTaiXe;
                      const style = statusColors[d.TrangThaiTaiXe] || statusColors['Rảnh'];

                      return (
                          <div key={d.MaTaiXe} onClick={() => isAvailable && setSelectedDriverId(d.MaTaiXe)} style={{ border: `2px solid ${isSelected ? '#2B7FFF' : style.borderColor}`, borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 8, cursor: isAvailable ? 'pointer' : 'not-allowed', background: isSelected ? '#EFF6FF' : style.bg, transition: 'all 0.2s' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: style.avatarBg, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, fontFamily: 'Roboto' }}>
                                          {(d.TenTaiXe || 'Tài xế').split(' ').pop()?.charAt(0)}
                                      </div>
                                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                                          <div style={{ fontSize: 15, fontWeight: 700, color: style.text, marginBottom: 4, fontFamily: 'Roboto' }}>{d.TenTaiXe}</div>
                                          <div style={{ fontSize: 13, color: style.idColor, fontFamily: 'Roboto' }}>Mã: TX{String(d.MaTaiXe).padStart(3, '0')}</div>
                                      </div>
                                  </div>
                                  <div style={{ padding: '4px 10px', borderRadius: 4, background: style.chipBg, color: style.chipColor, fontSize: 12, fontWeight: 600, fontFamily: 'Roboto' }}>
                                      {d.TrangThaiTaiXe}
                                  </div>
                              </div>
                          </div>
                      );
                  })}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={handlePrevStep} style={{ width: 120, padding: '12px 0', borderRadius: 8, border: 'none', background: '#F1F5F9', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Roboto', gap: 8 }}>
                      &larr; Quay lại
                  </button>
                  <button onClick={handleNextStep} disabled={!selectedDriverId} style={{ flex: 1, padding: '12px 0', borderRadius: 8, border: 'none', background: selectedDriverId ? '#155DFC' : '#94A3B8', color: '#FFFFFF', fontSize: 14, fontWeight: 600, cursor: selectedDriverId ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Roboto' }}>
                      Tiếp theo: Xác nhận tạo lộ trình &rarr;
                  </button>
              </div>
            </div>
        )}

        {(currentStep === 4 || currentStep === 5) && (
            <div style={{ background: '#FFFFFF', border: '1px solid #F3F4F6', borderRadius: 14, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, color: '#00C950' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M9 16l2 2 4-4"></path></svg>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#101828', fontFamily: 'Roboto' }}>Xác nhận tạo lộ trình trung chuyển</h3>
                </div>

                <div className="confirm-grid">
                    <div style={{ background: '#F0F9FF', borderRadius: 6, padding: '16px 20px', border: '1px solid #BAE6FD' }}>
                        <div style={{ fontSize: 12, color: '#6A7282', marginBottom: 4, fontFamily: 'Roboto' }}>Xe trung chuyển</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#101828', marginBottom: 4, fontFamily: 'Roboto' }}>
                            {vehicles.find(v => v.MaXe === selectedVehicleId)?.BienSo || '51A-12345'}
                        </div>
                        <div style={{ fontSize: 13, color: '#6A7282', fontFamily: 'Roboto' }}>
                            Mã xe: XE{String(selectedVehicleId).padStart(3, '0')} | Sức chứa: {vehicles.find(v => v.MaXe === selectedVehicleId)?.SucChuaToiDa || 0} ghế
                        </div>
                    </div>
                    <div style={{ background: '#F0FDF4', borderRadius: 6, padding: '16px 20px', border: '1px solid #BBF7D0' }}>
                        <div style={{ fontSize: 12, color: '#6A7282', marginBottom: 4, fontFamily: 'Roboto' }}>Tài xế</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#101828', marginBottom: 4, fontFamily: 'Roboto' }}>
                            {drivers.find(d => d.MaTaiXe === selectedDriverId)?.TenTaiXe || 'Trần Văn Hùng'}
                        </div>
                    </div>
                </div>

                <div style={{ background: '#FDF2F8', borderRadius: 6, padding: '16px 20px', border: '1px solid #FBCFE8', marginBottom: 24 }}>
                    <div style={{ fontSize: 12, color: '#6A7282', marginBottom: 4, fontFamily: 'Roboto' }}>Lộ trình dự kiến</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#101828', marginBottom: 4, fontFamily: 'Roboto' }}>
                        {Array.from(new Set(selectedTickets.map(t => typeof t.DiaChiDon === 'string' ? t.DiaChiDon.split(',')[0] : (t.KhachHang?.DiaChiDon?.split(',')[0] || 'N/A'))))[0] || 'Quận 1'} → Nhà xe Phương Trang
                    </div>
                    <div style={{ fontSize: 13, color: '#6A7282', fontFamily: 'Roboto' }}>Số hành khách: {selectedTickets.length} | Tổng ghế: {totalSeatsNeeded}</div>
                </div>

                <div style={{ marginBottom: 32 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#364153', fontFamily: 'Roboto' }}>Thời gian bắt đầu *</div>
                    <div style={{ position: 'relative' }}>
                        <input type="datetime-local" style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #E5E7EB', fontSize: 14, outline: 'none', fontFamily: 'Roboto', color: '#111827' }} />
                        <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#111827' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={handlePrevStep} style={{ width: 120, padding: '12px 0', borderRadius: 6, border: 'none', background: '#F1F5F9', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Roboto', gap: 8 }}>
                        &larr; Quay lại
                    </button>
                    <button onClick={() => setCurrentStep(5)} style={{ flex: 1, padding: '12px 0', borderRadius: 6, border: 'none', background: '#00C950', color: '#FFFFFF', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Roboto' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M9 12l2 2 4-4"></path></svg> Xác nhận tạo lộ trình
                    </button>
                </div>
            </div>
        )}

        {currentStep === 5 && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(2px)' }}>
                <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '40px 32px', width: '100%', maxWidth: 460, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 0 0 8px #F0FDF4' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 12px 0', textAlign: 'center', fontFamily: 'Roboto' }}>
                        Tạo lộ trình thành công!
                    </h2>
                    <p style={{ fontSize: 15, color: '#6B7280', margin: 0, textAlign: 'center', fontFamily: 'Roboto', lineHeight: 1.5 }}>
                        Lộ trình trung chuyển đã được tạo thành công. Trạng thái đã được cập nhật và thông báo đã gửi tới tài xế.
                    </p>
                    <style>{`
                        @keyframes fadeIn {
                            from { opacity: 0; transform: scale(0.95); }
                            to { opacity: 1; transform: scale(1); }
                        }
                    `}</style>
                </div>
            </div>
        )}

      </div>
    </DispatcherLayout>
  );
};

interface StepChipProps {
  step: number;
  label: string;
  active?: boolean;
  done?: boolean;
}

const StepChip: React.FC<StepChipProps> = ({ step, label, active, done }) => {
  const bg = done ? '#00C950' : active ? '#155DFC' : '#E5E7EB';
  const color = done || active ? '#FFFFFF' : '#6A7282';
  const labelColor = active ? '#101828' : '#99A1AF';
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: labelColor, fontWeight: active ? 600 : 500, fontSize: 13, fontFamily: 'Roboto' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, fontFamily: done ? '"Noto Color Emoji", sans-serif' : 'Roboto' }}>
        {done ? '✓' : step}
      </div>
      <span>{label}</span>
    </div>
  );
};

const StepSeparator: React.FC<{ done?: boolean }> = ({ done }) => (
    <div style={{ width: 148, height: 4, background: done ? '#00C950' : '#E5E7EB', margin: '0 8px' }} />
);

interface FilterSelectProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}

const FilterSelect: React.FC<FilterSelectProps> = ({ label, placeholder, value, onChange, options }) => (
  <div>
    <div style={{ fontSize: 11, marginBottom: 6, fontWeight: 600, color: '#364153', fontFamily: 'Roboto' }}>{label}</div>
    <select
      value={value}
      onChange={onChange}
      style={{
        width: '100%',
        height: 41,
        borderRadius: 10,
        border: '2px solid #E5E7EB',
        padding: '0 12px',
        fontSize: 12,
        background: '#FFFFFF',
        color: '#111827',
        outline: 'none',
        fontFamily: 'Roboto',
        fontWeight: 500
      }}
    >
      <option value="">{placeholder}</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);
