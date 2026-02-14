import db from '../../utils/db';
import bcrypt from "bcryptjs";
import * as z from 'zod';
import { ZodError } from 'zod';


const registerSchema = z.object({
  name: z.string().min(6).max(20),
  email: z.string().email(),
  password: z.string().min(6).max(100)
});

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { name, email, password } = registerSchema.parse(body);

    const foundUser = await db.query('SELECT id FROM users WHERE email = $1;', [email]);

    if (foundUser.rows.length > 0) {
      throw createError({
        statusCode: 409,
        message: 'User with this email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3) RETURNING id, name, email, created_at;`,
      [name, email, hashedPassword]
    );

    return { message: 'User registered successfully', user: result.rows[0] };
  } catch (error: any) {
    if (error instanceof ZodError) {
      throw createError({
        statusCode: 400,
        data: error.issues.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
        message: 'Validation error',
      });
    }

    if (error?.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to register user',
    });
  }
})
