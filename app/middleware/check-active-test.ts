export default defineNuxtRouteMiddleware(async (to, from) => {
    const { push } = useToast();
    const testId = Number(to.params.id);

    try {
        const response = await $fetch<{ hasActiveSession: boolean; testId: number | null; sessionId?: number }>('/api/me/active-test-session');

        if (response.hasActiveSession && response.testId !== testId) {
            push({
                title: 'Test In Progress',
                description: 'Finish the current test before starting another.',
                variant: 'error',
            });

            return navigateTo('/tests');
        }
    } catch (error) {
        console.error('Error checking active session:', error);
    }
});
