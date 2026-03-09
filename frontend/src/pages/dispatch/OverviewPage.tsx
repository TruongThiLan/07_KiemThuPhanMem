import React, { useEffect, useState } from 'react';
import { DispatcherLayout } from '../../components/DispatcherLayout';
import { api } from '../../api/client';

interface OverviewStats {
  pendingTickets: number;
  runningRoutes: number;
  availableVehicles: number;
  availableDrivers: number;
}

interface SimpleRoute {
  MaLoTrinh: number;
  LoTrinhDuKien: string | null;
  TrangThaiLoTrinh: string;
}

export const OverviewPage: React.FC = () => {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [currentRoute, setCurrentRoute] = useState<SimpleRoute | null>(null);
  const [pendingNames, setPendingNames] = useState<string[]>([]);

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
        const routes = routesRes.data || [];
        const vehicles = vehiclesRes.data || [];
        const drivers = driversRes.data || [];

        const runningRoute =
          routes.find((r: any) => r.TrangThaiLoTrinh === 'Đang thực hiện') || null;

        setStats({
          pendingTickets: pendingTickets.length,
          runningRoutes: routes.filter((r: any) => r.TrangThaiLoTrinh === 'Đang thực hiện').length,
          availableVehicles: vehicles.filter((v: any) => v.TrangThaiXe === 'Rảnh').length,
          availableDrivers: drivers.filter((d: any) => d.TrangThaiTaiXe === 'Rảnh').length
        });

        setCurrentRoute(runningRoute);
        setPendingNames(pendingTickets.slice(0, 3).map((t: any) => t.TenKhachHang));
      } catch (e) {
        // giữ UI hoạt động kể cả khi lỗi; số liệu sẽ là null
      }
    };

    fetchData();
  }, []);

  return (
    <DispatcherLayout activeSubTab="overview">
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Tổng quan</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 16,
          marginBottom: 24
        }}
      >
        <OverviewCard
          title="Cần trung chuyển"
          value={stats ? String(stats.pendingTickets) : '...'}
          color="#F97316"
        />
        <OverviewCard
          title="Đang thực hiện"
          value={stats ? String(stats.runningRoutes) : '...'}
          color="#3B82F6"
        />
        <OverviewCard
          title="Xe sẵn sàng"
          value={stats ? String(stats.availableVehicles) : '...'}
          color="#22C55E"
        />
        <OverviewCard
          title="Tài xế rảnh"
          value={stats ? String(stats.availableDrivers) : '...'}
          color="#A855F7"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 16
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 10,
            border: '1px solid #E5E7EB',
            padding: 16
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            Lộ trình đang diễn ra
          </h3>
          <div
            style={{
              borderRadius: 10,
              border: '1px solid #E5E7EB',
              padding: 12
            }}
          >
            {currentRoute ? (
              <>
                <div style={{ fontWeight: 600 }}>
                  Lộ trình #{currentRoute.MaLoTrinh}
                </div>
                <div>{currentRoute.LoTrinhDuKien || 'Chưa có mô tả lộ trình'}</div>
                <div>Trạng thái: {currentRoute.TrangThaiLoTrinh}</div>
              </>
            ) : (
              <div>Chưa có lộ trình đang thực hiện.</div>
            )}
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
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Chờ xử lý</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {pendingNames.length === 0 ? (
              <li>Không có khách hàng cần trung chuyển.</li>
            ) : (
              pendingNames.map((name) => <li key={name}>{name}</li>)
            )}
          </ul>
        </div>
      </div>
    </DispatcherLayout>
  );
};

interface OverviewCardProps {
  title: string;
  value: string;
  color: string;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ title, value, color }) => (
  <div
    style={{
      background: color,
      color: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      boxShadow: '0px 4px 10px rgba(0,0,0,0.15)'
    }}
  >
    <div style={{ fontSize: 14, opacity: 0.9 }}>{title}</div>
    <div style={{ marginTop: 8, fontSize: 28, fontWeight: 700 }}>{value}</div>
  </div>
);

