export const useSidebar = () => {
  const mobileOpen = useState<boolean>("sidebar:mobileOpen", () => false);
  const desktopOpen = useState<boolean>("sidebar:desktopOpen", () => true);
  const initialized = useState<boolean>("sidebar:initialized", () => false);

  const openMobile = () => {
    mobileOpen.value = true;
  };

  const closeMobile = () => {
    mobileOpen.value = false;
  };

  const toggleMobile = () => {
    mobileOpen.value = !mobileOpen.value;
  };

  const openDesktop = () => {
    desktopOpen.value = true;
  };

  const closeDesktop = () => {
    desktopOpen.value = false;
  };

  const toggleDesktop = () => {
    desktopOpen.value = !desktopOpen.value;
  };

  const isDesktop = () => {
    if (!process.client) return false;
    return window.innerWidth >= 1024;
  };

  const toggleSidebar = () => {
    if (isDesktop()) {
      toggleDesktop();
      closeMobile();
      return;
    }

    toggleMobile();
  };

  if (process.client && !initialized.value) {
    initialized.value = true;

    const route = useRoute();
    watch(
      () => route.path,
      () => {
        closeMobile();
      },
    );

    let previousOverflow: string | null = null;
    watch(
      mobileOpen,
      (isOpen) => {
        if (!document?.body) return;

        if (isOpen) {
          previousOverflow = document.body.style.overflow;
          document.body.style.overflow = "hidden";
        } else {
          document.body.style.overflow = previousOverflow ?? "";
          previousOverflow = null;
        }
      },
      { immediate: true },
    );

    window.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobile();
    });
  }

  return {
    mobileOpen,
    desktopOpen,
    openMobile,
    closeMobile,
    toggleMobile,
    openDesktop,
    closeDesktop,
    toggleDesktop,
    toggleSidebar,
  };
};
