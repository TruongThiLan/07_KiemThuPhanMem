import React, { useState } from 'react';
import { DispatcherLayout } from '../../components/DispatcherLayout';

interface ReportRow {
    Ngay: string;
    LoaiXe: string;
    KhuVuc: string;
    BienSoXe: string;
    TenTaiXe: string;
    TrangThai: string;
    SoKhach?: number;
}

export const ReportsPage: React.FC = () => {
    const mockData: ReportRow[] = [
        { Ngay: '01-01-2025', LoaiXe: 'Xe 7 chỗ', KhuVuc: 'Liên Chiểu', BienSoXe: '43B.24680', TenTaiXe: 'Nguyễn Văn Hùng', TrangThai: 'Đúng giờ', SoKhach: 6 },
        { Ngay: '02-01-2025', LoaiXe: 'Xe 7 chỗ', KhuVuc: 'Hòa Khánh', BienSoXe: '43B.24680', TenTaiXe: 'Trần Minh Tuấn', TrangThai: 'Trễ giờ', SoKhach: 5 },
        { Ngay: '03-01-2025', LoaiXe: 'Xe 16 chỗ', KhuVuc: 'Ngũ Hành Sơn', BienSoXe: '43B.24690', TenTaiXe: 'Lê Quốc Bảo', TrangThai: 'Trễ giờ', SoKhach: 14 },
        { Ngay: '04-01-2025', LoaiXe: 'Xe 7 chỗ', KhuVuc: 'Cẩm Lệ', BienSoXe: '43B.24680', TenTaiXe: 'Phạm Thanh Tùng', TrangThai: 'Đúng giờ', SoKhach: 7 },
        { Ngay: '05-01-2025', LoaiXe: 'Xe 7 chỗ', KhuVuc: 'Sơn Trà', BienSoXe: '43B.24680', TenTaiXe: 'Hoàng Đức Long', TrangThai: 'Đúng giờ', SoKhach: 4 },
        { Ngay: '06-01-2025', LoaiXe: 'Xe 7 chỗ', KhuVuc: 'Hòa Vang', BienSoXe: '43B.24680', TenTaiXe: 'Võ Anh Dũng', TrangThai: 'Trễ giờ', SoKhach: 7 },
        { Ngay: '07-01-2025', LoaiXe: 'Xe 7 chỗ', KhuVuc: 'Hải Châu', BienSoXe: '43B.24680', TenTaiXe: 'Đặng Văn Phúc', TrangThai: 'Đúng giờ', SoKhach: 6 },
        { Ngay: '07-01-2025', LoaiXe: 'Xe 16 chỗ', KhuVuc: 'Hải Châu', BienSoXe: '43B.24690', TenTaiXe: 'Đặng Văn Phúc', TrangThai: 'Đúng giờ', SoKhach: 15 }
    ];

    const [tuNgay, setTuNgay] = useState('');
    const [denNgay, setDenNgay] = useState('');
    const [loaiXe, setLoaiXe] = useState('');
    const [khuVuc, setKhuVuc] = useState('');
    const [bienSoXe, setBienSoXe] = useState('');
    const [tenTaiXe, setTenTaiXe] = useState('');

    const [filteredData, setFilteredData] = useState<ReportRow[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = () => {
        if (!tuNgay && !denNgay && !loaiXe && !khuVuc && !bienSoXe && !tenTaiXe) {
            alert('Vui lòng chọn ít nhất một thông tin lọc!');
            return;
        }

        let result = mockData;

        if (tuNgay) {
            const [y, m, d] = tuNgay.split('-');
            if (y && m && d) {
                const formattedDate = `${d}-${m}-${y}`;
                result = result.filter(r => r.Ngay >= formattedDate);
            }
        }
        if (denNgay) {
            const [y, m, d] = denNgay.split('-');
            if (y && m && d) {
                const formattedDate = `${d}-${m}-${y}`;
                result = result.filter(r => r.Ngay <= formattedDate);
            }
        }
        if (loaiXe) result = result.filter(r => r.LoaiXe === loaiXe);
        if (khuVuc) result = result.filter(r => r.KhuVuc === khuVuc);
        if (bienSoXe) result = result.filter(r => r.BienSoXe === bienSoXe);
        if (tenTaiXe) result = result.filter(r => r.TenTaiXe === tenTaiXe);

        setFilteredData(result);
        setHasSearched(true);
    };

    const handleRefresh = () => {
        setTuNgay('');
        setDenNgay('');
        setLoaiXe('');
        setKhuVuc('');
        setBienSoXe('');
        setTenTaiXe('');
        setFilteredData([]);
        setHasSearched(false);
    };

    const labelStyle: React.CSSProperties = {
        color: '#0C476F',
        fontSize: 15,
        fontWeight: 600,
        whiteSpace: 'nowrap'
    };

    const inputStyle: React.CSSProperties = {
        height: 44,
        padding: '0 12px',
        background: 'white',
        borderRadius: 8,
        border: '1px solid #D1D5DB',
        color: '#374151',
        fontSize: 14,
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s'
    };

    return (
        <DispatcherLayout>
            <div style={{ background: '#fff', borderRadius: 8, padding: '24px 32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h2 style={{ textAlign: 'center', color: '#1E5FA8', fontSize: 28, fontWeight: 700, textTransform: 'uppercase', marginBottom: 40 }}>
                    BÁO CÁO TỔNG HỢP VẬN CHUYỂN
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px 48px', marginBottom: 24 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={labelStyle}>Từ ngày</span>
                        <input type="date" value={tuNgay} onChange={e => setTuNgay(e.target.value)} style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={labelStyle}>Loại xe</span>
                        <select value={loaiXe} onChange={e => setLoaiXe(e.target.value)} style={inputStyle}>
                            <option value="">Tất cả</option>
                            <option value="Xe 7 chỗ">Xe 7 chỗ</option>
                            <option value="Xe 16 chỗ">Xe 16 chỗ</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={labelStyle}>Khu vực</span>
                        <select value={khuVuc} onChange={e => setKhuVuc(e.target.value)} style={inputStyle}>
                            <option value="">Tất cả</option>
                            <option value="Liên Chiểu">Liên Chiểu</option>
                            <option value="Hòa Khánh">Hòa Khánh</option>
                            <option value="Ngũ Hành Sơn">Ngũ Hành Sơn</option>
                            <option value="Cẩm Lệ">Cẩm Lệ</option>
                            <option value="Sơn Trà">Sơn Trà</option>
                            <option value="Hải Châu">Hải Châu</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={labelStyle}>Đến ngày</span>
                        <input type="date" value={denNgay} onChange={e => setDenNgay(e.target.value)} style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={labelStyle}>Biển số xe</span>
                        <select value={bienSoXe} onChange={e => setBienSoXe(e.target.value)} style={inputStyle}>
                            <option value="">Tất cả</option>
                            <option value="43B.24680">43B.24680</option>
                            <option value="43B.24690">43B.24690</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={labelStyle}>Tên tài xế</span>
                        <select value={tenTaiXe} onChange={e => setTenTaiXe(e.target.value)} style={inputStyle}>
                            <option value="">Tất cả</option>
                            <option value="Nguyễn Văn Hùng">Nguyễn Văn Hùng</option>
                            <option value="Trần Minh Tuấn">Trần Minh Tuấn</option>
                            <option value="Lê Quốc Bảo">Lê Quốc Bảo</option>
                            <option value="Phạm Thanh Tùng">Phạm Thanh Tùng</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #E5E7EB' }}>
                    <button onClick={handleSearch} style={{ background: '#2563EB', color: '#fff', padding: '10px 20px', fontSize: 14, borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        Xem báo cáo
                    </button>
                    <button style={{ background: '#2563EB', color: '#fff', padding: '10px 20px', fontSize: 14, borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                        Xuất file
                    </button>
                    <button onClick={handleRefresh} style={{ background: '#2563EB', color: '#fff', padding: '10px 20px', fontSize: 14, borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                        Làm mới
                    </button>
                </div>

                {hasSearched && filteredData.length > 0 && (
                    <div style={{ marginBottom: 32 }}>
                        <h3 style={{ color: '#0C476F', fontSize: 18, fontWeight: 700, marginBottom: 16, textTransform: 'uppercase' }}>Thống kê tổng hợp</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                            {[
                                { label: 'Tổng số chuyến', value: filteredData.length, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>, color: '#2563eb', bg: '#eff6ff' },
                                { label: 'Số xe hoạt động', value: new Set(filteredData.map(r => r.BienSoXe)).size, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="7" cy="15" r="1" /><circle cx="17" cy="15" r="1" /><path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" /></svg>, color: '#059669', bg: '#ecfdf5' },
                                { label: 'Tài xế tham gia', value: new Set(filteredData.map(r => r.TenTaiXe)).size, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>, color: '#d97706', bg: '#fffbeb' },
                                {
                                    label: 'Nhiều chuyến nhất', value: (() => {
                                        const counts = filteredData.reduce((acc, row) => { acc[row.TenTaiXe] = (acc[row.TenTaiXe] || 0) + 1; return acc; }, {} as Record<string, number>);
                                        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
                                    })(), icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>, color: '#7c3aed', bg: '#f5f3ff', flex: '1 1 250px'
                                },
                                { label: '% Đúng giờ', value: `${((filteredData.filter(r => r.TrangThai === 'Đúng giờ').length / filteredData.length) * 100).toFixed(0)}%`, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>, color: '#10b981', bg: '#ecfdf5' },
                                { label: 'Khách / chuyến', value: (filteredData.reduce((sum, row) => sum + (row.SoKhach || 0), 0) / filteredData.length).toFixed(1), icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>, color: '#0284c7', bg: '#f0f9ff' },
                                { label: 'Số chuyến trễ', value: filteredData.filter(r => r.TrangThai === 'Trễ giờ').length, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>, color: '#e11d48', bg: '#fff1f2' }
                            ].map((stat, idx) => (
                                <div key={idx} style={{ flex: stat.flex || '1 1 150px', background: stat.bg, padding: '16px 20px', borderRadius: 12, border: `1px solid ${stat.color}30`, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <div style={{ background: 'white', padding: 10, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                        {stat.icon}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <span style={{ color: '#475569', fontSize: 13, fontWeight: 600 }}>{stat.label}</span>
                                        <span style={{ color: stat.color, fontSize: 22, fontWeight: 800 }}>{stat.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #E5E7EB', minHeight: 400 }}>
                    <div style={{ background: '#D2EAFF', display: 'grid', gridTemplateColumns: '80px 140px 140px 1fr 140px 1fr 120px', padding: '16px', fontWeight: 700, color: '#1E5FA8', textAlign: 'center' }}>
                        <div>STT</div>
                        <div>Ngày</div>
                        <div>Loại xe</div>
                        <div>Khu vực</div>
                        <div>Biển số xe</div>
                        <div>Tên Tài Xế</div>
                        <div>Trạng thái</div>
                    </div>

                    {!hasSearched ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320, color: '#64748b', fontSize: 16 }}>
                            Vui lòng chọn thông tin lọc để xem báo cáo.
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320, color: '#64748b', fontSize: 16 }}>
                            Không tìm thấy dữ liệu báo cáo nào phù hợp với bộ lọc.
                        </div>
                    ) : (
                        filteredData.map((row, idx) => (
                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '80px 140px 140px 1fr 140px 1fr 120px', padding: '16px', borderTop: '1px solid #E5E7EB', fontSize: 14, textAlign: 'center', alignItems: 'center', color: '#334155' }}>
                                <div style={{ fontWeight: 600, color: '#000' }}>{idx + 1}</div>
                                <div>{row.Ngay}</div>
                                <div>{row.LoaiXe}</div>
                                <div>{row.KhuVuc}</div>
                                <div>{row.BienSoXe}</div>
                                <div>{row.TenTaiXe}</div>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <span style={{
                                        background: row.TrangThai === 'Đúng giờ' ? '#dcfce7' : '#fecdd3',
                                        color: row.TrangThai === 'Đúng giờ' ? '#16a34a' : '#e11d48',
                                        padding: '4px 16px',
                                        borderRadius: 999,
                                        fontSize: 13,
                                        fontWeight: 500
                                    }}>
                                        {row.TrangThai}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DispatcherLayout>
    );
};
