<script setup lang="ts">
const { fetchUser } = useUser();
await fetchUser();
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <LayoutAppHeader />
    <LayoutClientSidebar />
    <main class="flex-1">
      <slot />
    </main>
    <LayoutAppFooter />
    <AppToastProvider />
  </div>
</template>
