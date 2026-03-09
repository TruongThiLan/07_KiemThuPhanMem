import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { DispatcherLayout } from '../../components/DispatcherLayout';

interface Customer {
    MaKhachHang: number;
    HoTen: string;
    SoDienThoai: string;
    DiaChi: string;
    DiemDen: string; // Tạm thời dùng DiemDen cho layout "Đến địa chỉ"
}

export const CustomersPage: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCustomers = async () => {
        setLoading(true);
        setError(null);
        try {
            // Dùng tickets vì hệ thống không có entity Khách hàng độc lập theo database scheme mà dùng Ticket
            const res = await api.get<any[]>('/tickets');
            // Nhóm khách hàng lại hoặc lấy danh sách từ ticket
            const uniqueCustomers = res.data.map(t => ({
                MaKhachHang: t.MaVe, // Tạm dùng MaVe
                HoTen: t.TenHanhKhach,
                SoDienThoai: t.SoDienThoai,
                DiaChi: t.DiemDon,
                DiemDen: t.TuyenDuong || 'Bến xe Đà Nẵng'
            }));
            setCustomers(uniqueCustomers);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Không thể tải danh sách khách hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    return (
        <DispatcherLayout>
            {error && (
                <div style={{ background: 'rgba(248,113,113,0.15)', borderRadius: 8, padding: '12px', marginBottom: 16, color: '#dc2626' }}>
                    {error}
                </div>
            )}

            <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ background: '#D2EAFF', display: 'grid', gridTemplateColumns: '80px 160px 200px 160px 1fr 1fr 120px', padding: '16px', fontWeight: 600, color: '#1E293B' }}>
                    <div style={{ textAlign: 'center' }}>STT</div>
                    <div style={{ textAlign: 'center' }}>Mã khách hàng</div>
                    <div>Họ và tên</div>
                    <div style={{ textAlign: 'center' }}>Số điện thoại</div>
                    <div>Từ địa chỉ</div>
                    <div>Đến địa chỉ</div>
                    <div style={{ textAlign: 'center' }}>Hành động</div>
                </div>

                {loading ? (
                    <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>Đang tải...</div>
                ) : customers.length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>Chưa có dữ liệu khách hàng</div>
                ) : (
                    customers.map((c, index) => (
                        <div key={index} style={{ display: 'grid', gridTemplateColumns: '80px 160px 200px 160px 1fr 1fr 120px', padding: '16px', borderTop: '1px solid #E5E7EB', fontSize: 14, alignItems: 'center', color: '#334155' }}>
                            <div style={{ textAlign: 'center' }}>{index + 1}</div>
                            <div style={{ textAlign: 'center', fontWeight: 500 }}>{`KH${String(index + 1).padStart(8, '0')}`}</div>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>{c.HoTen}</div>
                            <div style={{ textAlign: 'center', fontWeight: 500 }}>{c.SoDienThoai}</div>
                            <div>{c.DiaChi}</div>
                            <div>{c.DiemDen}</div>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </DispatcherLayout>
    );
};
