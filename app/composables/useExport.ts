export const useExport = () => {
    const pending = ref(false);
    const error = ref<string | null>(null);

    const downloadFile = async (path: string, filename?: string) => {
        if (process.server) return;

        try {
            pending.value = true;
            error.value = null;

            const blob = await $fetch<Blob>(path, {
                method: "GET",
                responseType: "blob",
                credentials: "include",
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.href = url;
            a.download = filename ?? "download";
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Failed to download file:", e);
            error.value = "Не удалось скачать файл";
        } finally {
            pending.value = false;
        }
    };

    return {
        downloadFile,
        pending,
        error,
    };
};
