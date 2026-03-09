import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface DriverLayoutProps {
  children: React.ReactNode;
}

export const DriverLayout: React.FC<DriverLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openUserMenu, setOpenUserMenu] = React.useState(false);

  const handleLogout = () => {
    const ok = window.confirm('Bạn có chắc muốn đăng xuất không?');
    if (!ok) return;
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const tabStyle = (path: string) => {
    const active = location.pathname.startsWith(path);
    return {
      padding: '12px 24px',
      cursor: 'pointer',
      color: active ? '#F39C12' : '#FFFFFF',
      fontWeight: active ? 600 : 500,
      fontSize: 15,
      borderBottom: active ? '3px solid #F39C12' : '3px solid transparent',
      whiteSpace: 'nowrap'
    } as React.CSSProperties;
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        minHeight: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* Background bến xe với độ hiển thị ~50% */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: "url('/images/background.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.5,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          minHeight: '100vh',
          background: 'linear-gradient(180deg, rgba(248,250,251,0.3) 0%, rgba(248,250,251,0.2) 60%, rgba(248,250,251,0.3) 100%)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <header
          style={{
            height: 60,
            background: 'rgba(210,234,255,0.96)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            boxShadow: '0 1px 3px rgba(15,23,42,0.12)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 40,
                height: 36,
                background: '#1E5FA8',
                borderRadius: 10
              }}
            />
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              <span style={{ color: '#0A3B73' }}>ben</span>
              <span style={{ color: '#F39C12' }}>xedanang</span>
              <span style={{ color: '#0A3B73' }}>.vn</span>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setOpenUserMenu((v) => !v)}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '2px solid #1E5FA8',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: 16, color: '#1E5FA8', fontWeight: 700 }}>U</span>
            </button>
            {openUserMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: 8,
                  width: 200,
                  background: '#FFFFFF',
                  borderRadius: 10,
                  boxShadow: '0 8px 24px rgba(15,23,42,0.2)',
                  border: '1px solid #E5E7EB',
                  overflow: 'hidden',
                  zIndex: 20
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setOpenUserMenu(false);
                    navigate('/profile');
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: 'none',
                    background: '#FFFFFF',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 14
                  }}
                >
                  Quản lý thông tin cá nhân
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenUserMenu(false);
                    handleLogout();
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: 'none',
                    background: '#FFFFFF',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 14
                  }}
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </header>

        <nav
          style={{
            background: '#1E5FA8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 160,
            padding: '6px 24px 10px',
            overflowX: 'auto',
            boxShadow: '0 1px 3px rgba(15,23,42,0.18)'
          }}
        >
          <Link to="/driver/trips/assigned" style={{ textDecoration: 'none' }}>
            <div style={tabStyle('/driver/trips/assigned')}>Danh sách chuyến được phân công</div>
          </Link>
          <Link to="/driver/trips/completed" style={{ textDecoration: 'none' }}>
            <div style={tabStyle('/driver/trips/completed')}>Danh sách chuyến đã hoàn thành</div>
          </Link>
          <Link to="/driver/trips/cancelled" style={{ textDecoration: 'none' }}>
            <div style={tabStyle('/driver/trips/cancelled')}>Danh sách chuyến đã hủy</div>
          </Link>
        </nav>

        <main
          style={{
            flex: 1,
            padding: '24px 24px 32px',
            maxWidth: 1300,
            width: '100%',
            alignSelf: 'center'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

