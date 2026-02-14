export default defineEventHandler(async (event) => {
  // 1. Проверяем, относится ли запрос к админке
  // Если URL не начинается с /api/admin, пропускаем запрос дальше
  if (!getRequestPath(event).startsWith('/api/admin')) {
    return;
  }

  // 2. Получаем сессию
  const session = await getUserSession(event);

  // 3. Логика проверки прав
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  if (session.user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    });
  }

  // Если всё ок, Nuxt автоматически пойдет к следующему middleware или к API эндпоинту
});