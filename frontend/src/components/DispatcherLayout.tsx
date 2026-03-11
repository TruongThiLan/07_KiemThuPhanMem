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
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg viewBox="0 0 24 24" fill="#fff" style={{ width: 24, height: 24 }}>
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.85 7H17.14L18.22 10H5.78L6.85 7ZM6.5 16C5.67 16 5 15.33 5 14.5C5 13.67 5.67 13 6.5 13C7.33 13 8 13.67 8 14.5C8 15.33 7.33 16 6.5 16ZM17.5 16C16.67 16 16 15.33 16 14.5C16 13.67 16.67 13 17.5 13C18.33 13 19 13.67 19 14.5C19 15.33 18.33 16 17.5 16Z" />
              </svg>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>
              <span style={{ color: '#0A3B73' }}>ben</span>
              <span style={{ color: '#F39C12' }}>xedanang</span>
              <span>.</span>
              <span style={{ color: '#0A3B73' }}>vn</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <img 
              src="https://ui-avatars.com/api/?name=User&background=1E5FA8&color=fff&size=40" 
              alt="User Avatar" 
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid rgba(30, 95, 168, 0.2)'
              }}
            />
            
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 4,
                color: '#1E293B',
                transition: 'color 0.2s',
              }}
              title="Đăng xuất"
              onMouseEnter={(e) => e.currentTarget.style.color = '#e11d48'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#1E293B'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
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

