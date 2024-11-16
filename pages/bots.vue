<template>
  <div class="container mx-auto p-4">
    <div class="mb-6 space-y-4">
      <!-- Header with Summary -->
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Game Bots Dashboard</h1>
        <div class="text-sm text-gray-600">
          Active Bots: {{ activeBotCount }}/{{ bots.length }}
        </div>
      </div>

      <!-- Global Stats -->
      <div class="grid grid-cols-4 gap-4 p-4 bg-white rounded-lg shadow-sm">
        <div class="text-center">
          <div class="text-lg font-semibold">
            {{ totalXp.toLocaleString() }}
          </div>
          <div class="text-sm text-gray-600">Total XP</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-semibold">
            {{ totalGold.toLocaleString() }}
          </div>
          <div class="text-sm text-gray-600">Total Gold</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-semibold">
            {{ totalActions.toLocaleString() }}
          </div>
          <div class="text-sm text-gray-600">Total Actions</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-semibold">{{ uptime }}</div>
          <div class="text-sm text-gray-600">Uptime</div>
        </div>
      </div>

      <!-- Global Controls -->
      <div class="flex space-x-4">
        <button
          @click="startAllBots"
          :disabled="isStartingAll"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <span v-if="isStartingAll" class="animate-spin">↻</span>
          <span>{{ isStartingAll ? "Starting..." : "Start All Bots" }}</span>
        </button>
        <button
          @click="stopAllBots"
          :disabled="!hasRunningBots"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Stop All Bots
        </button>
        <button
          @click="resetAllStats"
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Reset Stats
        </button>
      </div>
    </div>

    <!-- Bot Configuration Form -->
    <div class="mb-6  border border-gray-200 p-2 rounded-lg">
      <div class="mb-4 flex justify-between items-center">
        <h2 class="text-xl font-semibold">Configure Bots</h2>
        <UButton
          variant="outline"
          color="gray"
          @click="showConfigForm = !showConfigForm"
          :icon="
            showConfigForm
              ? 'i-heroicons-chevron-up'
              : 'i-heroicons-chevron-down'
          "
        >
        </UButton>
      </div>
      <div v-if="showConfigForm">
        <div
          v-for="(bot, index) in bots"
          :key="bot.characterName"
          class="grid grid-cols-5 gap-4 mt-4 "
        >
          <p>{{ bot.characterName }}</p>
          <UFormGroup label="Action Type" class="col-span-2">
            <USelect v-model="bot.actionType" :options="['fight', 'gather']" />
          </UFormGroup>
          <UFormGroup label="Resource" class="col-span-2">
            <USelect             
              v-model="bot.resource"
              :options="Object.keys(RESOURCE_POSITIONS)"
            />
          </UFormGroup>
        </div>
        <UButton
          class="mt-4"
          block
          variant="outline"
          color="blue"
          @click="initializeBots"
        >
          Initialize Bots
        </UButton>
      </div>
    </div>

    <!-- Bot Status Cards -->
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="bot in bots"
        :key="bot.characterName"
        class="p-4 border rounded-lg shadow-sm bg-white relative"
        :class="{
          'border-green-500': getBotStatus(bot.characterName).isRunning,
          'border-red-500': getBotStatus(bot.characterName).lastError,
        }"
      >
        <!-- Card Header -->
        <div class="flex justify-between items-center mb-4">
          <div>
            <h2 class="text-xl font-semibold">{{ bot.characterName }}</h2>
            <div class="text-sm text-gray-600">
              {{ bot.actionType }}
              {{ bot.resource ? `- ${formatResource(bot.resource)}` : "" }}
            </div>
          </div>
          <div class="space-x-2">
            <button
              @click="() => startBot(bot.characterName)"
              :disabled="isBotRunning(bot.characterName)"
              class="px-3 py-1 bg-green-500 text-white text-sm rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Start
            </button>
            <button
              @click="() => stopBot(bot.characterName)"
              :disabled="!isBotRunning(bot.characterName)"
              class="px-3 py-1 bg-red-500 text-white text-sm rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Stop
            </button>
          </div>
        </div>

        <!-- Status Indicators -->
        <div class="space-y-3">
          <!-- HP Bar -->
          <div v-if="getBotStatus(bot.characterName).maxHp" class="space-y-1">
            <div class="flex justify-between text-sm">
              <span>HP</span>
              <span>
                {{ getBotStatus(bot.characterName).currentHp }}/{{
                  getBotStatus(bot.characterName).maxHp
                }}
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div
                class="h-2.5 rounded-full"
                :class="getHpColorClass(bot.characterName)"
                :style="`width: ${getHpPercentage(bot.characterName)}%`"
              ></div>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div class="space-y-2">
              <div class="flex justify-between">
                <span>Status:</span>
                <span
                  :class="
                    getBotStatus(bot.characterName).isRunning
                      ? 'text-green-500'
                      : 'text-gray-500'
                  "
                >
                  {{
                    getBotStatus(bot.characterName).isRunning
                      ? "Running"
                      : "Stopped"
                  }}
                </span>
              </div>
              <div class="flex justify-between">
                <span>Actions:</span>
                <span>{{
                  getBotStatus(bot.characterName).totalActions?.toLocaleString()
                }}</span>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span>XP:</span>
                <span>{{
                  getBotStatus(bot.characterName).totalXp?.toLocaleString()
                }}</span>
              </div>
              <div class="flex justify-between">
                <span>Gold:</span>
                <span>{{
                  getBotStatus(bot.characterName).totalGold?.toLocaleString()
                }}</span>
              </div>
            </div>
          </div>

          <!-- Last Action -->
          <div class="mt-2">
            <h3 class="text-sm font-medium">Last Action:</h3>
            <p class="text-sm text-gray-600 truncate">
              {{
                getBotStatus(bot.characterName).lastAction || "No actions yet"
              }}
            </p>
          </div>

          <!-- Error Message -->
          <div
            v-if="getBotStatus(bot.characterName).lastError"
            class="mt-2 p-2 bg-red-100 text-red-700 text-sm rounded"
          >
            {{ getBotStatus(bot.characterName).lastError }}
          </div>
        </div>
      </div>
    </div>
  </div>
  <LogViewer />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { BotConfig } from "~/types/bot";
