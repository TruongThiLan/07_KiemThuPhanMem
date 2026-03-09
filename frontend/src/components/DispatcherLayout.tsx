import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface DispatcherLayoutProps {
  children: React.ReactNode;
  activeSubTab?: 'overview' | 'plan' | 'adjust' | 'track';
}

export const DispatcherLayout: React.FC<DispatcherLayoutProps> = ({
  children,
  activeSubTab = 'overview'
}) => {
  const navigate = useNavigate();
  const [openUserMenu, setOpenUserMenu] = React.useState(false);

  const handleLogout = () => {
    const ok = window.confirm('Bạn có chắc muốn đăng xuất không?');
    if (!ok) return;
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const mainTabStyle = (active: boolean) => ({
    padding: '16px 32px',
    cursor: 'pointer',
    color: active ? '#F39C12' : '#FFFFFF',
    fontSize: 16,
    fontWeight: 500
  });

  const subTabBase: React.CSSProperties = {
    padding: '8px 20px',
    borderRadius: 999,
    fontSize: 14,
    cursor: 'pointer'
  };

  const subTabStyle = (key: DispatcherLayoutProps['activeSubTab']) => {
    const active = key === activeSubTab;
    return {
      ...subTabBase,
      background: active ? '#1E5FA8' : '#FFFFFF',
      color: active ? '#FFFFFF' : '#1E2939',
      border: active ? 'none' : '1px solid #E5E7EB'
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
      {/* Background hình bến xe với độ hiển thị ~50% */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: "url('/images/bx-danang.png')",
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
          background: 'rgba(249,250,251,0.92)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Top header */}
        <header
          style={{
            height: 60,
            background: 'rgba(210,234,255,0.95)',
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

        {/* Main nav */}
        <nav
          style={{
            height: 56,
            background: 'rgba(30,95,168,0.95)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Link to="/dispatch/overview" style={{ textDecoration: 'none' }}>
            <div style={mainTabStyle(window.location.pathname.startsWith('/dispatch/overview') || window.location.pathname.startsWith('/dispatch/plan') || window.location.pathname.startsWith('/dispatch/adjust') || window.location.pathname.startsWith('/dispatch/track'))}>Điều phối lộ trình</div>
          </Link>
          <Link to="/dispatch/vehicles" style={{ textDecoration: 'none' }}>
            <div style={mainTabStyle(window.location.pathname.startsWith('/dispatch/vehicles'))}>Quản lý xe</div>
          </Link>
          <Link to="/dispatch/drivers" style={{ textDecoration: 'none' }}>
            <div style={mainTabStyle(window.location.pathname.startsWith('/dispatch/drivers'))}>Quản lý tài xế</div>
          </Link>
          <Link to="/dispatch/customers" style={{ textDecoration: 'none' }}>
            <div style={mainTabStyle(window.location.pathname.startsWith('/dispatch/customers'))}>Quản lý khách hàng</div>
          </Link>
          <Link to="/dispatch/reports" style={{ textDecoration: 'none' }}>
            <div style={mainTabStyle(window.location.pathname.startsWith('/dispatch/reports'))}>Báo cáo</div>
          </Link>
        </nav>

        {/* Sub tabs */}
        {window.location.pathname.match(/^\/dispatch\/(overview|plan|adjust|track)/) && (
          <div
            style={{
              background: 'rgba(255,255,255,0.96)',
              borderBottom: '1px solid #E5E7EB',
              padding: '16px 48px',
              display: 'flex',
              gap: 12
            }}
          >
            <Link to="/dispatch/overview" style={{ textDecoration: 'none' }}>
              <div style={subTabStyle('overview')}>Tổng quan</div>
            </Link>
            <Link to="/dispatch/plan" style={{ textDecoration: 'none' }}>
              <div style={subTabStyle('plan')}>Lập kế hoạch lộ trình</div>
            </Link>
            <Link to="/dispatch/adjust" style={{ textDecoration: 'none' }}>
              <div style={subTabStyle('adjust')}>Điều chỉnh lộ trình</div>
            </Link>
            <Link to="/dispatch/track" style={{ textDecoration: 'none' }}>
              <div style={subTabStyle('track')}>Theo dõi trạng thái</div>
            </Link>
          </div>
        )}

        {/* Page body */}
        <main
          style={{
            flex: 1,
            padding: '24px 32px',
            maxWidth: 1400,
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

