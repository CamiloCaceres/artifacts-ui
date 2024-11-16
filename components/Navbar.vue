<template>
  <nav class="p-4 shadow-md">
    <div class="container mx-auto flex items-center justify-between w-full">
      <div class="flex justify-between">
        <UButton to="/" variant="ghost" class="text- hover:text-gray-300">
          Artifacts MMO Bots
        </UButton>
        <div class="flex gap-4">
          <UButton to="/bots" variant="ghost" class="text- hover:text-gray-300">
            All Bots
          </UButton>
          <UButton
            to="/bot-status"
            variant="ghost"
            class="text- hover:text-gray-300"
          >
            Bot Status
          </UButton>
        </div>
      </div>
    </div>
  </nav>
</template>
