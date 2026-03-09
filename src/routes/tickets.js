const express = require('express');
const { getPool, sql } = require('../db');

const router = express.Router();

// GET /tickets - danh sách vé trung chuyển, join thông tin khách hàng
// Query optional: status=Cần trung chuyển, keyword, timeSlot
router.get('/', async (req, res) => {
  const { status, keyword } = req.query;

  try {
    const pool = await getPool();
    const request = pool.request();

    let query = `
      SELECT
        v.MaVe,
        v.KhungGioTrungChuyen,
        v.SoLuongGhe,
        v.TrangThaiVe,
        k.TenKhachHang,
        k.SoDienThoai,
        k.DiaChiDon,
        k.DiaChiTra
      FROM VeTrungChuyen v
      JOIN KhachHang k ON v.MaKhachHang = k.MaKhachHang
      WHERE 1 = 1
    `;

    if (status) {
      query += ' AND v.TrangThaiVe = @status';
      request.input('status', sql.NVarChar(50), status);
    }

    if (keyword) {
      query +=
        ' AND (k.TenKhachHang LIKE @kw OR k.SoDienThoai LIKE @kw OR k.DiaChiDon LIKE @kw OR k.DiaChiTra LIKE @kw)';
      request.input('kw', sql.NVarChar(100), `%${keyword}%`);
    }

    query += ' ORDER BY v.MaVe DESC';

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Get tickets error:', err);
    res.status(500).json({ message: 'Lỗi lấy danh sách vé trung chuyển', detail: err.message });
  }
});

module.exports = router;

