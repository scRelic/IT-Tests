import { readBody, createError } from 'h3';
import db from "../../../utils/db";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { title, description, technologies } = body;
    const result = await db.query(
      `INSERT INTO categories (title, description, technologies)
       VALUES ($1, $2, $3::text[])
       RETURNING id;`,
      [title, description || '', technologies ?? []]
    );

    setResponseStatus(event, 201);
    return {
      message: "Category created successfully",
      id: result.rows[0].id
    };

  } catch (error: any) {
    if (!error.statusCode) {
      console.error('Database error:', error);
    }

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
    });
  }
});