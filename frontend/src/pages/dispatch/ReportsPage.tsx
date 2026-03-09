import React, { useState } from 'react';
import { DispatcherLayout } from '../../components/DispatcherLayout';

interface ReportRow {
    Ngay: string;
    LoaiXe: string;
    KhuVuc: string;
    BienSoXe: string;
    TenTaiXe: string;
    TrangThai: string;
}

export const ReportsPage: React.FC = () => {
    // Mock data based on the screenshot since we don't have a clear reports endpoint
    const mockData: ReportRow[] = [
        { Ngay: '01-01-2025', LoaiXe: 'Xe 7 chỗ', KhuVuc: 'Liên Chiểu', BienSoXe: '43B.24680', TenTaiXe: 'Nguyễn Văn Hùng', TrangThai: 'Đúng giờ' },
        { Ngay: '02-01-2025', LoaiXe: 'Xe 7 chỗ', KhuVuc: 'Hòa Khánh', BienSoXe: '43B.24680', TenTaiXe: 'Trần Minh Tuấn', TrangThai: 'Trễ giờ' },
        { Ngay: '03-01-2025', LoaiXe: 'Xe 16 chỗ', KhuVuc: 'Ngũ Hành Sơn', BienSoXe: '43B.24690', TenTaiXe: 'Lê Quốc Bảo', TrangThai: 'Trễ giờ' },
        { Ngay: '04-01-2025', LoaiXe: 'Xe 7 chỗ', KhuVuc: 'Cẩm Lệ', BienSoXe: '43B.24680', TenTaiXe: 'Phạm Thanh Tùng', TrangThai: 'Đúng giờ' },
        { Ngay: '05-01-2025', LoaiXe: 'Xe 7 chỗ', KhuVuc: 'Sơn Trà', BienSoXe: '43B.24680', TenTaiXe: 'Hoàng Đức Long', TrangThai: 'Đúng giờ' },
        { Ngay: '06-01-2025', LoaiXe: 'Xe 7 chỗ', KhuVuc: 'Hòa Vang', BienSoXe: '43B.24680', TenTaiXe: 'Võ Anh Dũng', TrangThai: 'Trễ giờ' },
        { Ngay: '07-01-2025', LoaiXe: 'Xe 7 chỗ', KhuVuc: 'Hải Châu', BienSoXe: '43B.24680', TenTaiXe: 'Đặng Văn Phúc', TrangThai: 'Đúng giờ' }
    ];

    const [data] = useState<ReportRow[]>(mockData);

    const labelStyle: React.CSSProperties = {
        color: '#1E5FA8',
        fontWeight: 700,
        fontSize: 16,
        width: 100
    };

    const inputContainerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: 16
    };

    const inputStyle: React.CSSProperties = {
        flex: 1,
        padding: '10px 16px',
        borderRadius: 8,
        border: '1px solid #94A3B8',
        fontSize: 15,
        outline: 'none',
        minWidth: 200
    };

    return (
        <DispatcherLayout>
            <div style={{ background: '#fff', borderRadius: 8, padding: '24px 32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h2 style={{ textAlign: 'center', color: '#1E5FA8', fontSize: 28, fontWeight: 700, textTransform: 'uppercase', marginBottom: 32 }}>
                    BÁO CÁO TỔNG HỢP VẬN CHUYỂN
                </h2>

                {/* Filters */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px 48px', marginBottom: 24 }}>
                    <div style={inputContainerStyle}>
                        <span style={labelStyle}>Từ ngày</span>
                        <input type="date" style={inputStyle} defaultValue="2026-01-01" />
                    </div>
                    <div style={inputContainerStyle}>
                        <span style={labelStyle}>Loại xe</span>
                        <select style={inputStyle} defaultValue="Xe 16 chỗ">
                            <option value="">Tất cả</option>
                            <option value="Xe 7 chỗ">Xe 7 chỗ</option>
                            <option value="Xe 16 chỗ">Xe 16 chỗ</option>
                        </select>
                    </div>
                    <div style={inputContainerStyle}>
                        <span style={labelStyle}>Khu vực</span>
                        <select style={inputStyle} defaultValue="Ngũ Hành Sơn">
                            <option value="">Tất cả</option>
                            <option value="Liên Chiểu">Liên Chiểu</option>
                            <option value="Hòa Khánh">Hòa Khánh</option>
                            <option value="Ngũ Hành Sơn">Ngũ Hành Sơn</option>
                            <option value="Cẩm Lệ">Cẩm Lệ</option>
                            <option value="Sơn Trà">Sơn Trà</option>
                            <option value="Hải Châu">Hải Châu</option>
                        </select>
                    </div>

                    <div style={inputContainerStyle}>
                        <span style={labelStyle}>Đến ngày</span>
                        <input type="date" style={inputStyle} defaultValue="2026-01-31" />
                    </div>
                    <div style={inputContainerStyle}>
                        <span style={labelStyle}>Biển số xe</span>
                        <select style={inputStyle} defaultValue="43B.24690">
                            <option value="">Tất cả</option>
                            <option value="43B.24680">43B.24680</option>
                            <option value="43B.24690">43B.24690</option>
                        </select>
                    </div>
                    <div style={inputContainerStyle}>
                        <span style={labelStyle}>Tên tài xế</span>
                        <select style={inputStyle} defaultValue="Lê Quốc Bảo">
                            <option value="">Tất cả</option>
                            <option value="Nguyễn Văn Hùng">Nguyễn Văn Hùng</option>
                            <option value="Trần Minh Tuấn">Trần Minh Tuấn</option>
                            <option value="Lê Quốc Bảo">Lê Quốc Bảo</option>
                            <option value="Phạm Thanh Tùng">Phạm Thanh Tùng</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid #E5E7EB' }}>
                    <button style={{ background: '#2563EB', color: '#fff', padding: '10px 24px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        Xem báo cáo
                    </button>
                    <button style={{ background: '#2563EB', color: '#fff', padding: '10px 24px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                        Xuất file
                    </button>
                    <button style={{ background: '#2563EB', color: '#fff', padding: '10px 24px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                        Làm mới
                    </button>
                </div>

                {/* Table */}
                <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                    <div style={{ background: '#D2EAFF', display: 'grid', gridTemplateColumns: '80px 140px 140px 1fr 140px 1fr 120px', padding: '16px', fontWeight: 700, color: '#1E5FA8', textAlign: 'center' }}>
                        <div>STT</div>
                        <div>Ngày</div>
                        <div>Loại xe</div>
                        <div>Khu vực</div>
                        <div>Biển số xe</div>
                        <div>Tên Tài Xế</div>
                        <div>Trạng thái</div>
                    </div>

                    {data.map((row, idx) => (
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
                    ))}
                </div>
            </div>
        </DispatcherLayout>
    );
};
