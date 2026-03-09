const express = require('express');
const { getPool, sql } = require('../db');

const router = express.Router();

// GET /drivers - danh sách tài xế
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM TaiXe');
    res.json(result.recordset);
  } catch (err) {
    console.error('Get drivers error:', err);
    res.status(500).json({ message: 'Lỗi lấy danh sách tài xế', detail: err.message });
  }
});

// GET /drivers/:id - chi tiết tài xế
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM TaiXe WHERE MaTaiXe = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài xế' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Get driver detail error:', err);
    res.status(500).json({ message: 'Lỗi lấy thông tin tài xế', detail: err.message });
  }
});

// POST /drivers - thêm tài xế
router.post('/', async (req, res) => {
  const { HoTen, SoDienThoai, CCCD, LoaiBangLai, TrangThaiTaiXe } = req.body || {};

  if (!HoTen || !SoDienThoai || !CCCD) {
    return res.status(400).json({ message: 'Họ tên, SĐT, CCCD là bắt buộc' });
  }

  if (!/^0\d{9}$/.test(SoDienThoai)) {
    return res.status(400).json({ message: 'Số điện thoại không hợp lệ (10 chữ số, bắt đầu bằng 0)' });
  }

  if (!/^\d{12}$/.test(CCCD)) {
    return res.status(400).json({ message: 'CCCD/CMND không hợp lệ (12 chữ số)' });
  }

  try {
    const pool = await getPool();

    const existing = await pool
      .request()
      .input('phone', sql.VarChar(15), SoDienThoai)
      .input('cccd', sql.VarChar(20), CCCD)
      .query('SELECT 1 FROM TaiXe WHERE SoDienThoai = @phone OR CCCD = @cccd');

    if (existing.recordset.length > 0) {
      return res.status(409).json({ message: 'Tài xế đã tồn tại (trùng SĐT hoặc CCCD)' });
    }

    const result = await pool
      .request()
      .input('HoTen', sql.NVarChar(100), HoTen)
      .input('SoDienThoai', sql.VarChar(15), SoDienThoai)
      .input('CCCD', sql.VarChar(20), CCCD)
      .input('LoaiBangLai', sql.NVarChar(50), LoaiBangLai || null)
      .input('TrangThaiTaiXe', sql.NVarChar(30), TrangThaiTaiXe || 'Rảnh')
      .query(`
        INSERT INTO TaiXe (HoTen, SoDienThoai, CCCD, LoaiBangLai, TrangThaiTaiXe)
        OUTPUT INSERTED.*
        VALUES (@HoTen, @SoDienThoai, @CCCD, @LoaiBangLai, @TrangThaiTaiXe)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Create driver error:', err);
    res.status(500).json({ message: 'Lỗi tạo tài xế', detail: err.message });
  }
});

// PUT /drivers/:id - chỉnh sửa tài xế
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { HoTen, SoDienThoai, CCCD, LoaiBangLai, TrangThaiTaiXe } = req.body || {};

  if (!HoTen || !SoDienThoai || !CCCD) {
    return res.status(400).json({ message: 'Họ tên, SĐT, CCCD là bắt buộc' });
  }

  if (!/^0\d{9}$/.test(SoDienThoai)) {
    return res.status(400).json({ message: 'Số điện thoại không hợp lệ (10 chữ số, bắt đầu bằng 0)' });
  }

  if (!/^\d{12}$/.test(CCCD)) {
    return res.status(400).json({ message: 'CCCD/CMND không hợp lệ (12 chữ số)' });
  }

  try {
    const pool = await getPool();

    const existing = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM TaiXe WHERE MaTaiXe = @id');

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài xế' });
    }

    const existingConflicts = await pool
      .request()
      .input('id', sql.Int, id)
      .input('phone', sql.VarChar(15), SoDienThoai)
      .input('cccd', sql.VarChar(20), CCCD)
      .query(`
        SELECT 1 FROM TaiXe
        WHERE (SoDienThoai = @phone OR CCCD = @cccd)
          AND MaTaiXe <> @id
      `);

    if (existingConflicts.recordset.length > 0) {
      return res.status(409).json({ message: 'SĐT/CCCD đã tồn tại cho tài xế khác' });
    }

    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('HoTen', sql.NVarChar(100), HoTen)
      .input('SoDienThoai', sql.VarChar(15), SoDienThoai)
      .input('CCCD', sql.VarChar(20), CCCD)
      .input('LoaiBangLai', sql.NVarChar(50), LoaiBangLai || existing.recordset[0].LoaiBangLai)
      .input('TrangThaiTaiXe', sql.NVarChar(30), TrangThaiTaiXe || existing.recordset[0].TrangThaiTaiXe)
      .query(`
        UPDATE TaiXe
        SET HoTen = @HoTen,
            SoDienThoai = @SoDienThoai,
            CCCD = @CCCD,
            LoaiBangLai = @LoaiBangLai,
            TrangThaiTaiXe = @TrangThaiTaiXe
        OUTPUT INSERTED.*
        WHERE MaTaiXe = @id
      `);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Update driver error:', err);
    res.status(500).json({ message: 'Lỗi cập nhật tài xế', detail: err.message });
  }
});

// DELETE /drivers/:id - xóa / ngừng hoạt động tài xế
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();

    const busyRoutes = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT TOP 1 1
        FROM LoTrinhTrungChuyen
        WHERE MaTaiXe = @id
          AND TrangThaiLoTrinh IN (N'Đang thực hiện', N'Chưa thực hiện')
      `);

    if (busyRoutes.recordset.length > 0) {
      return res
        .status(409)
        .json({ message: 'Không thể xóa/khóa tài xế đang có lộ trình đã phân công' });
    }

    // mềm: chuyển trạng thái sang Ngừng hoạt động
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE TaiXe
        SET TrangThaiTaiXe = N'Ngừng hoạt động'
        OUTPUT INSERTED.*
        WHERE MaTaiXe = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài xế' });
    }

    res.json({ message: 'Cập nhật trạng thái tài xế thành Ngừng hoạt động', driver: result.recordset[0] });
  } catch (err) {
    console.error('Delete/disable driver error:', err);
    res.status(500).json({ message: 'Lỗi cập nhật trạng thái tài xế', detail: err.message });
  }
});

module.exports = router;

