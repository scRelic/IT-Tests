import { promises as fs } from "node:fs";
import path from "node:path";
import db from "../../utils/db";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event) as { user: { id: number; name: string }; id: string };

  if (!session || !session.user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  const userId = session.user.id;

  const form = await readMultipartFormData(event);
  const file = form?.find((f) => f.name === "avatar");
  if (!file || !file.data) throw createError({ statusCode: 400, message: "No file" });

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type || "")) throw createError({ statusCode: 400, message: "Invalid type" });

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `${session.user.id}-${Date.now()}.${ext}`;
  const dir = path.resolve("public", "uploads", "avatars");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), file.data);

  const url = `/uploads/avatars/${filename}`;
  await db.query("UPDATE users SET avatar_url = $1 WHERE id = $2", [url, userId]);

  return { avatar_url: url };
});
