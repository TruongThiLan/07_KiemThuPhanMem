const express = require('express');
const { getPool, sql } = require('../db');

const router = express.Router();

// GET /routes - danh sách lộ trình
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM LoTrinhTrungChuyen');
    res.json(result.recordset);
  } catch (err) {
    console.error('Get routes error:', err);
    res.status(500).json({ message: 'Lỗi lấy danh sách lộ trình', detail: err.message });
  }
});

// GET /routes/by-driver/:driverId - danh sách lộ trình theo tài xế
router.get('/by-driver/:driverId', async (req, res) => {
  const { driverId } = req.params;
  const { status } = req.query;

  try {
    const pool = await getPool();
    const request = pool.request().input('driverId', sql.Int, driverId);

    let query = `
      SELECT
        lt.*,
        x.BienSo,
        x.LoaiXe,
        x.SoCho
      FROM LoTrinhTrungChuyen lt
      JOIN XeTrungChuyen x ON x.MaXe = lt.MaXe
      WHERE lt.MaTaiXe = @driverId
    `;

    if (status) {
      query += ' AND lt.TrangThaiLoTrinh = @status';
      request.input('status', sql.NVarChar(50), status);
    }

    query += ' ORDER BY lt.ThoiGianBatDau DESC';

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Get routes by driver error:', err);
    res.status(500).json({ message: 'Lỗi lấy danh sách chuyến cho tài xế', detail: err.message });
  }
});

// GET /routes/:id - chi tiết lộ trình + danh sách điểm dừng
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();

    const routeResult = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          lt.*,
          x.BienSo,
          x.LoaiXe,
          x.SoCho
        FROM LoTrinhTrungChuyen lt
        JOIN XeTrungChuyen x ON x.MaXe = lt.MaXe
        WHERE lt.MaLoTrinh = @id
      `);

    if (routeResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lộ trình' });
    }

    const stopsResult = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          ct.MaChiTiet,
          ct.ThuTuDonTra,
          ct.DiemDon,
          ct.DiemTra,
          ct.ThoiGianDonDuKien,
          ct.TrangThaiKhach,
          ct.MaLoTrinh,
          ct.MaVe,
          v.SoLuongGhe,
          v.KhungGioTrungChuyen,
          v.TrangThaiVe,
          k.TenKhachHang,
          k.SoDienThoai
        FROM ChiTietLoTrinh ct
        JOIN VeTrungChuyen v ON v.MaVe = ct.MaVe
        JOIN KhachHang k ON k.MaKhachHang = v.MaKhachHang
        WHERE ct.MaLoTrinh = @id
        ORDER BY ct.ThuTuDonTra
      `);

    res.json({
      route: routeResult.recordset[0],
      stops: stopsResult.recordset
    });
  } catch (err) {
    console.error('Get route detail error:', err);
    res.status(500).json({ message: 'Lỗi lấy thông tin lộ trình', detail: err.message });
  }
});

// POST /routes/:id/incident - báo cáo sự cố chuyến (tài xế)
router.post('/:id/incident', async (req, res) => {
  const { id } = req.params;
  const { description, location } = req.body || {};

  if (!description || String(description).trim().length < 3) {
    return res.status(400).json({ message: 'Vui lòng nhập nội dung sự cố.' });
  }

  try {
    const pool = await getPool();

    const existing = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM LoTrinhTrungChuyen WHERE MaLoTrinh = @id');

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lộ trình' });
    }

    const current = existing.recordset[0];

    // cập nhật trạng thái chuyến
    await pool
      .request()
      .input('id', sql.Int, id)
      .input('TrangThaiLoTrinh', sql.NVarChar(50), 'Đang gặp sự cố')
      .query(`
        UPDATE LoTrinhTrungChuyen
        SET TrangThaiLoTrinh = @TrangThaiLoTrinh
        WHERE MaLoTrinh = @id
      `);

    // ghi log theo dõi trạng thái
    await pool
      .request()
      .input('MaLoTrinh', sql.Int, id)
      .input(
        'ViTriHienTai',
        sql.NVarChar(255),
        location ? String(location) : `Sự cố: ${String(description).trim()}`
      )
      .input('TrangThai', sql.NVarChar(50), 'Đang gặp sự cố')
      .query(`
        INSERT INTO TheoDoiTrangThai (ViTriHienTai, TrangThai, MaLoTrinh)
        VALUES (@ViTriHienTai, @TrangThai, @MaLoTrinh)
      `);

    return res.json({
      message: 'Đã ghi nhận sự cố.',
      route: { ...current, TrangThaiLoTrinh: 'Đang gặp sự cố' }
    });
  } catch (err) {
    console.error('Report incident error:', err);
    return res.status(500).json({ message: 'Lỗi báo cáo sự cố', detail: err.message });
  }
});

