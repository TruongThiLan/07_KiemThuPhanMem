import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export const ForgotPasswordPage: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleBack = () => navigate('/login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!/^0\d{9}$/.test(phone)) {
      setError('Số điện thoại không hợp lệ (10 chữ số, bắt đầu bằng 0)');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { phoneNumber: phone });
      const otpHint = res.data?.otp ? ` (OTP demo: ${res.data.otp})` : '';
      setMessage((res.data?.message || 'Đã gửi mã xác thực, vui lòng kiểm tra điện thoại') + otpHint);
      // Sau khi gửi thành công, chuyển sang màn đặt mật khẩu mới
      setTimeout(() => {
        navigate('/reset-password', {
          state: {
            phoneNumber: phone,
            expiresInSeconds: res.data?.expiresInSeconds ?? 60
          }
        });
      }, 800);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Không thể gửi mã xác thực');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        background: 'linear-gradient(153deg, #1E5FA8 0%, #DBEAFE 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div
        style={{
          width: 1024,
          maxWidth: '95%',
          height: 617,
          display: 'flex',
          background: '#fff',
          boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
          borderRadius: 16,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            flex: 1,
            position: 'relative',
            background: '#D2EAFF'
          }}
        >
          <div
            style={{
              width: 128,
              height: 128,
              borderRadius: '50%',
              background: '#fff',
              border: '4px solid #1E5FA8',
              position: 'absolute',
              left: '50%',
              top: 112.5,
              transform: 'translateX(-50%)',
              boxShadow:
                '0px 4px 6px -4px rgba(0,0,0,0.10), 0px 10px 15px -3px rgba(0,0,0,0.10)'
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 272.5,
              transform: 'translateX(-50%)',
              width: 353,
              textAlign: 'center',
              color: '#054285',
              fontSize: 32,
              fontWeight: 700,
              lineHeight: '1.3'
            }}
          >
            HỆ THỐNG QUẢN LÝ
            <br />
            VÀ ĐIỀU PHỐI
            <br />
            LỘ TRÌNH XE
            <br />
            TRUNG CHUYỂN
          </div>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 40,
              transform: 'translateX(-50%)',
              width: 355,
              textAlign: 'center',
              color: '#4A4A4A',
              fontSize: 17
            }}
          >
            Giải pháp tối ưu hóa vận chuyển thông minh
          </div>
        </div>

        <div
          style={{
            flex: 1,
            background: '#1E5FA8',
            color: '#fff',
            padding: '40px 24px',
            position: 'relative'
          }}
        >
          <button
            type="button"
            onClick={handleBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              marginBottom: 24
            }}
          >
            <span style={{ fontSize: 18 }}>{'←'}</span>
            <span style={{ fontSize: 18, fontWeight: 500 }}>Quay lại đăng nhập</span>
          </button>

          <h1
            style={{
              fontSize: 35,
              fontWeight: 700,
              marginBottom: 8
            }}
          >
            QUÊN MẬT KHẨU
          </h1>
          <p
            style={{
              fontSize: 18,
              color: '#D1D5DC',
              marginBottom: 32
            }}
          >
            Nhập số điện thoại để nhận mã xác thực
          </p>

          <form onSubmit={handleSubmit} style={{ maxWidth: 463 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 18 }}>
              Số điện thoại
            </label>
            <div
              style={{
                background: '#fff',
                borderRadius: 10,
                marginBottom: 16
              }}
            >
              <input
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  padding: '14px 16px',
                  fontSize: 16,
                  color: '#000'
                }}
                type="tel"
                placeholder="Nhập số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {error && (
              <div
                style={{
                  background: 'rgba(248,113,113,0.2)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: '#FEE2E2',
                  marginBottom: 8
                }}
              >
                {error}
              </div>
            )}

            {message && (
              <div
                style={{
                  background: 'rgba(34,197,94,0.2)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: '#DCFCE7',
                  marginBottom: 8
                }}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: 56,
                borderRadius: 10,
                border: 'none',
                background: '#F39C12',
                color: '#fff',
                fontSize: 18,
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: 16,
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Đang gửi...' : 'GỬI MÃ XÁC THỰC'}
            </button>
          </form>

          <div
            style={{
              position: 'absolute',
              bottom: 32,
              left: 48,
              right: 48,
              borderTop: '1px solid rgba(255,255,255,0.2)',
              paddingTop: 8,
              textAlign: 'center',
              fontSize: 12.8,
              opacity: 0.8
            }}
          >
            © 2026 Hệ Thống Quản Lý Xe Trung Chuyển
          </div>
        </div>
      </div>
    </div>
  );
};

