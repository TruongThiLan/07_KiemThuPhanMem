import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { DispatcherLayout } from '../../components/DispatcherLayout';

interface Driver {
    MaTaiXe: number;
    HoTen: string;
    SoDienThoai: string;
    CCCD: string;
    LoaiBangLai: string;
    TrangThaiTaiXe: string;
}

export const DispatcherDriversPage: React.FC = () => {
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
        <DispatcherLayout>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: 24
                }}
            >
                <button
                    onClick={() => setShowAdd(true)}
                    style={{
                        background: '#1E5FA8',
                        color: '#fff',
                        padding: '10px 24px',
                        borderRadius: 8,
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}
                >
                    <span style={{ fontSize: 18 }}>+</span> Thêm tài xế
                </button>
            </div>

            {error && (
                <div
                    style={{
                        background: 'rgba(248,113,113,0.15)',
                        borderRadius: 8,
                        padding: '8px 12px',
                        marginBottom: 12,
                        color: '#dc2626'
                    }}
                >
                    {error}
                </div>
            )}

            <div
                style={{
                    background: '#fff',
                    borderRadius: 8,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                }}
            >
                <div
                    style={{
                        background: '#D2EAFF',
                        display: 'grid',
                        gridTemplateColumns: '60px 140px 1fr 140px 180px 140px 160px 100px',
                        padding: '16px',
                        fontWeight: 600,
                        color: '#1E293B',
                        textAlign: 'center'
                    }}
                >
                    <div>STT</div>
                    <div>Mã NV</div>
                    <div style={{ textAlign: 'left' }}>Họ tên</div>
                    <div>SĐT</div>
                    <div>CCCD/CMND</div>
                    <div>Loại bằng lái</div>
                    <div>Trạng thái</div>
                    <div>Hành động</div>
                </div>

                {loading ? (
                    <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>Đang tải...</div>
                ) : drivers.length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>Chưa có dữ liệu tài xế</div>
                ) : (
                    drivers.map((d, index) => (
                        <div
                            key={d.MaTaiXe}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '60px 140px 1fr 140px 180px 140px 160px 100px',
                                padding: '16px',
                                borderTop: '1px solid #E5E7EB',
                                fontSize: 14,
                                alignItems: 'center',
                                textAlign: 'center',
                                color: '#334155'
                            }}
                        >
                            <div>{index + 1}</div>
                            <div>{`NV${String(d.MaTaiXe).padStart(8, '0')}`}</div>
                            <div style={{ textAlign: 'left' }}>{d.HoTen}</div>
                            <div>{d.SoDienThoai}</div>
                            <div>{d.CCCD}</div>
                            <div>{d.LoaiBangLai}</div>
                            <div>{d.TrangThaiTaiXe}</div>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showAdd && (
                <AddDriverModal
                    onClose={() => setShowAdd(false)}
                    onSuccess={() => {
                        setShowAdd(false);
                        fetchDrivers();
                    }}
                />
            )}
        </DispatcherLayout>
    );
};

interface AddDriverModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const AddDriverModal: React.FC<AddDriverModalProps> = ({ onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [cccd, setCccd] = useState('');
    const [licenseType, setLicenseType] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name || !phone || !cccd) {
            setError('Họ tên, SĐT, CCCD là bắt buộc');
            return;
        }

        setLoading(true);
        try {
            await api.post('/drivers', {
                HoTen: name,
                SoDienThoai: phone,
                CCCD: cccd,
                LoaiBangLai: licenseType || null,
                TrangThaiTaiXe: 'Chưa bắt đầu'
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
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 50
            }}
        >
            <div
                style={{
                    width: 500,
                    background: '#fff',
                    borderRadius: 8,
                    padding: 32,
                    position: 'relative'
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        right: 20,
                        top: 20,
                        border: 'none',
                        background: 'none',
                        fontSize: 20,
                        cursor: 'pointer',
                        color: '#64748b'
                    }}
                >
                    ✕
                </button>

                <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, color: '#0f172a' }}>Thêm tài xế mới</h2>

                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#334155' }}>Họ tên</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }}
                            placeholder="Nhập họ tên"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#334155' }}>Số điện thoại</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }}
                            placeholder="Nhập số điện thoại"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#334155' }}>Số CCCD/CMND</label>
                        <input
                            type="text"
                            value={cccd}
                            onChange={(e) => setCccd(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }}
                            placeholder="Nhập số CCCD"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#334155' }}>Loại bằng lái</label>
                        <input
                            type="text"
                            value={licenseType}
                            onChange={(e) => setLicenseType(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }}
                            placeholder="Nhập loại bằng lái (VD: B2, C1...)"
                        />
                    </div>

                    {error && <div style={{ color: '#ef4444', fontSize: 14 }}>{error}</div>}

                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ flex: 1, padding: '12px', background: '#1E5FA8', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? 'Đang lưu...' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
