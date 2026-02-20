<script setup lang="ts">
const { fetchUser } = useUser();
await fetchUser();
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <LayoutAppHeader />
    <LayoutClientSidebar />
    <div class="flex-1">
      <slot />
    </div>
    <LayoutAppFooter />
    <AppToastProvider />
  </div>
</template>
