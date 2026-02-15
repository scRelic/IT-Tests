import ExcelJS from "exceljs";
import pool from "~~/server/utils/db";

type CategoryRow = {
  id: number;
  title: string;
  description: string;
  technologies: string;
  created_at: Date | string | null;
};

const toDate = (v: Date | string | null) => (v ? new Date(v) : null);

export default defineEventHandler(async (event) => {
  try {


    const { rows } = await pool.query<CategoryRow>(`
      SELECT id, title, description, technologies, created_at
      FROM categories
      ORDER BY id DESC
      LIMIT 500
    `);

    const wb = new ExcelJS.Workbook();
    wb.creator = "Nuxt Export";
    const ws = wb.addWorksheet("Categories");

    ws.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Title", key: "title", width: 35 },
      { header: "Description", key: "description", width: 50 },
      { header: "Technologies", key: "technologies", width: 30 },
      { header: "Created At", key: "created_at", width: 22 }
    ];

    for (const r of rows) {
      ws.addRow({
        id: r.id,
        title: r.title,
        description: r.description,
        technologies: r.technologies,
        created_at: toDate(r.created_at),
      });
    }

    ws.getRow(1).font = { bold: true };
    ws.views = [{ state: "frozen", ySplit: 1 }];
    ws.autoFilter = { from: "A1", to: "E1" };

    ws.getColumn("created_at").numFmt = "yyyy-mm-dd hh:mm:ss";

    const buffer = await wb.xlsx.writeBuffer();

    setHeader(event, "Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    setHeader(event, "Content-Disposition", "attachment; filename=categories.xlsx");

    return Buffer.from(buffer);
  } catch (error) {
    console.error("Error exporting categories to Excel:", error);
    throw createError({ statusCode: 500, message: "Failed to export categories" });
  }
});
