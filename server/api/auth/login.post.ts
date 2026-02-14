import db from '../../utils/db';
import bcrypt from "bcryptjs";
import * as z from 'zod';
import { ZodError } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { email, password } = loginSchema.parse(body);

    const foundUser = await db.query('SELECT * FROM users WHERE email = $1;', [email]);

    if (foundUser.rows.length === 0) {
      throw createError({
        statusCode: 401,
        message: 'Invalid email or password',
      });
    }

    const user = foundUser.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw createError({
        statusCode: 401,
        message: 'Invalid email or password',
      });
    }
    await setUserSession(event, { user: { id: user.id, name: user.name, role: user.role } });

    return { message: 'Login successful' };
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
      message: 'Failed to login',
    });
  }
})
