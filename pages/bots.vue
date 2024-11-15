<!-- pages/bots.vue -->
<template>
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Game Bots Dashboard</h1>
      
      <div class="grid md:grid-cols-2 gap-4">
        <GameBotController
          v-for="bot in bots"
          :key="bot.characterName"
          :config="bot"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import type { BotConfig } from '~/composables/useGameBot'
  
  const API_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImNhbWlsb2FjOTdAZ21haWwuY29tIiwicGFzc3dvcmRfY2hhbmdlZCI6IiJ9.TVPu6LthocQcxAoq02eM10Kjg8ndMQq1AivZqkfJ9dQ"
  
  const bots: BotConfig[] = [
    {
      apiToken: API_TOKEN,
      characterName: "Psy",
      actionType: "fight"
    },
    {
      apiToken: API_TOKEN,
      characterName: "Atlas",
      actionType: "gather",
      resource: "iron"
    },
    {
      apiToken: API_TOKEN,
      characterName: "Shiva",
      actionType: "gather",
      resource: "copper"
    },
    {
      apiToken: API_TOKEN,
      characterName: "Yoga",
      actionType: "gather",
      resource: "ash_tree"
    },
    {
      apiToken: API_TOKEN,
      characterName: "Shakti",
      actionType: "gather",
      resource: "spruce_tree"
    }
  ]
  </script>