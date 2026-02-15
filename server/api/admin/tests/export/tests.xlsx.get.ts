import ExcelJS from "exceljs";
import pool from "~~/server/utils/db";

type TestRow = {
  id: number;
  title: string;
  description: string;
  category_name: string;
  created_at: Date | string | null;
};

const toDate = (v: Date | string | null) => (v ? new Date(v) : null);

export default defineEventHandler(async (event) => {
  try {

    const { rows } = await pool.query<TestRow>(`
        SELECT
          t.id,
          t.title,
          t.description,
          t.category_id,
          c.title AS category_name,
          t.created_at
        FROM tests t
        LEFT JOIN categories c ON c.id = t.category_id
        ORDER BY t.id DESC
        LIMIT 500
      `);

    const wb = new ExcelJS.Workbook();
    wb.creator = "Nuxt Export";
    const ws = wb.addWorksheet("Tests");

    ws.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Title", key: "title", width: 45 },
      { header: "Description", key: "description", width: 100 },
      { header: "Category", key: "category_name", width: 25 },
      { header: "Created At", key: "created_at", width: 20 }
    ];

    for (const r of rows) {
      ws.addRow({
        id: r.id,
        title: r.title,
        description: r.description,
        category_name: r.category_name,
        created_at: toDate(r.created_at),
      });
    }

    ws.getRow(1).font = { bold: true };
    ws.views = [{ state: "frozen", ySplit: 1 }];
    ws.autoFilter = { from: "A1", to: "E1" };

    ws.getColumn("created_at").numFmt = "yyyy-mm-dd hh:mm:ss";

    const buffer = await wb.xlsx.writeBuffer();

    setHeader(event, "Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    setHeader(event, "Content-Disposition", "attachment; filename=tests.xlsx");

    return Buffer.from(buffer);
  } catch (error) {
    console.error("Error exporting tests to Excel:", error);
    throw createError({ statusCode: 500, message: "Failed to export tests" });
  }
});
