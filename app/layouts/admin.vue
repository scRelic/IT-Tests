<template>
  <div class="min-h-screen flex flex-row">
    <AdminSidebar />
    <main class="flex-1 overflow-hidden flex flex-col">
      <div class="flex-1 overflow-y-auto">
        <slot />
      </div>
    </main>
    <AppToastProvider />
  </div>
</template>
