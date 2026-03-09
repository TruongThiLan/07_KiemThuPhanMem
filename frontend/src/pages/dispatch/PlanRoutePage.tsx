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
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<TicketRow[]>('/tickets', {
          params: { status: 'Cần trung chuyển' }
        });
        setTickets(res.data);
      } catch (e: any) {
        setError('Không tải được danh sách vé cần trung chuyển');
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

  return (
    <DispatcherLayout activeSubTab="plan">
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
        Lập kế hoạch lộ trình trung chuyển
      </h2>

      {/* Thanh bước */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 10,
          border: '1px solid #E5E7EB',
          padding: 16,
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', gap: 24 }}>
          <StepChip step={1} label="Chọn khách hàng" active done />
          <StepChip step={2} label="Chọn xe" />
          <StepChip step={3} label="Chọn tài xế" />
          <StepChip step={4} label="Xác nhận" />
        </div>
        <div style={{ fontSize: 14, color: '#6B7280' }}>Nhân viên: NV0001 | Thời gian: ...</div>
      </div>

      {/* Bộ lọc + bảng khách */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 10,
          border: '1px solid #E5E7EB',
          padding: 16
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
          Lọc danh sách khách hàng
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 16,
            marginBottom: 16
          }}
        >
          <FilterSelect label="Khu vực đón" placeholder="Tất cả điểm đón" />
          <FilterSelect label="Nhà xe đích" placeholder="Tất cả nhà xe đích" />
          <FilterSelect label="Khung giờ trung chuyển" placeholder="Tất cả khung giờ" />
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          Danh sách khách hàng cần trung chuyển
        </h3>

        {error && (
          <div
            style={{
              marginBottom: 8,
              padding: '6px 10px',
              borderRadius: 6,
              background: 'rgba(248,113,113,0.15)',
              color: '#B91C1C',
              fontSize: 14
            }}
          >
            {error}
          </div>
        )}
        <div
          style={{
            borderRadius: 10,
            border: '1px solid #E5E7EB',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '40px 80px 160px 220px 180px 120px 80px 140px',
              padding: '10px 12px',
              background: '#EFF6FF',
              fontWeight: 600,
              fontSize: 14
            }}
          >
            <div />
            <div>Mã vé</div>
            <div>Tên khách hàng</div>
            <div>Điểm đón</div>
            <div>Nhà xe đích</div>
            <div>Khung giờ</div>
            <div>Số ghế</div>
            <div>Trạng thái</div>
          </div>
          {loading ? (
            <div style={{ padding: 12 }}>Đang tải danh sách vé...</div>
          ) : tickets.length === 0 ? (
            <div style={{ padding: 12 }}>Không có vé cần trung chuyển.</div>
          ) : (
            tickets.map((t) => (
              <div
                key={t.MaVe}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 80px 160px 220px 180px 120px 80px 140px',
                  padding: '8px 12px',
                  borderTop: '1px solid #E5E7EB',
                  fontSize: 14,
                  alignItems: 'center',
                  background: selectedIds.includes(t.MaVe) ? '#EFF6FF' : '#FFFFFF'
                }}
              >
                <div>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(t.MaVe)}
                    onChange={() => toggleTicket(t.MaVe)}
                  />
                </div>
                <div>{t.MaVe}</div>
                <div>{t.TenKhachHang}</div>
                <div>{t.DiaChiDon}</div>
                <div>{t.DiaChiTra}</div>
                <div>{t.KhungGioTrungChuyen}</div>
                <div>{t.SoLuongGhe}</div>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: '#FEF3C7',
                    color: '#92400E'
                  }}
                >
                  {t.TrangThaiVe}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
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
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              border: 'none',
              background: '#1E5FA8',
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
            disabled={selectedIds.length === 0}
          >
            {selectedIds.length === 0
              ? 'Chọn khách hàng để tiếp tục'
              : `Tiếp tục (${selectedIds.length} vé đã chọn)`}
          </button>
        </div>
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
  const bg = done ? '#1E5FA8' : active ? '#DBEAFE' : '#F3F4F6';
  const color = done ? '#FFFFFF' : '#111827';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 14px',
        borderRadius: 999,
        background: bg,
        color,
        fontSize: 14
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: done ? '#FFFFFF' : '#E5E7EB',
          color: done ? '#1E5FA8' : '#111827',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 600
        }}
      >
        {step}
      </span>
      <span>{label}</span>
    </div>
  );
};

interface FilterSelectProps {
  label: string;
  placeholder: string;
}

const FilterSelect: React.FC<FilterSelectProps> = ({ label, placeholder }) => (
  <div>
    <div style={{ fontSize: 14, marginBottom: 4 }}>{label}</div>
    <select
      style={{
        width: '100%',
        height: 40,
        borderRadius: 8,
        border: '1px solid #D1D5DB',
        padding: '0 10px',
        fontSize: 14,
        background: '#FFFFFF'
      }}
      defaultValue=""
    >
      <option value="" disabled>
        {placeholder}
      </option>
    </select>
  </div>
);

const mockTickets = [
  {
    code: 'VE0001',
    name: 'Lê Thanh Nam',
    pickup: 'Quận 5',
    operator: 'Nhà xe Phương Trang',
    slot: '06:00 - 07:00',
    seats: 1
  },
  {
    code: 'VE0002',
    name: 'Hoàng Minh Đức',
    pickup: 'Quận 1',
    operator: 'Nhà xe An Phú',
    slot: '06:00 - 07:00',
    seats: 2
  }
];

