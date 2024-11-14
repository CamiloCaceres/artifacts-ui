<template>
  <div>
    <h1>Home</h1>
    <GameLogin v-if="!isAuthenticated" />
    <div v-else>
      <CraftingCycleManager />
      <CharacterInfo />
    </div>
  </div>
</template>

<script setup>
import GameLogin from "~/components/GameLogin.vue";

const gameAuth = useGameAuth();
const { isAuthenticated } = storeToRefs(gameAuth);
</script>
