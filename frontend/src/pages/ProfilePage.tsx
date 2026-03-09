import React from 'react';
import { DispatcherLayout } from '../components/DispatcherLayout';

export const ProfilePage: React.FC = () => {
  const rawUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : null;

  return (
    <DispatcherLayout>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 16,
          color: '#0F172A'
        }}
      >
        Thông tin cá nhân
      </h2>
      {user ? (
        <div
          style={{
            maxWidth: 480,
            background: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E5E7EB',
            boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
            padding: 20,
            display: 'grid',
            rowGap: 10
          }}
        >
          <div>
            <strong>Tên đăng nhập: </strong>
            {user.TenDangNhap}
          </div>
          <div>
            <strong>Vai trò: </strong>
            {user.VaiTro || '--'}
          </div>
          <div>
            <strong>Số điện thoại: </strong>
            {user.SoDienThoai || '--'}
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: '#6B7280' }}>
            Thông tin chi tiết tài khoản được quản lý trên hệ thống web chính của nhà xe.
          </div>
        </div>
      ) : (
        <div>Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.</div>
      )}
    </DispatcherLayout>
  );
};

