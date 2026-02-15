import ExcelJS from "exceljs";
import pool from "~~/server/utils/db";

type UserRow = {
  id: number;
  email: string;
  created_at: Date | string | null;
  last_visit_date: Date | string | null;
  level: number | null;
  exp: number | null;
  role: string | null;
};

const excelSafe = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /^[=+\-@]/.test(s) ? `'${s}` : s;
};

const toDate = (v: Date | string | null) => (v ? new Date(v) : null);

export default defineEventHandler(async (event) => {
  try {

    const { rows } = await pool.query<UserRow>(`
      SELECT id, email, created_at, last_visit_date, level, exp, role
      FROM users
      ORDER BY id DESC
      LIMIT 500
    `);

    const wb = new ExcelJS.Workbook();
    wb.creator = "Nuxt Export";
    const ws = wb.addWorksheet("Users");

    ws.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Email", key: "email", width: 35 },
      { header: "Created At", key: "created_at", width: 22 },
      { header: "Last Visit Date", key: "last_visit_date", width: 22 },
      { header: "Level", key: "level", width: 10 },
      { header: "EXP", key: "exp", width: 10 },
      { header: "Role", key: "role", width: 15 },
    ];

    for (const r of rows) {
      ws.addRow({
        id: r.id,
        email: excelSafe(r.email),
        created_at: toDate(r.created_at),
        last_visit_date: toDate(r.last_visit_date),
        level: r.level ?? null,
        exp: r.exp ?? null,
        role: excelSafe(r.role),
      });
    }

    ws.getRow(1).font = { bold: true };
    ws.views = [{ state: "frozen", ySplit: 1 }];
    ws.autoFilter = { from: "A1", to: "G1" };

    ws.getColumn("created_at").numFmt = "yyyy-mm-dd hh:mm:ss";
    ws.getColumn("last_visit_date").numFmt = "yyyy-mm-dd hh:mm:ss";

    const buffer = await wb.xlsx.writeBuffer();

    setHeader(event, "Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    setHeader(event, "Content-Disposition", "attachment; filename=users.xlsx");

    return Buffer.from(buffer);
  } catch (error) {
    console.error("Error exporting users to Excel:", error);
    throw createError({ statusCode: 500, message: "Failed to export users" });
  }
});
