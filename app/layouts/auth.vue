<template>
  <div class="min-h-screen flex flex-col">
    <header class="sticky top-0 z-10 bg-[#0d0f14]/85 backdrop-blur-[10px] border-b border-[#262C45] py-4">
      <div class="container">
        <div>
          <NuxtLink to="/">
            <h1 class="text-[#6C7CFF] text-[20px] font-[700]">IT Tests</h1>
          </NuxtLink>
        </div>
      </div>
    </header>
    <main class="flex-1">
      <slot />
    </main>
    <AppToastProvider />
  </div>
</template>
