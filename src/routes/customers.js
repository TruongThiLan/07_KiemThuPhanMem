const express = require('express');
const { getPool, sql } = require('../db');

const router = express.Router();

// GET /customers - danh sách khách hàng
router.get('/', async (req, res) => {
  const { keyword } = req.query;

  try {
    const pool = await getPool();
    let query = 'SELECT * FROM KhachHang';
    const request = pool.request();

    if (keyword) {
      query += ' WHERE TenKhachHang LIKE @kw OR SoDienThoai LIKE @kw';
      request.input('kw', sql.NVarChar(100), `%${keyword}%`);
    }

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Get customers error:', err);
    res.status(500).json({ message: 'Lỗi lấy danh sách khách hàng', detail: err.message });
  }
});

// GET /customers/:id - chi tiết khách hàng
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM KhachHang WHERE MaKhachHang = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Get customer detail error:', err);
    res.status(500).json({ message: 'Lỗi lấy thông tin khách hàng', detail: err.message });
  }
});

// POST /customers - thêm khách hàng
router.post('/', async (req, res) => {
  const { TenKhachHang, SoDienThoai, DiaChiDon, DiaChiTra, TrangThai } = req.body || {};

  if (!TenKhachHang || !SoDienThoai || !DiaChiDon || !DiaChiTra) {
    return res.status(400).json({ message: 'Tên, số điện thoại, địa chỉ đón/trả là bắt buộc' });
  }

  if (!/^0\d{9}$/.test(SoDienThoai)) {
    return res.status(400).json({ message: 'Số điện thoại không hợp lệ (10 chữ số, bắt đầu bằng 0)' });
  }

  try {
    const pool = await getPool();

    const existing = await pool
      .request()
      .input('phone', sql.VarChar(15), SoDienThoai)
      .query('SELECT 1 FROM KhachHang WHERE SoDienThoai = @phone');

    if (existing.recordset.length > 0) {
      return res.status(409).json({ message: 'Số điện thoại đã tồn tại' });
    }

    const result = await pool
      .request()
      .input('TenKhachHang', sql.NVarChar(100), TenKhachHang)
      .input('SoDienThoai', sql.VarChar(15), SoDienThoai)
      .input('DiaChiDon', sql.NVarChar(255), DiaChiDon)
      .input('DiaChiTra', sql.NVarChar(255), DiaChiTra)
      .input('TrangThai', sql.NVarChar(30), TrangThai || 'Hoạt động')
      .query(`
        INSERT INTO KhachHang (TenKhachHang, SoDienThoai, DiaChiDon, DiaChiTra, TrangThai)
        OUTPUT INSERTED.*
        VALUES (@TenKhachHang, @SoDienThoai, @DiaChiDon, @DiaChiTra, @TrangThai)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Create customer error:', err);
    res.status(500).json({ message: 'Lỗi tạo khách hàng', detail: err.message });
  }
});

// PUT /customers/:id - cập nhật khách hàng
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { TenKhachHang, SoDienThoai, DiaChiDon, DiaChiTra, TrangThai } = req.body || {};

  if (!TenKhachHang || !SoDienThoai || !DiaChiDon || !DiaChiTra) {
    return res.status(400).json({ message: 'Tên, số điện thoại, địa chỉ đón/trả là bắt buộc' });
  }

  if (!/^0\d{9}$/.test(SoDienThoai)) {
    return res.status(400).json({ message: 'Số điện thoại không hợp lệ (10 chữ số, bắt đầu bằng 0)' });
  }

  try {
    const pool = await getPool();

    // kiểm tra tồn tại
    const existingCustomer = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM KhachHang WHERE MaKhachHang = @id');

    if (existingCustomer.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }

    // kiểm tra trùng SĐT với khách khác
    const existingPhone = await pool
      .request()
      .input('id', sql.Int, id)
      .input('phone', sql.VarChar(15), SoDienThoai)
      .query('SELECT 1 FROM KhachHang WHERE SoDienThoai = @phone AND MaKhachHang <> @id');

    if (existingPhone.recordset.length > 0) {
      return res.status(409).json({ message: 'Số điện thoại đã tồn tại cho khách hàng khác' });
    }

    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('TenKhachHang', sql.NVarChar(100), TenKhachHang)
      .input('SoDienThoai', sql.VarChar(15), SoDienThoai)
      .input('DiaChiDon', sql.NVarChar(255), DiaChiDon)
      .input('DiaChiTra', sql.NVarChar(255), DiaChiTra)
      .input('TrangThai', sql.NVarChar(30), TrangThai || existingCustomer.recordset[0].TrangThai)
      .query(`
        UPDATE KhachHang
        SET TenKhachHang = @TenKhachHang,
            SoDienThoai = @SoDienThoai,
            DiaChiDon = @DiaChiDon,
            DiaChiTra = @DiaChiTra,
            TrangThai = @TrangThai
        OUTPUT INSERTED.*
        WHERE MaKhachHang = @id
      `);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Update customer error:', err);
    res.status(500).json({ message: 'Lỗi cập nhật khách hàng', detail: err.message });
  }
});

// DELETE /customers/:id - xóa khách hàng (theo rule SRS)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();

    // kiểm tra khách còn đơn hàng/vé không
    const relatedTickets = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT TOP 1 1 FROM VeTrungChuyen WHERE MaKhachHang = @id');

    if (relatedTickets.recordset.length > 0) {
      return res.status(409).json({ message: 'Không cho phép xóa khách hàng đang có đơn hàng / vé' });
    }

    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM KhachHang OUTPUT DELETED.* WHERE MaKhachHang = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }

    res.json({ message: 'Xóa khách hàng thành công', customer: result.recordset[0] });
  } catch (err) {
    console.error('Delete customer error:', err);
    res.status(500).json({ message: 'Lỗi xóa khách hàng', detail: err.message });
  }
});

module.exports = router;

