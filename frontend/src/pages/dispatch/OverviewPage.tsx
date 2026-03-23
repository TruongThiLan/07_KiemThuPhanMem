import React, { useEffect, useState } from 'react';
import { DispatcherLayout } from '../../components/DispatcherLayout';
import { api } from '../../api/client';

interface OverviewStats {
  pendingTickets: number;
  runningRoutes: number;
  availableVehicles: number;
  availableDrivers: number;
  todayTotal: number;
  todayPending: number;
  todayCompleted: number;
  todayCompletionRate: number;
}

interface LoTrinh {
  MaLoTrinh: number;
  LoTrinhDuKien: string;
  TrangThaiLoTrinh: string;
  ThoiGianBatDau: string;
  MaXe: number;
  MaTaiXe: number;
  Xe?: { BienSo?: string; [key: string]: unknown };
  TaiXe?: { HoTen?: string; [key: string]: unknown };
}

interface KhachHang {
  TenKhachHang: string;
  DiaChiDon: string;
  DiaChiTra: string;
  SoLuongGhe: number;
}

export const OverviewPage: React.FC = () => {
  const [stats, setStats] = useState<OverviewStats>({
    pendingTickets: 0,
    runningRoutes: 0,
    availableVehicles: 0,
    availableDrivers: 0,
    todayTotal: 0,
    todayPending: 0,
    todayCompleted: 0,
    todayCompletionRate: 0,
  });

  const [runningRoutes, setRunningRoutes] = useState<LoTrinh[]>([]);
  const [pendingCustomers, setPendingCustomers] = useState<KhachHang[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsRes, routesRes, vehiclesRes, driversRes] = await Promise.all([
          api.get('/tickets', { params: { status: 'Cần trung chuyển' } }),
          api.get('/routes'),
          api.get('/vehicles'),
          api.get('/drivers')
        ]);

        const pendingTickets = ticketsRes.data || [];
        const routes: LoTrinh[] = routesRes.data || [];
        const vehicles = vehiclesRes.data || [];
        const drivers = driversRes.data || [];

        // Tính toán thống kê hôm nay
        const todayRoutes = routes; 
        const completed = todayRoutes.filter(r => r.TrangThaiLoTrinh === 'Hoàn thành').length;
        const pending = todayRoutes.filter(r => r.TrangThaiLoTrinh === 'Chưa thực hiện').length;
        const total = todayRoutes.length;
        
        setStats({
          pendingTickets: pendingTickets.length,
          runningRoutes: routes.filter(r => r.TrangThaiLoTrinh === 'Đang thực hiện').length,
          availableVehicles: vehicles.filter((v: { TrangThaiXe?: string }) => v.TrangThaiXe === 'Rảnh').length,
          availableDrivers: drivers.filter((d: { TrangThaiTaiXe?: string }) => d.TrangThaiTaiXe === 'Rảnh').length,
          todayTotal: total,
          todayPending: pending,
          todayCompleted: completed,
          todayCompletionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        });

        // Map lộ trình đang chạy + tài xế và xe
        const running = routes
          .filter(r => r.TrangThaiLoTrinh === 'Đang thực hiện')
          .slice(0, 5);
          
        const runningWithDetails = running.map(r => ({
          ...r,
          Xe: vehicles.find((v: { MaXe?: number; BienSo?: string }) => v.MaXe === r.MaXe),
          TaiXe: drivers.find((d: { MaTaiXe?: number; HoTen?: string }) => d.MaTaiXe === r.MaTaiXe)
        }));
        setRunningRoutes(runningWithDetails);

        // Lọc khách hàng chờ
        const pendingCusts = pendingTickets.slice(0, 5).map((t: { TenKhachHang?: string, KhachHang?: { TenKhachHang?: string, DiaChiDon?: string, DiaChiTra?: string }, DiaChiDon?: string, DiaChiTra?: string, SoLuongGhe?: number }) => ({
           TenKhachHang: t.TenKhachHang || t.KhachHang?.TenKhachHang || 'Khách hàng ẩn danh',
           DiaChiDon: t.DiaChiDon || t.KhachHang?.DiaChiDon || 'Bến xe Trung tâm Đà Nẵng',
           DiaChiTra: t.DiaChiTra || t.KhachHang?.DiaChiTra || 'Điểm nội thành',
           SoLuongGhe: t.SoLuongGhe || 1
        }));
        setPendingCustomers(pendingCusts);

      } catch (e) {
        console.error("Lỗi lấy dữ liệu Overview:", e);
      }
    };
    fetchData();
  }, []);

  return (
    <DispatcherLayout activeSubTab="overview">
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 0', fontFamily: 'Roboto, sans-serif' }}>
        
        {/* 4 Thẻ thống kê */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <StatCard 
            title="Cần trung chuyển" 
            value={stats.pendingTickets} 
            subtitle="khách hàng chờ" 
            gradient="linear-gradient(135deg, #FF6900 0%, #F54900 100%)" 
            iconColor="#FFEDD4"
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
          />
          <StatCard 
            title="Đang thực hiện" 
            value={stats.runningRoutes} 
            subtitle="lộ trình đang chạy" 
            gradient="linear-gradient(135deg, #2B7FFF 0%, #155DFC 100%)" 
            iconColor="#DBEAFE"
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>}
          />
          <StatCard 
            title="Xe sẵn sàng" 
            value={stats.availableVehicles} 
            subtitle="xe sẵn sàng" 
            gradient="linear-gradient(135deg, #00C950 0%, #00A63E 100%)" 
            iconColor="#B9F8CF"
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>}
          />
          <StatCard 
            title="Tài xế rảnh" 
            value={stats.availableDrivers} 
            subtitle="tài xế sẵn sàng" 
            gradient="linear-gradient(135deg, #AD46FF 0%, #9810FA 100%)" 
            iconColor="#F3E8FF"
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>}
          />
        </div>

        {/* Cột dữ liệu chính */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
          
          {/* Cột trái: Lộ Trình Đang Diễn Ra */}
          <div style={{ background: '#FFFFFF', border: '1px solid #F3F4F6', borderRadius: 14, padding: 20, boxShadow: '0px 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#155DFC', fontWeight: 'bold' }}>⚡</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#101828', margin: 0 }}>Lộ trình đang diễn ra</h3>
                <span style={{ background: '#DBEAFE', color: '#1447E6', padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{stats.runningRoutes}</span>
              </div>
              <a href="#" style={{ fontSize: 14, color: '#155DFC', fontWeight: 600, textDecoration: 'none' }}>Xem tất cả →</a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
              {runningRoutes.length === 0 ? (
                 <div style={{ padding: 16, textAlign: 'center', color: '#6A7282' }}>Không có lộ trình nào đang chạy vào lúc này.</div>
              ) : runningRoutes.map((route, idx) => (
                <div key={idx} style={{ background: '#F0FDF4', border: '1px solid #BEDBFF', borderRadius: 10, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#101828', fontSize: 16 }}>{route.LoTrinhDuKien?.split(' - ')[0] || `Vận chuyển tự động`} (ID: {route.MaLoTrinh})</div>
                      <div style={{ fontSize: 12, color: '#6A7282', marginTop: 4 }}>Bắt đầu: {route.ThoiGianBatDau ? new Date(route.ThoiGianBatDau).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '06:00'}</div>
                    </div>
                    <div style={{ background: '#155DFC', color: '#FFF', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, height: 'fit-content' }}>Đang chạy</div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div style={{ background: '#FFF', padding: '10px 12px', borderRadius: 6 }}>
                      <div style={{ fontSize: 12, color: '#6A7282' }}>Xe</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#101828', marginTop: 4 }}>{route.Xe?.BienSo || 'Tìm xe...'}</div>
                    </div>
                    <div style={{ background: '#FFF', padding: '10px 12px', borderRadius: 6 }}>
                      <div style={{ fontSize: 12, color: '#6A7282' }}>Tài xế</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#101828', marginTop: 4 }}>{route.TaiXe?.HoTen || 'Đang cập nhật...'}</div>
                    </div>
                  </div>
                  
                  <div style={{ background: '#FFF', padding: '10px 14px', borderRadius: 6 }}>
                    <div style={{ fontSize: 12, color: '#6A7282', marginBottom: 4 }}>📍 Lộ trình thực tế</div>
                    <div style={{ fontSize: 14, color: '#101828' }}>{route.LoTrinhDuKien}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cột phải: Chờ Xử Lý */}
          <div style={{ background: '#FFFFFF', border: '1px solid #F3F4F6', borderRadius: 14, padding: 20, boxShadow: '0px 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#101828', margin: 0 }}>👥 Chờ xử lý</h3>
                <span style={{ background: '#FFEDD4', color: '#CA3500', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{stats.pendingTickets}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
              {pendingCustomers.length === 0 ? (
                 <div style={{ padding: 16, textAlign: 'center', color: '#6A7282' }}>Hệ thống trống, chưa có đơn chờ.</div>
              ) : pendingCustomers.map((cust, idx) => (
                <div key={idx} style={{ background: '#F3F4F6', border: '1px solid #FFD6A7', borderRadius: 10, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#101828' }}>{cust.TenKhachHang}</div>
                    <div style={{ background: '#FFD6A7', color: '#9F2D00', padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{cust.SoLuongGhe} ghế</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#4A5565' }}>
                    <div style={{ maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cust.DiaChiDon}</div>
                    <div style={{ color: '#6A7282' }}>Hôm nay</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Thống kê KPI ngày hôm nay */}
        <div style={{ background: '#FFFFFF', border: '1px solid #F3F4F6', borderRadius: 14, padding: 20, boxShadow: '0px 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#101828', margin: '0 0 20px 0' }}>Thống kê lộ trình hôm nay</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <div style={{ background: '#FAF5FF', borderRadius: 10, padding: '24px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#101828' }}>{stats.todayTotal}</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#4A5565', marginTop: 6 }}>Tổng lộ trình</div>
            </div>
            <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '24px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#155DFC' }}>{stats.todayPending}</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#4A5565', marginTop: 6 }}>Chưa thực hiện</div>
            </div>
            <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '24px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#00A63E' }}>{stats.todayCompleted}</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#4A5565', marginTop: 6 }}>Hoàn thành</div>
            </div>
            <div style={{ background: '#FAF5FF', borderRadius: 10, padding: '24px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#9810FA' }}>{stats.todayCompletionRate}%</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#4A5565', marginTop: 6 }}>Tỷ lệ hoàn thành</div>
            </div>
          </div>
        </div>

      </div>
    </DispatcherLayout>
  );
};

// -------------------------------------------------------------
// Component Thẻ Thống Kê Mềm mại (StatCard)
// -------------------------------------------------------------
function StatCard({ title, value, subtitle, gradient, iconColor, icon }: { title: string, value: number, subtitle: string, gradient: string, iconColor: string, icon?: React.ReactNode }) {
  return (
    <div style={{ 
      background: gradient, 
      borderRadius: 14, 
      padding: 20, 
      color: '#FFF', 
      boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ fontSize: 14, color: iconColor }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: 700, margin: '8px 0' }}>{value}</div>
      <div style={{ fontSize: 12, color: iconColor }}>{subtitle}</div>
      
      {/* Icon ảo đè mờ (glassmorphism overlay mode) */}
      <div style={{ 
        position: 'absolute', 
        top: 20, right: 20, 
        width: 48, height: 48, 
        background: 'rgba(255,255,255,0.2)', 
        backdropFilter: 'blur(4px)',
        borderRadius: 10, 
        display: 'flex', alignItems: 'center', justifyContent: 'center' 
      }}>
        {icon || <div style={{ width: 24, height: 24, border: '2px solid #FFF', borderRadius: '50%' }}></div>}
      </div>
    </div>
  );
}
