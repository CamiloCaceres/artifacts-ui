<!-- components/GameLogin.vue -->
<template>
  <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6">Game Connection</h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <UFormGroup label="Game Token">
          <UInput
            v-model="token"
            type="password"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Enter your game token"
            required
          />
          <div class="flex gap-2 mt-2">
            <UButton size="sm" @click="saveToken">Save Token</UButton>
            <UButton size="sm" @click="loadToken">Load Token</UButton>
          </div>
        </UFormGroup>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Character Name</label>
        <div class="flex gap-2 mb-2">
          <UInput
            v-model="characterName"
            type="text"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Enter your character name"
            required
          />
          <UButton size="sm" @click="addCharacterName">Add</UButton>
        </div>
        <select 
          v-if="savedNames.length" 
          v-model="characterName" 
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Select saved name</option>
          <option v-for="name in savedNames" :key="name" :value="name">
            {{ name }}
          </option>
        </select>
      </div>

      <UButton type="submit">Connect</UButton>
      
    </form>

    <div v-if="error" class="mt-4 text-red-600 text-sm">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useGameAuth } from "~/stores/gameAuth";
import { useRouter } from "vue-router";
import { useCharacter } from "~/composables/useCharacter";
const gameAuth = useGameAuth();
const router = useRouter();
const { fetchCharacterInfo } = useCharacter();
const token = ref("");
const characterName = ref("");
const error = ref("");
const savedNames = ref([]);

// Local Storage functions
const saveToken = () => {
  if (token.value) {
    localStorage.setItem('gameToken', token.value);
  }
};

const loadToken = () => {
  const savedToken = localStorage.getItem('gameToken');
  if (savedToken) {
    token.value = savedToken;
  }
};

const addCharacterName = () => {
  if (characterName.value && !savedNames.value.includes(characterName.value)) {
    savedNames.value.push(characterName.value);
    localStorage.setItem('characterNames', JSON.stringify(savedNames.value));
  }
};

onMounted(() => {
  // Load saved names
  const names = localStorage.getItem('characterNames');
  if (names) {
    savedNames.value = JSON.parse(names);
  }
  
  // Load saved token
  loadToken();
});

const handleSubmit = async () => {
  try {
    error.value = "";
    gameAuth.setCredentials(token.value, characterName.value);
    fetchCharacterInfo();
  } catch (err) {
    error.value = "Failed to connect. Please check your credentials.";
    gameAuth.clearCredentials();
  }
};
</script>
