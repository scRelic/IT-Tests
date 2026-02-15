export default defineEventHandler(async (event) => {
  if (!(event.path ?? '').startsWith('/api/admin')) {
    return;
  }

  const session = await getUserSession(event)

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  if (session.user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  }
})