import { useBotStore } from "~/stores/botStore";
import { storeToRefs } from "pinia";
import { RESOURCE_POSITIONS } from "~/utils/constants";

const botStore = useBotStore();
const { botsStatus } = storeToRefs(botStore);

const showConfigForm = ref(false);

// Runtime config
const runtimeConfig = useRuntimeConfig();
const API_TOKEN = runtimeConfig.public.apiToken;

// Bot configurations
const bots: BotConfig[] = [
  { apiToken: API_TOKEN, characterName: "Psy", actionType: "fight" },
  {
    apiToken: API_TOKEN,
    characterName: "Atlas",
    actionType: "gather",
    resource: "iron",
  },
  {
    apiToken: API_TOKEN,
    characterName: "Shiva",
    actionType: "gather",
    resource: "copper",
  },
  {
    apiToken: API_TOKEN,
    characterName: "Yoga",
    actionType: "gather",
    resource: "ash_tree",
  },
  {
    apiToken: API_TOKEN,
    characterName: "Shakti",
    actionType: "gather",
    resource: "spruce_tree",
  },
];

// State
const isStartingAll = ref(false);
const startTime = ref(Date.now());

// Computed properties
const activeBotCount = computed(() => {
  return Array.from(botsStatus.value.values()).filter(
    (status) => status.isRunning
  ).length;
});

const hasRunningBots = computed(() => activeBotCount.value > 0);

const totalXp = computed(() => {
  return Array.from(botsStatus.value.values()).reduce(
    (sum, status) => sum + (status.totalXp || 0),
    0
  );
});

const totalGold = computed(() => {
  return Array.from(botsStatus.value.values()).reduce(
    (sum, status) => sum + (status.totalGold || 0),
    0
  );
});

const totalActions = computed(() => {
  return Array.from(botsStatus.value.values()).reduce(
    (sum, status) => sum + (status.totalActions || 0),
    0
  );
});

const uptime = computed(() => {
  const diff = Date.now() - startTime.value;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
});

// Methods
const formatResource = (resource: string) => {
  return resource
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getHpPercentage = (characterName: string) => {
  const status = botStore.getBotStatus(characterName);
  if (!status.currentHp || !status.maxHp) return 0;
  return (status.currentHp / status.maxHp) * 100;
};

const getHpColorClass = (characterName: string) => {
  const percentage = getHpPercentage(characterName);
  if (percentage > 70) return "bg-green-500";
  if (percentage > 30) return "bg-yellow-500";
  return "bg-red-500";
};

const isBotRunning = (characterName: string) => {
  return botStore.getBotStatus(characterName).isRunning;
};

const getBotStatus = (characterName: string) => {
  return botStore.getBotStatus(characterName);
};

const startBot = async (characterName: string) => {
  const bot = bots.find((b) => b.characterName === characterName);
  if (bot) {
    botStore.startBot(characterName, bot);
  }
};

const startAllBots = async () => {
  isStartingAll.value = true;
  try {
    // Start bots with a slight delay to prevent overwhelming the API
    for (const bot of bots) {
      await botStore.startBot(bot.characterName, bot);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  } finally {
    isStartingAll.value = false;
  }
};

const stopBot = (characterName: string) => {
  botStore.stopBot(characterName);
};

const stopAllBots = () => {
  botStore.stopAllBots();
};

const resetAllStats = () => {
  bots.forEach((bot) => {
    botStore.resetBotStatus(bot.characterName);
  });
  startTime.value = Date.now();
};

// Initialize bots with the configured action types and resources
const initializeBots = () => {
  bots.forEach((bot) => {
    bot.apiToken = API_TOKEN; // Ensure the API token is set
    botStore.initializeBot(bot);
  });
};

// Lifecycle
onMounted(() => {
  bots.forEach((bot) => {
    botStore.initializeBot(bot);
  });
});

onUnmounted(() => {
  botStore.stopAllBots();
});
</script>
