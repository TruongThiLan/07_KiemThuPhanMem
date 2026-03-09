const express = require('express');
const { getPool, sql } = require('../db');

const router = express.Router();

// OTP store (mock): phone -> { otp, expiresAtMs }
const otpStore = new Map();

function isStrongPassword(pw) {
  if (typeof pw !== 'string') return false;
  if (pw.length < 8) return false;
  const hasLetter = /[A-Za-z]/.test(pw);
  const hasNumber = /\d/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  return hasLetter && hasNumber && hasSpecial;
}

// Đăng nhập
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'username và password là bắt buộc' });
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('username', sql.VarChar(50), username)
      .query(`
        SELECT
          tk.MaTaiKhoan,
          tk.TenDangNhap,
          tk.MatKhauMaHoa,
          tk.VaiTro,
          tk.TrangThaiTaiKhoan,
          tx.MaTaiXe
        FROM TaiKhoanNguoiDung tk
        LEFT JOIN TaiXe tx ON tx.MaTaiKhoan = tk.MaTaiKhoan
        WHERE tk.TenDangNhap = @username
      `);

    if (result.recordset.length === 0) {
      // Không tìm thấy tài khoản
      return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    }

    const user = result.recordset[0];

    if (!user.TrangThaiTaiKhoan) {
      return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
    }

    // TẠM THỜI: so sánh chuỗi thuần (plain text).
    // Nếu sau này dùng hash (bcrypt, v.v.), đoạn này sẽ đổi lại.
    if (password !== user.MatKhauMaHoa) {
      return res.status(401).json({ message: 'Mật khẩu không đúng' });
    }

    // TODO: sinh JWT thay vì trả user thô
    return res.json({
      message: 'Đăng nhập thành công',
      user
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Lỗi hệ thống khi đăng nhập', detail: err.message });
  }
});

// Đăng xuất (stateless – phía FE chỉ cần xóa thông tin lưu trữ)
router.post('/logout', (req, res) => {
  return res.json({ message: 'Đã đăng xuất (stateless)' });
});