// PATCH /routes/:routeId/stops/:stopId/status - cập nhật trạng thái đón/trả khách (tài xế)
router.patch('/:routeId/stops/:stopId/status', async (req, res) => {
  const { routeId, stopId } = req.params;
  const { status } = req.body || {};

  const allowed = ['Đã đến điểm đón', 'Đã đón khách', 'Đã trả khách', 'Khách hủy'];
  if (!allowed.includes(status)) {
    return res.status(400).json({
      message: `Trạng thái khách không hợp lệ. Cho phép: ${allowed.join(' / ')}`
    });
  }

  try {
    const pool = await getPool();

    const routeRes = await pool
      .request()
      .input('routeId', sql.Int, routeId)
      .query('SELECT * FROM LoTrinhTrungChuyen WHERE MaLoTrinh = @routeId');

    if (routeRes.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lộ trình' });
    }

    const route = routeRes.recordset[0];
    if (!['Đang thực hiện', 'Đang gặp sự cố'].includes(route.TrangThaiLoTrinh)) {
      return res.status(422).json({
        message:
          'Chỉ được cập nhật trạng thái khách khi chuyến đang ở trạng thái "Đang thực hiện" hoặc "Đang gặp sự cố".'
      });
    }

    const stopRes = await pool
      .request()
      .input('routeId', sql.Int, routeId)
      .input('stopId', sql.Int, stopId)
      .query(`
        SELECT TOP 1 *
        FROM ChiTietLoTrinh
        WHERE MaLoTrinh = @routeId AND MaChiTiet = @stopId
      `);

    if (stopRes.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy điểm đón/trả' });
    }

    const stop = stopRes.recordset[0];

    await pool
      .request()
      .input('routeId', sql.Int, routeId)
      .input('stopId', sql.Int, stopId)
      .input('TrangThaiKhach', sql.NVarChar(50), status)
      .query(`
        UPDATE ChiTietLoTrinh
        SET TrangThaiKhach = @TrangThaiKhach
        WHERE MaLoTrinh = @routeId AND MaChiTiet = @stopId
      `);

    // Đồng bộ trạng thái vé theo trạng thái khách
    const ticketStatus =
      status === 'Khách hủy'
        ? 'Hủy'
        : status === 'Đã trả khách'
          ? 'Hoàn tất trung chuyển'
          : 'Đang trung chuyển';

    await pool
      .request()
      .input('MaVe', sql.Int, stop.MaVe)
      .input('TrangThaiVe', sql.NVarChar(50), ticketStatus)
      .query(`
        UPDATE VeTrungChuyen
        SET TrangThaiVe = @TrangThaiVe
        WHERE MaVe = @MaVe
      `);

    // Nếu tất cả khách đã xử lý xong => cho phép kết thúc chuyến (auto)
    const allStopsRes = await pool
      .request()
      .input('routeId', sql.Int, routeId)
      .query('SELECT TrangThaiKhach FROM ChiTietLoTrinh WHERE MaLoTrinh = @routeId');

    const doneSet = new Set(['Đã trả khách', 'Khách hủy']);
    const allDone =
      allStopsRes.recordset.length > 0 &&
      allStopsRes.recordset.every((r) => doneSet.has((r.TrangThaiKhach || '').trim()));

    if (allDone) {
      await pool
        .request()
        .input('routeId', sql.Int, routeId)
        .input('ThoiGianKetThuc', sql.DateTime, route.ThoiGianKetThuc || new Date())
        .query(`
          UPDATE LoTrinhTrungChuyen
          SET TrangThaiLoTrinh = N'Hoàn thành',
              ThoiGianKetThuc = @ThoiGianKetThuc
          WHERE MaLoTrinh = @routeId
        `);
    }

    return res.json({
      message: 'Đã cập nhật trạng thái khách.',
      stop: { ...stop, TrangThaiKhach: status },
      routeAutoCompleted: allDone
    });
  } catch (err) {
    console.error('Update stop status error:', err);
    return res.status(500).json({ message: 'Lỗi cập nhật trạng thái khách', detail: err.message });
  }
});

