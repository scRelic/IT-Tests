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

    const { level, exp } = await readBody<{ level: string; exp: number }>(event);

    await db.query(
      'UPDATE users SET level = $1, exp = $2 WHERE id = $3',
      [level, exp, userId]
    );

    return { message: 'Level updated successfully' };

  } catch (error: any) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    console.error("Error updating user level:", error);
    throw createError({
      statusCode: 500,
      message: 'Failed to update level',
    })

  }
})
