import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

interface Driver {
  MaTaiXe: number;
  HoTen: string;
  SoDienThoai: string;
  CCCD: string;
  LoaiBangLai: string;
  TrangThaiTaiXe: string;
}

export const DriversPage: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Driver[]>('/drivers');
      setDrivers(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Không thể tải danh sách tài xế');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        background: '#F9FAFB',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <header
        style={{
          height: 60,
          background: '#D2EAFF',
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 41,
              height: 38,
              background: '#1E5FA8',
              borderRadius: 10
            }}
          />
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            <span style={{ color: '#0A3B73' }}>ben</span>
            <span style={{ color: '#F39C12' }}>xedanang</span>
            <span>.</span>
            <span style={{ color: '#0A3B73' }}>vn</span>
          </div>
        </div>
      </header>

      <nav
        style={{
          height: 56,
          background: '#1E5FA8',
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px',
          gap: 64,
          color: '#fff'
        }}
      >
        <span>Điều phối lộ trình</span>
        <span>Quản lý xe</span>
        <span style={{ color: '#F39C12', fontWeight: 700 }}>Quản lý tài xế</span>
        <span>Quản lý khách hàng</span>
        <span>Báo cáo</span>
      </nav>

      <main style={{ padding: 32, flex: 1 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 24
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>Quản lý tài xế</h2>
          <button
            onClick={() => setShowAdd(true)}
            style={{
              background: '#1E5FA8',
              color: '#fff',
              padding: '10px 24px',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            + Thêm tài xế
          </button>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(248,113,113,0.15)',
              borderRadius: 8,
              padding: '8px 12px',
              marginBottom: 12
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            background: '#fff',
            borderRadius: 10,
            boxShadow: '0px 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              background: '#D2EAFF',
              display: 'grid',
              gridTemplateColumns: '60px 140px 200px 170px 200px 140px 160px',
              padding: '12px 16px',
              fontWeight: 700
            }}
          >
            <div>STT</div>
            <div>Mã NV</div>
            <div>Họ tên</div>
            <div>SĐT</div>
            <div>CCCD/CMND</div>
            <div>Loại bằng lái</div>
            <div>Trạng thái</div>
          </div>

          {loading ? (
            <div style={{ padding: 16 }}>Đang tải...</div>
          ) : (
            drivers.map((d, index) => (
              <div
                key={d.MaTaiXe}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 140px 200px 170px 200px 140px 160px',
                  padding: '12px 16px',
                  borderTop: '1px solid #E5E7EB',
                  fontSize: 16
                }}
              >
                <div>{index + 1}</div>
                <div>{`NV${String(d.MaTaiXe).padStart(8, '0')}`}</div>
                <div>{d.HoTen}</div>
                <div>{d.SoDienThoai}</div>
                <div>{d.CCCD}</div>
                <div>{d.LoaiBangLai}</div>
                <div>{d.TrangThaiTaiXe}</div>
              </div>
            ))
          )}
        </div>
      </main>

      {showAdd && (
        <AddDriverModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            setShowAdd(false);
            fetchDrivers();
          }}
        />
      )}
    </div>
  );
};

interface AddDriverModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddDriverModal: React.FC<AddDriverModalProps> = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [phone, setPhone] = useState('');
  const [cccd, setCccd] = useState('');
  const [licenseType, setLicenseType] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !employeeCode || !phone || !cccd) {
      setError('Họ tên, Mã NV, SĐT, CCCD là bắt buộc');
      return;
    }
    if (!/^0\d{9}$/.test(phone)) {
      setError('Số điện thoại không hợp lệ (10 chữ số, bắt đầu bằng 0)');
      return;
    }
    if (!/^\d{12}$/.test(cccd)) {
      setError('CCCD/CMND không hợp lệ (12 chữ số)');
      return;
    }

    setLoading(true);
    try {
      await api.post('/drivers', {
        HoTen: name,
        SoDienThoai: phone,
        CCCD: cccd,
        LoaiBangLai: licenseType || null,
        TrangThaiTaiXe: 'Rảnh'
      });
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Không thể thêm tài xế');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50
      }}
    >
      <div
        style={{
          width: 640,
          maxWidth: '95%',
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            right: 24,
            top: 24,
            width: 24,
            height: 24,
            border: 'none',
            background: 'none',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>

        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Thêm mới tài xế</h2>

        <form
          onSubmit={handleSave}
          style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 8 }}
        >
          <div>
            <label style={{ fontSize: 16 }}>Họ tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.6)',
                padding: '10px 12px',
                fontSize: 16
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 16 }}>Mã NV</label>
            <input
              type="text"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              style={{
                width: '100%',
                borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.6)',
                padding: '10px 12px',
                fontSize: 16
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 16 }}>Số điện thoại</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.6)',
                padding: '10px 12px',
                fontSize: 16
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 16 }}>Số CCCD/CMND</label>
            <input
              type="text"
              value={cccd}
              onChange={(e) => setCccd(e.target.value)}
              style={{
                width: '100%',
                borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.6)',
                padding: '10px 12px',
                fontSize: 16
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 16 }}>Loại bằng lái</label>
            <input
              type="text"
              value={licenseType}
              onChange={(e) => setLicenseType(e.target.value)}
              style={{
                width: '100%',
                borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.6)',
                padding: '10px 12px',
                fontSize: 16
              }}
            />
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(248,113,113,0.15)',
                borderRadius: 8,
                padding: '8px 12px'
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 10,
                border: 'none',
                background: '#1E5FA8',
                color: '#fff',
                fontSize: 18,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {loading ? 'Đang lưu...' : 'Lưu tài xế'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.5)',
                background: '#fff',
                fontSize: 18,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Hủy bỏ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