// POST /routes - lập kế hoạch lộ trình trung chuyển (đơn giản hóa)
router.post('/', async (req, res) => {
  const { MaXe, MaTaiXe, MaNhanVien, ThoiGianBatDau, ThoiGianKetThuc, LoTrinhDuKien, ticketIds } =
    req.body || {};

  if (!MaXe || !MaTaiXe || !MaNhanVien || !ThoiGianBatDau || !Array.isArray(ticketIds)) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc để lập lộ trình' });
  }

  try {
    const pool = await getPool();

    // tính tổng số ghế từ VeTrungChuyen
    const ticketsResult = await pool
      .request()
      .input('ids', sql.VarChar(sql.MAX), ticketIds.join(','))
      .query(`
        SELECT SUM(SoLuongGhe) AS TongGhe
        FROM VeTrungChuyen
        WHERE MaVe IN (SELECT TRY_CAST(value AS INT) FROM STRING_SPLIT(@ids, ','))
      `);

    const totalSeats = ticketsResult.recordset[0].TongGhe || 0;

    const capacityResult = await pool
      .request()
      .input('MaXe', sql.Int, MaXe)
      .query('SELECT SoCho FROM XeTrungChuyen WHERE MaXe = @MaXe');

    if (capacityResult.recordset.length === 0) {
      return res.status(400).json({ message: 'Xe không tồn tại' });
    }

    const capacity = capacityResult.recordset[0].SoCho;

    if (totalSeats > capacity) {
      return res.status(422).json({ message: 'Hành khách vượt quá sức chứa xe' });
    }

    // tạo lộ trình
    const routeResult = await pool
      .request()
      .input('ThoiGianBatDau', sql.DateTime, ThoiGianBatDau)
      .input('ThoiGianKetThuc', sql.DateTime, ThoiGianKetThuc || null)
      .input('LoTrinhDuKien', sql.NVarChar(sql.MAX), LoTrinhDuKien || null)
      .input('TrangThaiLoTrinh', sql.NVarChar(30), 'Chưa thực hiện')
      .input('MaXe', sql.Int, MaXe)
      .input('MaTaiXe', sql.Int, MaTaiXe)
      .input('MaNhanVien', sql.Int, MaNhanVien)
      .query(`
        INSERT INTO LoTrinhTrungChuyen
          (ThoiGianBatDau, ThoiGianKetThuc, LoTrinhDuKien, TrangThaiLoTrinh, MaXe, MaTaiXe, MaNhanVien)
        OUTPUT INSERTED.*
        VALUES (@ThoiGianBatDau, @ThoiGianKetThuc, @LoTrinhDuKien, @TrangThaiLoTrinh, @MaXe, @MaTaiXe, @MaNhanVien)
      `);

    const route = routeResult.recordset[0];

    // TODO: sinh ChiTietLoTrinh theo logic gom nhóm điểm đón/trả (hiện để trống)
    // cập nhật trạng thái vé
    await pool
      .request()
      .input('ids', sql.VarChar(sql.MAX), ticketIds.join(','))
      .query(`
        UPDATE VeTrungChuyen
        SET TrangThaiVe = N'Đã có xe trung chuyển'
        WHERE MaVe IN (SELECT TRY_CAST(value AS INT) FROM STRING_SPLIT(@ids, ','))
      `);

    res.status(201).json({ route, ticketIds });
  } catch (err) {
    console.error('Create route error:', err);
    res.status(500).json({ message: 'Lỗi tạo lộ trình', detail: err.message });
  }
});

