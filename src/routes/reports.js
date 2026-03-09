const express = require('express');
const { getPool, sql } = require('../db');

const router = express.Router();

// GET /reports/summary - báo cáo tổng hợp trung chuyển (đơn giản)
router.get('/summary', async (req, res) => {
  const { fromDate, toDate } = req.query;

  try {
    const pool = await getPool();
    const request = pool.request();

    let query = `
      SELECT
        lt.MaLoTrinh,
        CONVERT(date, lt.ThoiGianBatDau) AS Ngay,
        xtc.LoaiXe,
        xtc.BienSo,
        tx.HoTen AS TenTaiXe,
        COUNT(ct.MaChiTiet) AS SoDiemDonTra
      FROM LoTrinhTrungChuyen lt
        LEFT JOIN XeTrungChuyen xtc ON lt.MaXe = xtc.MaXe
        LEFT JOIN TaiXe tx ON lt.MaTaiXe = tx.MaTaiXe
        LEFT JOIN ChiTietLoTrinh ct ON lt.MaLoTrinh = ct.MaLoTrinh
      WHERE 1 = 1
    `;

    if (fromDate) {
      query += ' AND lt.ThoiGianBatDau >= @fromDate';
      request.input('fromDate', sql.DateTime, fromDate);
    }

    if (toDate) {
      query += ' AND lt.ThoiGianBatDau < DATEADD(DAY, 1, @toDate)';
      request.input('toDate', sql.DateTime, toDate);
    }

    query += `
      GROUP BY lt.MaLoTrinh, CONVERT(date, lt.ThoiGianBatDau), xtc.LoaiXe, xtc.BienSo, tx.HoTen
      ORDER BY Ngay DESC
    `;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Get summary report error:', err);
    res.status(500).json({ message: 'Lỗi lấy báo cáo tổng hợp', detail: err.message });
  }
});

module.exports = router;

