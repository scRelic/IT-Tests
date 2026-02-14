<template>
  <div class="min-h-screen flex flex-row">
    <AdminSidebar />
    <main class="flex-1">
      <slot />
    </main>
    <AppToastProvider />
  </div>
</template>
