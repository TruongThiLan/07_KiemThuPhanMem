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
}

export const PlanRoutePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
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
      } catch (e: any) {
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
  const uniquePickupPoints = new Set(selectedTickets.map(t => t.DiaChiDon)).size;

  const handleNextStep = () => setCurrentStep(prev => prev + 1);
  const handlePrevStep = () => setCurrentStep(prev => prev - 1);

  // Mock filtering for step 1 demonstration
  const filteredTickets = tickets.filter(t => {
      if (khuVucDon && !t.DiaChiDon.includes(khuVucDon)) return false;
      if (nhaXeDich && t.DiaChiTra !== nhaXeDich) return false;
      if (khungGio && t.KhungGioTrungChuyen !== khungGio) return false;
      return true;
  });

  return (
    <DispatcherLayout activeSubTab="plan">
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, color: '#1E3A8A' }}>
        Lập kế hoạch lộ trình trung chuyển
      </h2>
      <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>Nhân viên: NV001 | Thời gian: {new Date().toLocaleString('vi-VN')}</div>

      {/* Thanh bước */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 12,
          padding: '24px 32px',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 800, margin: '0 auto' }}>
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
            <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Lọc danh sách khách hàng</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 24 }}>
                <FilterSelect label="Khu vực đón" placeholder="Tất cả điểm đón" value={khuVucDon} onChange={e => setKhuVucDon(e.target.value)} options={['Quận 1', 'Quận 3', 'Quận 5', 'Quận 10']} />
                <FilterSelect label="Nhà xe đích" placeholder="Tất cả nhà xe đích" value={nhaXeDich} onChange={e => setNhaXeDich(e.target.value)} options={['Nhà xe Phương Trang', 'Nhà xe Mai Linh']} />
                <FilterSelect label="Khung giờ trung chuyển" placeholder="Tất cả khung giờ" value={khungGio} onChange={e => setKhungGio(e.target.value)} options={['06:00 - 07:00', '07:00 - 08:00', '08:00 - 09:00']} />
                </div>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Danh sách khách hàng cần trung chuyển ({filteredTickets.length})</h3>
                </div>

                {error && <div style={{ marginBottom: 12, padding: 12, borderRadius: 8, background: '#FEE2E2', color: '#B91C1C', fontSize: 14 }}>{error}</div>}
                
                <div style={{ borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '40px 80px 180px 1fr 180px 140px 80px 140px', padding: '12px 16px', background: '#F8FAFC', fontWeight: 600, fontSize: 13, color: '#475569', borderBottom: '1px solid #E5E7EB' }}>
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
                    <div key={t.MaVe} style={{ display: 'grid', gridTemplateColumns: '40px 80px 180px 1fr 180px 140px 80px 140px', padding: '14px 16px', borderBottom: '1px solid #E5E7EB', fontSize: 14, alignItems: 'center', background: selectedIds.includes(t.MaVe) ? '#EFF6FF' : '#FFFFFF', transition: 'background-color 0.2s' }}>
                        <div><input type="checkbox" checked={selectedIds.includes(t.MaVe)} onChange={() => toggleTicket(t.MaVe)} style={{ width: 16, height: 16, cursor: 'pointer' }} /></div>
                        <div style={{ fontWeight: 600 }}>VE{String(t.MaVe).padStart(3, '0')}</div>
                        <div>{t.TenKhachHang}</div>
                        <div style={{ color: '#475569' }}>{t.DiaChiDon}</div>
                        <div style={{ color: '#475569' }}>{t.DiaChiTra}</div>
                        <div>{t.KhungGioTrungChuyen}</div>
                        <div style={{ color: '#2563EB', fontWeight: 600, background: '#EFF6FF', padding: '4px 8px', borderRadius: 4, display: 'inline-block', textAlign: 'center' }}>{t.SoLuongGhe}</div>
                        <div>
                        <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 999, background: '#FCE7F3', color: '#BE185D', fontSize: 12, fontWeight: 500 }}>{t.TrangThaiVe}</span>
                        </div>
                    </div>
                    ))
                )}
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div style={{ background: '#2563EB', borderRadius: 12, padding: 24, color: '#FFFFFF', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600 }}>Thông tin nhóm hành khách đã chọn</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 8 }}>
                            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Danh sách mã vé</div>
                            <div style={{ fontSize: 16, fontWeight: 600 }}>{selectedTickets.map(t => `VE${String(t.MaVe).padStart(3,'0')}`).join(', ')}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 8 }}>
                            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Tổng số lượng ghế</div>
                            <div style={{ fontSize: 24, fontWeight: 700 }}>{totalSeatsNeeded}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 8 }}>
                            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Số điểm đón</div>
                            <div style={{ fontSize: 24, fontWeight: 700 }}>{uniquePickupPoints}</div>
                        </div>
                    </div>
                    <button onClick={handleNextStep} style={{ width: '100%', padding: '14px 0', borderRadius: 8, border: 'none', background: '#FFFFFF', color: '#2563EB', fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        Tiếp theo: Chọn xe trung chuyển <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </button>
                </div>
            )}
        </>
      )}

      {currentStep === 2 && (
          <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="7" cy="15" r="1"></circle><circle cx="17" cy="15" r="1"></circle><path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"></path></svg>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Chọn xe trung chuyển</h3>
                </div>
                <div style={{ fontSize: 14, color: '#475569' }}>Cần: <span style={{ color: '#2563EB', fontWeight: 700 }}>{totalSeatsNeeded} ghế</span></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginBottom: 32 }}>
                {vehicles.map((v) => {
                    const capacity = v.SucChuaToiDa || 0;
                    // Mock empty seats logic
                    const emptySeats = capacity - (v.MaXe % 3 === 0 ? capacity - 1 : Math.floor(capacity / 2));
                    const isSelected = selectedVehicleId === v.MaXe;
                    const canFit = emptySeats >= totalSeatsNeeded;
                    const fillPercentage = Math.max(0, capacity - emptySeats) / capacity * 100;

                    return (
                        <div key={v.MaXe} onClick={() => canFit && setSelectedVehicleId(v.MaXe)} style={{ border: `2px solid ${isSelected ? '#2563EB' : '#E5E7EB'}`, borderRadius: 12, padding: 20, cursor: canFit ? 'pointer' : 'not-allowed', opacity: canFit ? 1 : 0.6, transition: 'all 0.2s', background: isSelected ? '#EFF6FF' : '#FFFFFF' }}>
                            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Mã xe</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: isSelected ? '#1E3A8A' : '#111827', marginBottom: 8 }}>XE{String(v.MaXe).padStart(3, '0')}</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#2563EB', marginBottom: 16 }}>Biển số: {v.BienSo}</div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8, color: '#475569' }}>
                                <span>Sức chứa tối đa</span>
                                <span style={{ fontWeight: 600, color: '#111827' }}>{capacity} ghế</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 16 }}>
                                <span style={{ color: '#475569' }}>Ghế trống</span>
                                <span style={{ fontWeight: 700, color: canFit ? '#10B981' : '#EF4444' }}>{emptySeats} ghế</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7280', marginBottom: 6 }}>
                                <span>Tỷ lệ lấp đầy</span>
                                <span>{Math.round(fillPercentage)}%</span>
                            </div>
                            <div style={{ width: '100%', height: 6, background: '#E5E7EB', borderRadius: 999, overflow: 'hidden' }}>
                                <div style={{ width: `${fillPercentage}%`, height: '100%', background: '#3B82F6', borderRadius: 999 }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
                <button onClick={handlePrevStep} style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: '#F1F5F9', color: '#475569', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> Quay lại
                </button>
                <button onClick={handleNextStep} disabled={!selectedVehicleId} style={{ flex: 1, padding: '12px 24px', borderRadius: 8, border: 'none', background: selectedVehicleId ? '#2563EB' : '#93C5FD', color: '#FFFFFF', fontSize: 15, fontWeight: 600, cursor: selectedVehicleId ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    Tiếp theo: Chọn tài xế {selectedVehicleId && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
                </button>
            </div>
          </div>
      )}

      {currentStep === 3 && (
          <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Chọn tài xế phù hợp</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16, marginBottom: 32 }}>
                {drivers.map((d) => {
                    const statusColors: Record<string, { bg: string, text: string, chipBg: string }> = {
                        'Rảnh': { bg: '#FFFFFF', text: '#111827', chipBg: '#D1FAE5' },
                        'Đang thực hiện chuyến': { bg: '#FAFAF9', text: '#A8A29E', chipBg: '#FCE7F3' },
                        'Đã được phân công': { bg: '#FAFAF9', text: '#A8A29E', chipBg: '#FEF3C7' },
                    };
                    const isAvailable = d.TrangThaiTaiXe === 'Rảnh';
                    const isSelected = selectedDriverId === d.MaTaiXe;
                    const style = statusColors[d.TrangThaiTaiXe] || statusColors['Rảnh'];

                    return (
                        <div key={d.MaTaiXe} onClick={() => isAvailable && setSelectedDriverId(d.MaTaiXe)} style={{ border: `2px solid ${isSelected ? '#2563EB' : '#E5E7EB'}`, borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: isAvailable ? 'pointer' : 'not-allowed', background: isSelected ? '#EFF6FF' : style.bg, transition: 'all 0.2s', opacity: isAvailable ? 1 : 0.6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: isSelected ? '#3B82F6' : (isAvailable ? '#10B981' : '#94A3B8'), color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 }}>
                                    {d.TenTaiXe.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: isSelected ? '#1E3A8A' : style.text, marginBottom: 4 }}>{d.TenTaiXe}</div>
                                    <div style={{ fontSize: 13, color: '#6B7280' }}>Mã: TX{String(d.MaTaiXe).padStart(3, '0')}</div>
                                </div>
                            </div>
                            <div style={{ padding: '4px 12px', borderRadius: 6, background: style.chipBg, color: isAvailable ? '#059669' : (d.TrangThaiTaiXe === 'Đang thực hiện chuyến' ? '#BE185D' : '#D97706'), fontSize: 12, fontWeight: 600 }}>
                                {d.TrangThaiTaiXe}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
                <button onClick={handlePrevStep} style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: '#F1F5F9', color: '#475569', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> Quay lại
                </button>
                <button onClick={handleNextStep} disabled={!selectedDriverId} style={{ flex: 1, padding: '12px 24px', borderRadius: 8, border: 'none', background: selectedDriverId ? '#2563EB' : '#93C5FD', color: '#FFFFFF', fontSize: 15, fontWeight: 600, cursor: selectedDriverId ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    Tiếp theo: Xác nhận tạo lộ trình {selectedDriverId && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
                </button>
            </div>
          </div>
      )}

      {currentStep === 4 && (
          <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, color: '#10B981' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#111827' }}>Xác nhận tạo lộ trình trung chuyển</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                  <div style={{ background: '#F8FAFC', borderRadius: 8, padding: 16, border: '1px solid #E5E7EB' }}>
                      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>Xe trung chuyển</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
                          {vehicles.find(v => v.MaXe === selectedVehicleId)?.BienSo || 'N/A'}
                      </div>
                      <div style={{ fontSize: 13, color: '#475569' }}>
                          Mã xe: XE{String(selectedVehicleId).padStart(3, '0')} | Sức chứa: {vehicles.find(v => v.MaXe === selectedVehicleId)?.SucChuaToiDa} ghế
                      </div>
                  </div>
                  <div style={{ background: '#F8FAFC', borderRadius: 8, padding: 16, border: '1px solid #E5E7EB' }}>
                      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>Tài xế</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
                          {drivers.find(d => d.MaTaiXe === selectedDriverId)?.TenTaiXe || 'N/A'}
                      </div>
                  </div>
              </div>

              <div style={{ background: '#FDF4FF', borderRadius: 8, padding: 16, border: '1px solid #FBCFE8', marginBottom: 24 }}>
                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>Lộ trình dự kiến</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
                      {uniquePickupPoints} điểm đón → Tới Nhà xe
                  </div>
                  <div style={{ fontSize: 13, color: '#475569' }}>Số hành khách: {selectedTickets.length} | Tổng ghế: {totalSeatsNeeded}</div>
              </div>

              <div style={{ marginBottom: 32 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#111827' }}>Thời gian bắt đầu *</div>
                  <div style={{ position: 'relative' }}>
                      <input type="datetime-local" style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 15, outline: 'none' }} />
                  </div>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                  <button onClick={handlePrevStep} style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: '#F1F5F9', color: '#475569', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> Quay lại
                  </button>
                  <button style={{ flex: 1, padding: '12px 24px', borderRadius: 8, border: 'none', background: '#10B981', color: '#FFFFFF', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Xác nhận tạo lộ trình
                  </button>
              </div>
          </div>
      )}

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
  const bg = done ? '#10B981' : active ? '#2563EB' : '#F3F4F6';
  const color = done ? '#FFFFFF' : (active ? '#FFFFFF' : '#6B7280');
  
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: done || active ? '#111827' : '#9CA3AF',
        fontWeight: done || active ? 600 : 400,
        fontSize: 14
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: bg,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 700
        }}
      >
        {done ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> : step}
      </div>
      <span>{label}</span>
    </div>
  );
};

const StepSeparator: React.FC<{ done?: boolean }> = ({ done }) => (
    <div style={{ flex: 1, height: 2, background: done ? '#10B981' : '#E5E7EB', margin: '0 16px', borderRadius: 2 }} />
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
    <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 500, color: '#475569' }}>{label}</div>
    <select
      value={value}
      onChange={onChange}
      style={{
        width: '100%',
        height: 40,
        borderRadius: 8,
        border: '1px solid #CBD5E1',
        padding: '0 12px',
        fontSize: 14,
        background: '#FFFFFF',
        color: '#111827',
        outline: 'none'
      }}
    >
      <option value="">{placeholder}</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);


