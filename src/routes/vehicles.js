const express = require('express');
const { getPool, sql } = require('../db');

const router = express.Router();

// GET /vehicles - danh sách xe
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM XeTrungChuyen');
    res.json(result.recordset);
  } catch (err) {
    console.error('Get vehicles error:', err);
    res.status(500).json({ message: 'Lỗi lấy danh sách xe', detail: err.message });
  }
});

// GET /vehicles/:id - chi tiết xe
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM XeTrungChuyen WHERE MaXe = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy xe' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Get vehicle detail error:', err);
    res.status(500).json({ message: 'Lỗi lấy thông tin xe', detail: err.message });
  }
});

// POST /vehicles - thêm xe
router.post('/', async (req, res) => {
  const { BienSo, LoaiXe, SoCho, TrangThaiXe } = req.body || {};

  if (!BienSo || !LoaiXe || !SoCho) {
    return res.status(400).json({ message: 'Biển số, loại xe, số chỗ là bắt buộc' });
  }

  try {
    const pool = await getPool();

    const existing = await pool
      .request()
      .input('BienSo', sql.VarChar(50), BienSo)
      .query('SELECT 1 FROM XeTrungChuyen WHERE BienSo = @BienSo');

    if (existing.recordset.length > 0) {
      return res.status(409).json({ message: 'Xe đã tồn tại (trùng biển số)' });
    }

    const result = await pool
      .request()
      .input('BienSo', sql.VarChar(50), BienSo)
      .input('LoaiXe', sql.NVarChar(50), LoaiXe)
      .input('SoCho', sql.Int, SoCho)
      .input('TrangThaiXe', sql.NVarChar(30), TrangThaiXe || 'Rảnh')
      .query(`
        INSERT INTO XeTrungChuyen (BienSo, LoaiXe, SoCho, TrangThaiXe)
        OUTPUT INSERTED.*
        VALUES (@BienSo, @LoaiXe, @SoCho, @TrangThaiXe)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Create vehicle error:', err);
    res.status(500).json({ message: 'Lỗi tạo xe', detail: err.message });
  }
});

// PUT /vehicles/:id - cập nhật xe
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { BienSo, LoaiXe, SoCho, TrangThaiXe } = req.body || {};

  if (!BienSo || !LoaiXe || !SoCho) {
    return res.status(400).json({ message: 'Biển số, loại xe, số chỗ là bắt buộc' });
  }

  try {
    const pool = await getPool();

    const existing = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM XeTrungChuyen WHERE MaXe = @id');

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy xe' });
    }

    const existingPlate = await pool
      .request()
      .input('id', sql.Int, id)
      .input('BienSo', sql.VarChar(50), BienSo)
      .query('SELECT 1 FROM XeTrungChuyen WHERE BienSo = @BienSo AND MaXe <> @id');

    if (existingPlate.recordset.length > 0) {
      return res.status(409).json({ message: 'Biển số đã tồn tại cho xe khác' });
    }

    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('BienSo', sql.VarChar(50), BienSo)
      .input('LoaiXe', sql.NVarChar(50), LoaiXe)
      .input('SoCho', sql.Int, SoCho)
      .input('TrangThaiXe', sql.NVarChar(30), TrangThaiXe || existing.recordset[0].TrangThaiXe)
      .query(`
        UPDATE XeTrungChuyen
        SET BienSo = @BienSo,
            LoaiXe = @LoaiXe,
            SoCho = @SoCho,
            TrangThaiXe = @TrangThaiXe
        OUTPUT INSERTED.*
        WHERE MaXe = @id
      `);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Update vehicle error:', err);
    res.status(500).json({ message: 'Lỗi cập nhật xe', detail: err.message });
  }
});

// DELETE /vehicles/:id - xóa xe (theo rule: không xóa nếu đang phân công lộ trình)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();

    const relatedRoutes = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT TOP 1 1 FROM LoTrinhTrungChuyen WHERE MaXe = @id');

    if (relatedRoutes.recordset.length > 0) {
      return res.status(409).json({ message: 'Không thể xóa xe đang được phân công lộ trình' });
    }

    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM XeTrungChuyen OUTPUT DELETED.* WHERE MaXe = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy xe' });
    }

    res.json({ message: 'Xóa xe thành công', vehicle: result.recordset[0] });
  } catch (err) {
    console.error('Delete vehicle error:', err);
    res.status(500).json({ message: 'Lỗi xóa xe', detail: err.message });
  }
});

module.exports = router;

