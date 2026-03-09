import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { DispatcherLayout } from '../../components/DispatcherLayout';

interface Vehicle {
    MaXe: number;
    BienSo: string;
    LoaiXe: string;
    SucChuaToiDa: number;
    TrangThaiXe: string;
}

export const VehiclesPage: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchVehicles = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get<Vehicle[]>('/vehicles');
            setVehicles(res.data);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Không thể tải danh sách xe trung chuyển');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Hoạt động':
            case 'Rảnh':
                return { bg: '#dcfce7', text: '#16a34a' };
            case 'Bảo trì':
                return { bg: '#fef08a', text: '#ca8a04' };
            default:
                return { bg: '#f1f5f9', text: '#475569' };
        }
    };

    return (
        <DispatcherLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1E293B' }}>Quản lý xe trung chuyển</h2>
                <button
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
                    <span style={{ fontSize: 18 }}>+</span> Thêm xe trung chuyển
                </button>
            </div>

            {error && (
                <div style={{ background: 'rgba(248,113,113,0.15)', borderRadius: 8, padding: '12px', marginBottom: 16, color: '#dc2626' }}>
                    {error}
                </div>
            )}

            <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ background: '#D2EAFF', display: 'grid', gridTemplateColumns: '80px 180px 180px 180px 180px 180px 1fr', padding: '16px', fontWeight: 600, color: '#1E293B', textAlign: 'center' }}>
                    <div>STT</div>
                    <div>Mã xe</div>
                    <div>Biển số xe</div>
                    <div>Loại xe</div>
                    <div>Số chỗ</div>
                    <div>Trạng thái</div>
                    <div>Hành động</div>
                </div>

                {loading ? (
                    <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>Đang tải...</div>
                ) : vehicles.length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>Chưa có dữ liệu xe</div>
                ) : (
                    vehicles.map((v, index) => {
                        const statusColor = getStatusColor(v.TrangThaiXe);
                        return (
                            <div key={v.MaXe} style={{ display: 'grid', gridTemplateColumns: '80px 180px 180px 180px 180px 180px 1fr', padding: '16px', borderTop: '1px solid #E5E7EB', fontSize: 14, alignItems: 'center', textAlign: 'center', color: '#334155' }}>
                                <div>{index + 1}</div>
                                <div>{`XE${String(v.MaXe).padStart(8, '0')}`}</div>
                                <div>{v.BienSo}</div>
                                <div>{v.LoaiXe}</div>
                                <div>{v.SucChuaToiDa}</div>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <span style={{ background: statusColor.bg, color: statusColor.text, padding: '4px 12px', borderRadius: 999, fontSize: 13, fontWeight: 500 }}>
                                        {v.TrangThaiXe}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    </button>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </DispatcherLayout>
    );
};
