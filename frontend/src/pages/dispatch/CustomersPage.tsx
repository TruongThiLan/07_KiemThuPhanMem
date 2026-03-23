import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { DispatcherLayout } from '../../components/DispatcherLayout';

interface Customer {
    MaKhachHang: number;
    HoTen: string;
    SoDienThoai: string;
    DiaChi: string;
    DiemDen: string;
}

export const CustomersPage: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modals state
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Edit Form state
    const [editForm, setEditForm] = useState({ hoten: '', sdt: '', diachi: '', diemden: '' });
    const [phoneError, setPhoneError] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const fetchCustomers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get<Record<string, unknown>[]>('/tickets');
            const uniqueCustomers = res.data.map(t => ({
                MaKhachHang: t.MaVe as number,
                HoTen: t.TenHanhKhach as string || '',
                SoDienThoai: t.SoDienThoai as string || '',
                DiaChi: t.DiemDon as string || '',
                DiemDen: (t.TuyenDuong as string) || 'Bến xe Đà Nẵng'
            }));
            setCustomers(uniqueCustomers);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }, message?: string };
            setError(err?.response?.data?.message ?? 'Không thể tải danh sách khách hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // Helpers
    const formatCustomerId = (id: number) => `KH${String(id).padStart(8, '0')}`;

    // Handlers
    const handleEditClick = (c: Customer) => {
        setEditingCustomer(c);
        setEditForm({
            hoten: c.HoTen,
            sdt: c.SoDienThoai,
            diachi: c.DiaChi,
            diemden: c.DiemDen
        });
        setPhoneError(false);
    };

    const handleDeleteClick = (c: Customer) => {
        setDeletingCustomer(c);
    };

    const handleSaveEdit = async () => {
        if (!editingCustomer) return;
        
        // Validate phone
        if (!/^0\d{9}$/.test(editForm.sdt)) {
            setPhoneError(true);
            return;
        }
        setPhoneError(false);
        setIsSaving(true);
        
        try {
            // Simulate API call or make real API call
            // await api.put(`/customers/${editingCustomer.MaKhachHang}`, editForm);
            await new Promise(r => setTimeout(r, 600)); // Fake latency
            
            // Update local state
            setCustomers(prev => prev.map(c => 
                c.MaKhachHang === editingCustomer.MaKhachHang 
                    ? { ...c, HoTen: editForm.hoten, SoDienThoai: editForm.sdt, DiaChi: editForm.diachi, DiemDen: editForm.diemden } 
                    : c
            ));
            
            setEditingCustomer(null);
            setNotification({ type: 'success', message: 'Cập nhật thông tin khách hàng thành công' });
        } catch {
            setNotification({ type: 'error', message: 'Cập nhật thông tin không thành công' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingCustomer) return;
        try {
            // Fake API call
            await new Promise(r => setTimeout(r, 600));
            setCustomers(prev => prev.filter(c => c.MaKhachHang !== deletingCustomer.MaKhachHang));
            setDeletingCustomer(null);
            setNotification({ type: 'success', message: 'Xóa thông tin khách hàng thành công' });
        } catch {
            setDeletingCustomer(null);
            setNotification({ type: 'error', message: 'Xóa khách hàng không thành công' });
        }
    };

    return (
        <DispatcherLayout>
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
                ) : error ? (
                    <div style={{ padding: 32, textAlign: 'center', color: '#ef4444' }}>{error}</div>
                ) : customers.length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>Chưa có dữ liệu khách hàng</div>
                ) : (
                    customers.map((c, index) => (
                        <div key={index} style={{ display: 'grid', gridTemplateColumns: '80px 160px 200px 160px 1fr 1fr 120px', padding: '16px', borderTop: '1px solid #E5E7EB', fontSize: 14, alignItems: 'center', color: '#334155' }}>
                            <div style={{ textAlign: 'center' }}>{index + 1}</div>
                            <div style={{ textAlign: 'center', fontWeight: 500 }}>{formatCustomerId(c.MaKhachHang)}</div>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>{c.HoTen}</div>
                            <div style={{ textAlign: 'center', fontWeight: 500 }}>{c.SoDienThoai}</div>
                            <div>{c.DiaChi}</div>
                            <div>{c.DiemDen}</div>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                                <button onClick={() => handleEditClick(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                <button onClick={() => handleDeleteClick(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal: Chỉnh sửa thông tin */}
            {editingCustomer && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ width: 1060, height: 648, background: '#fff', padding: '51px 49px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', boxSizing: 'border-box' }}>
                        <button 
                            onClick={() => setEditingCustomer(null)}
                            style={{ position: 'absolute', top: 41, right: 41, background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        
                        <div style={{ fontFamily: 'Roboto', fontStyle: 'normal', fontWeight: 700, fontSize: 30, lineHeight: '35px', color: '#000000', marginBottom: 34 }}>
                            Chỉnh sửa thông tin
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            {/* Cột trái */}
                            <div style={{ width: 414, display: 'flex', flexDirection: 'column', gap: 41 }}>
                                <div style={{ height: 131 }}>
                                    <label style={{ display: 'block', margin: 0, padding: 0, fontFamily: 'Roboto', fontStyle: 'normal', fontWeight: 400, fontSize: 30, lineHeight: '35px', color: '#000000' }}>
                                        Mã khách hàng
                                    </label>
                                    <input 
                                        type="text" 
                                        disabled 
                                        value={formatCustomerId(editingCustomer.MaKhachHang)}
                                        style={{ marginTop: 8, width: '100%', height: 74, boxSizing: 'border-box', background: 'rgba(217, 217, 217, 0.5)', border: '1px solid rgba(0, 0, 0, 0.6)', borderRadius: 10, padding: '0 37px', fontFamily: 'Roboto', fontStyle: 'normal', fontWeight: 400, fontSize: 25, color: '#000000' }} 
                                    />
                                </div>
                                <div style={{ height: 131 }}>
                                    <label style={{ display: 'block', margin: 0, padding: 0, fontFamily: 'Roboto', fontStyle: 'normal', fontWeight: 400, fontSize: 30, lineHeight: '35px', color: '#000000' }}>
                                        Họ và tên
                                    </label>
                                    <input 
                                        type="text" 
                                        value={editForm.hoten}
                                        onChange={e => setEditForm({...editForm, hoten: e.target.value})}
                                        style={{ marginTop: 8, width: '100%', height: 74, boxSizing: 'border-box', background: '#FFFFFF', border: '1px solid rgba(0, 0, 0, 0.6)', borderRadius: 10, padding: '0 37px', fontFamily: 'Roboto', fontStyle: 'normal', fontWeight: 400, fontSize: 30, color: '#000000' }} 
                                    />
                                </div>
                                <div style={{ height: 131 }}>
                                    <label style={{ display: 'block', margin: 0, padding: 0, fontFamily: 'Roboto', fontStyle: 'normal', fontWeight: 400, fontSize: 30, lineHeight: '35px', color: '#000000' }}>
                                        Số điện thoại
                                    </label>
                                    <input 
                                        type="text" 
                                        value={editForm.sdt}
                                        onChange={e => {
                                            setEditForm({...editForm, sdt: e.target.value});
                                            setPhoneError(false);
                                        }}
                                        style={{ marginTop: 8, width: '100%', height: 74, boxSizing: 'border-box', background: phoneError ? '#fce8e8' : '#FFFFFF', border: phoneError ? '2px solid #ef4444' : '1px solid rgba(0, 0, 0, 0.6)', borderRadius: 10, padding: '0 37px', fontFamily: 'Roboto', fontStyle: 'normal', fontWeight: 400, fontSize: 30, color: '#000000' }} 
                                    />
                                    {phoneError && (
                                        <div style={{ color: '#ef4444', fontSize: 14, marginTop: 4 }}>
                                            Số điện thoại không hợp lệ !!!
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Cột phải */}
                            <div style={{ width: 407, display: 'flex', flexDirection: 'column', gap: 41 }}>
                                <div style={{ height: 131 }}>
                                    <label style={{ display: 'block', margin: 0, padding: 0, fontFamily: 'Roboto', fontStyle: 'normal', fontWeight: 400, fontSize: 30, lineHeight: '35px', color: '#000000' }}>
                                        Từ địa chỉ
                                    </label>
                                    <input 
                                        type="text" 
                                        value={editForm.diachi}
                                        onChange={e => setEditForm({...editForm, diachi: e.target.value})}
                                        style={{ marginTop: 8, width: '100%', height: 74, boxSizing: 'border-box', background: '#FFFFFF', border: '1px solid rgba(0, 0, 0, 0.6)', borderRadius: 10, padding: '0 37px', fontFamily: 'Roboto', fontStyle: 'normal', fontWeight: 400, fontSize: 25, color: '#000000' }} 
                                    />
                                </div>
                                <div style={{ height: 131 }}>
                                    <label style={{ display: 'block', margin: 0, padding: 0, fontFamily: 'Roboto', fontStyle: 'normal', fontWeight: 400, fontSize: 30, lineHeight: '35px', color: '#000000' }}>
                                        Đến địa chỉ
                                    </label>
                                    <input 
                                        type="text" 
                                        value={editForm.diemden}
                                        onChange={e => setEditForm({...editForm, diemden: e.target.value})}
                                        style={{ marginTop: 8, width: '100%', height: 74, boxSizing: 'border-box', background: '#FFFFFF', border: '1px solid rgba(0, 0, 0, 0.6)', borderRadius: 10, padding: '0 37px', fontFamily: 'Roboto', fontStyle: 'normal', fontWeight: 400, fontSize: 25, color: '#000000' }} 
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: 19, height: 64, marginTop: 29 }}>
                                    <button 
                                        onClick={handleSaveEdit}
                                        disabled={isSaving}
                                        style={{ width: 194, height: 64, background: '#1E5FA8', color: '#FFFFFF', borderRadius: 10, border: 'none', fontFamily: 'Roboto', fontStyle: 'normal', fontWeight: 700, fontSize: 24, lineHeight: '28px', textAlign: 'center', cursor: 'pointer', opacity: isSaving ? 0.7 : 1, padding: 0 }}
                                    >
                                        Lưu
                                    </button>
                                    <button 
                                        onClick={() => setEditingCustomer(null)}
                                        style={{ width: 194, height: 64, background: '#FFFFFF', color: '#000000', borderRadius: 10, border: '1px solid rgba(0, 0, 0, 0.5)', fontFamily: 'Roboto', fontStyle: 'normal', fontWeight: 700, fontSize: 24, lineHeight: '28px', textAlign: 'center', cursor: 'pointer', boxSizing: 'border-box', padding: 0 }}
                                    >
                                        Hủy bỏ
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Xác nhận xóa */}
            {deletingCustomer && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ width: 440, background: '#fff', borderRadius: 16, padding: '40px 32px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <div style={{ width: 72, height: 72, background: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                        </div>
                        <h2 style={{ margin: '0 0 32px 0', fontSize: 24, fontWeight: 700, color: '#000' }}>
                            Bạn muốn xóa khách hàng này?
                        </h2>
                        <div style={{ display: 'flex', gap: 16, width: '100%' }}>
                            <button 
                                onClick={handleConfirmDelete}
                                style={{ flex: 1, padding: '14px 0', background: '#2563eb', color: '#fff', borderRadius: 8, border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
                            >
                                Xác nhận
                            </button>
                            <button 
                                onClick={() => setDeletingCustomer(null)}
                                style={{ flex: 1, padding: '14px 0', background: '#fff', color: '#000', borderRadius: 8, border: '1px solid #9ca3af', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Thông báo (Success / Error) */}
            {notification && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
                    <div style={{ width: 440, background: '#fff', borderRadius: 16, padding: '40px 32px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        {notification.type === 'error' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                                <h2 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#000', fontFamily: 'Roboto' }}>
                                    Thông báo
                                </h2>
                            </div>
                        ) : (
                            <h2 style={{ margin: '0 0 24px 0', fontSize: 32, fontWeight: 700, color: '#000', fontFamily: 'Roboto', textAlign: 'center' }}>
                                Thông báo
                            </h2>
                        )}
                        
                        <p style={{ margin: '0 0 40px 0', fontSize: 24, color: '#000', textAlign: 'center', fontFamily: 'Roboto', fontWeight: 400 }}>
                            {notification.message}
                        </p>
                        
                        <button 
                            onClick={() => setNotification(null)}
                            style={{ width: 140, height: 48, background: '#2B6EB5', color: '#fff', borderRadius: 10, border: 'none', fontSize: 20, fontWeight: 700, cursor: 'pointer', fontFamily: 'Roboto' }}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </DispatcherLayout>
    );
};