// PUT /routes/:id - cập nhật thông tin lộ trình (giờ bắt đầu, mô tả, trạng thái)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { ThoiGianBatDau, ThoiGianKetThuc, LoTrinhDuKien, TrangThaiLoTrinh, GhiChu } =
    req.body || {};

  try {
    const pool = await getPool();

    const existing = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM LoTrinhTrungChuyen WHERE MaLoTrinh = @id');

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lộ trình' });
    }

    const current = existing.recordset[0];

    const colCheck = await pool
      .request()
      .query("SELECT COL_LENGTH('dbo.LoTrinhTrungChuyen','GhiChu') AS len");
    const hasGhiChu = colCheck.recordset?.[0]?.len != null;

    // Ràng buộc nghiệp vụ: chỉ cho phép "Hoàn thành" khi toàn bộ khách đã xử lý
    if (TrangThaiLoTrinh === 'Hoàn thành') {
      const stops = await pool
        .request()
        .input('id', sql.Int, id)
        .query('SELECT TrangThaiKhach FROM ChiTietLoTrinh WHERE MaLoTrinh = @id');
      const doneSet = new Set(['Đã trả khách', 'Khách hủy']);
      const allDone =
        stops.recordset.length > 0 &&
        stops.recordset.every((r) => doneSet.has((r.TrangThaiKhach || '').trim()));
      if (!allDone) {
        return res.status(422).json({
          message: 'Chỉ được chuyển sang "Hoàn thành" khi toàn bộ khách hàng đã được xử lý.'
        });
      }
    }

    // Khi bắt đầu chuyến => cập nhật trạng thái vé liên quan sang "Đang trung chuyển"
    if (TrangThaiLoTrinh === 'Đang thực hiện' && current.TrangThaiLoTrinh !== 'Đang thực hiện') {
      await pool
        .request()
        .input('id', sql.Int, id)
        .query(`
          UPDATE VeTrungChuyen
          SET TrangThaiVe = N'Đang trung chuyển'
          WHERE MaVe IN (SELECT MaVe FROM ChiTietLoTrinh WHERE MaLoTrinh = @id)
        `);
    }

    const request = pool
      .request()
      .input('id', sql.Int, id)
      .input('ThoiGianBatDau', sql.DateTime, ThoiGianBatDau || current.ThoiGianBatDau)
      .input('ThoiGianKetThuc', sql.DateTime, ThoiGianKetThuc || current.ThoiGianKetThuc)
      .input('LoTrinhDuKien', sql.NVarChar(sql.MAX), LoTrinhDuKien || current.LoTrinhDuKien)
      .input(
        'TrangThaiLoTrinh',
        sql.NVarChar(50),
        TrangThaiLoTrinh || current.TrangThaiLoTrinh
      );

    if (hasGhiChu) {
      request.input('GhiChu', sql.NVarChar(sql.MAX), GhiChu != null ? GhiChu : current.GhiChu);
    }

    const result = await request.query(`
      UPDATE LoTrinhTrungChuyen
      SET ThoiGianBatDau = @ThoiGianBatDau,
          ThoiGianKetThuc = @ThoiGianKetThuc,
          LoTrinhDuKien = @LoTrinhDuKien,
          ${hasGhiChu ? 'GhiChu = @GhiChu,' : ''}
          TrangThaiLoTrinh = @TrangThaiLoTrinh
      OUTPUT INSERTED.*
      WHERE MaLoTrinh = @id
    `);

    return res.json(result.recordset[0]);
  } catch (err) {
    console.error('Update route error:', err);
    res.status(500).json({ message: 'Lỗi cập nhật lộ trình', detail: err.message });
  }
});


module.exports = router;

