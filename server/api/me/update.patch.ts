import db from '../../utils/db'
import * as z from 'zod'
import { ZodError } from 'zod'

const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(50).optional(),
    email: z.string().trim().email().optional(),
    birth_date: z
      .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.null()])
      .optional(),
  })
  .refine((data) => data.name !== undefined || data.email !== undefined || data.birth_date !== undefined, {
    message: 'At least one field must be provided',
  })

export default defineEventHandler(async (event) => {
  try {
    const session = await getUserSession(event) as { user: { id: number; name: string }; id: string };

    if (!session || !session.user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      });
    }

    const userId = session.user.id;

    const body = await readBody(event);
    const { name, email, birth_date } = updateProfileSchema.parse(body);

    if (email) {
      const { rows } = await db.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );

      if (rows.length > 0) {
        throw createError({
          statusCode: 409,
          message: 'Email is already in use by another account',
        });
      }
    }

    const sets: string[] = [];
    const values: Array<string | number | null> = [];

    if (name !== undefined) {
      sets.push(`name = $${values.push(name)}`);
    }
    if (email !== undefined) {
      sets.push(`email = $${values.push(email)}`);
    }
    if (birth_date !== undefined) {
      sets.push(`birth_date = $${values.push(birth_date)}`);
    }

    values.push(userId);
    const query = `UPDATE users SET ${sets.join(', ')} WHERE id = $${values.length}`;

    await db.query(query, values);

    return { message: 'Profile updated successfully' };

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
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    console.error("Error updating user profile:", error);
    throw createError({
      statusCode: 500,
      message: 'Failed to update profile',
    })

  }
})