// Quên mật khẩu - gửi OTP (mock)
router.post('/forgot-password', async (req, res) => {
  const { phoneNumber } = req.body || {};
  if (!phoneNumber) {
    return res.status(400).json({ message: 'phoneNumber là bắt buộc' });
  }

  if (!/^0\d{9}$/.test(phoneNumber)) {
    return res
      .status(400)
      .json({ message: 'Số điện thoại không hợp lệ (10 chữ số, bắt đầu bằng 0)' });
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('phone', sql.VarChar(15), phoneNumber)
      .query(`
        SELECT MaTaiKhoan, TenDangNhap, SoDienThoai
        FROM TaiKhoanNguoiDung
        WHERE SoDienThoai = @phone
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresInSeconds = 60;
    otpStore.set(phoneNumber, {
      otp,
      expiresAtMs: Date.now() + expiresInSeconds * 1000
    });

    // TODO: gửi SMS thực tế. Hiện tại trả OTP để demo/test nhanh trên local.
    const response = {
      message: 'Đã gửi mã OTP',
      expiresInSeconds
    };
    if (process.env.NODE_ENV !== 'production') {
      response.otp = otp;
    }
    res.json(response);
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Lỗi hệ thống khi xử lý quên mật khẩu', detail: err.message });
  }
});

// Đăng ký tài khoản cho từng vai trò
router.post('/register', async (req, res) => {
  const { role, fullName, username, phoneNumber, password, cccd, licenseType } = req.body || {};

  if (!role || !fullName || !username || !phoneNumber || !password) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
  }

  if (!/^0\d{9}$/.test(phoneNumber)) {
    return res
      .status(400)
      .json({ message: 'Số điện thoại không hợp lệ (10 chữ số, bắt đầu bằng 0)' });
  }

  const normalizedRole = role === 'driver' ? 'driver' : 'dispatcher';
  const vaiTroText = normalizedRole === 'driver' ? 'Tài xế' : 'Nhân viên điều phối';

  if (normalizedRole === 'driver') {
    if (!cccd || !/^\d{12}$/.test(cccd)) {
      return res.status(400).json({ message: 'CCCD không hợp lệ (12 chữ số)' });
    }
  }

  try {
    const pool = await getPool();

    // kiểm tra trùng username
    const existingUser = await pool
      .request()
      .input('username', sql.VarChar(50), username)
      .query('SELECT 1 FROM TaiKhoanNguoiDung WHERE TenDangNhap = @username');

    if (existingUser.recordset.length > 0) {
      return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại' });
    }

    // kiểm tra trùng SĐT
    const existingPhone = await pool
      .request()
      .input('phone', sql.VarChar(15), phoneNumber)
      .query('SELECT 1 FROM TaiKhoanNguoiDung WHERE SoDienThoai = @phone');

    if (existingPhone.recordset.length > 0) {
      return res.status(409).json({ message: 'Số điện thoại đã tồn tại' });
    }

    // tạo tài khoản người dùng
    const accountResult = await pool
      .request()
      .input('TenDangNhap', sql.VarChar(50), username)
      .input('MatKhauMaHoa', sql.VarChar(255), password)
      .input('SoDienThoai', sql.VarChar(15), phoneNumber)
      .input('VaiTro', sql.NVarChar(30), vaiTroText)
      .query(`
        INSERT INTO TaiKhoanNguoiDung (TenDangNhap, MatKhauMaHoa, SoDienThoai, VaiTro)
        OUTPUT INSERTED.*
        VALUES (@TenDangNhap, @MatKhauMaHoa, @SoDienThoai, @VaiTro)
      `);

    const account = accountResult.recordset[0];

    // tạo bản ghi chi tiết theo vai trò
    if (normalizedRole === 'dispatcher') {
      await pool
        .request()
        .input('HoTen', sql.NVarChar(100), fullName)
        .input('SoDienThoai', sql.VarChar(15), phoneNumber)
        .input('TrangThai', sql.NVarChar(30), 'Hoạt động')
        .input('MaTaiKhoan', sql.Int, account.MaTaiKhoan)
        .query(`
          INSERT INTO NhanVienDieuPhoi (HoTen, SoDienThoai, TrangThai, MaTaiKhoan)
          VALUES (@HoTen, @SoDienThoai, @TrangThai, @MaTaiKhoan)
        `);
    } else {
      await pool
        .request()
        .input('HoTen', sql.NVarChar(100), fullName)
        .input('SoDienThoai', sql.VarChar(15), phoneNumber)
        .input('CCCD', sql.VarChar(20), cccd)
        .input('LoaiBangLai', sql.NVarChar(50), licenseType || null)
        .input('TrangThaiTaiXe', sql.NVarChar(30), 'Rảnh')
        .input('MaTaiKhoan', sql.Int, account.MaTaiKhoan)
        .query(`
          INSERT INTO TaiXe (HoTen, SoDienThoai, CCCD, LoaiBangLai, TrangThaiTaiXe, MaTaiKhoan)
          VALUES (@HoTen, @SoDienThoai, @CCCD, @LoaiBangLai, @TrangThaiTaiXe, @MaTaiKhoan)
        `);
    }

    return res.status(201).json({
      message: 'Đăng ký thành công',
      user: {
        MaTaiKhoan: account.MaTaiKhoan,
        TenDangNhap: account.TenDangNhap,
        VaiTro: account.VaiTro,
        SoDienThoai: account.SoDienThoai
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res
      .status(500)
      .json({ message: 'Lỗi hệ thống khi đăng ký tài khoản', detail: err.message });
  }
});

// Đặt lại mật khẩu theo số điện thoại (quên mật khẩu)
router.post('/reset-password', async (req, res) => {
  const { phoneNumber, otp, newPassword } = req.body || {};

  if (!phoneNumber || !otp || !newPassword) {
    return res.status(400).json({ message: 'phoneNumber, otp và newPassword là bắt buộc' });
  }

  if (!/^0\d{9}$/.test(phoneNumber)) {
    return res
      .status(400)
      .json({ message: 'Số điện thoại không hợp lệ (10 chữ số, bắt đầu bằng 0)' });
  }

  const cached = otpStore.get(phoneNumber);
  if (!cached) {
    return res.status(400).json({ message: 'Chưa có OTP, vui lòng gửi OTP trước.' });
  }
  if (Date.now() > cached.expiresAtMs) {
    otpStore.delete(phoneNumber);
    return res.status(400).json({ message: 'Mã OTP đã hết hạn vui lòng gửi lại' });
  }
  if (String(otp) !== String(cached.otp)) {
    return res.status(400).json({ message: 'Mã OTP không đúng' });
  }

  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({
      message: 'Mật khẩu phải có ít nhất 8 ký tự (gồm chữ, số và ký tự đặc biệt)'
    });
  }

  try {
    const pool = await getPool();

    const existing = await pool
      .request()
      .input('phone', sql.VarChar(15), phoneNumber)
      .query('SELECT * FROM TaiKhoanNguoiDung WHERE SoDienThoai = @phone');

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    }

    const currentPw = existing.recordset[0].MatKhauMaHoa;
    if (String(currentPw) === String(newPassword)) {
      return res.status(400).json({ message: 'Nhập mật khẩu khác' });
    }

    await pool
      .request()
      .input('phone', sql.VarChar(15), phoneNumber)
      .input('MatKhauMaHoa', sql.VarChar(255), newPassword)
      .query(`
        UPDATE TaiKhoanNguoiDung
        SET MatKhauMaHoa = @MatKhauMaHoa
        WHERE SoDienThoai = @phone
      `);

    otpStore.delete(phoneNumber);
    return res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res
      .status(500)
      .json({ message: 'Lỗi hệ thống khi đặt lại mật khẩu', detail: err.message });
  }
});

module.exports = router;

