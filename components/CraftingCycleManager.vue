<template>
    <div class="crafting-cycles p-4">
      <h2 class="text-xl font-bold mb-4">Crafting Cycle Manager</h2>
      
      <!-- Cycle List -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-2">Saved Cycles</h3>
        <div v-if="savedCycles.length" class="space-y-2">
          <div v-for="(cycle, index) in savedCycles" :key="index" 
               class="border p-3 rounded-lg flex justify-between items-center">
            <div>
              <span class="font-medium">{{ cycle.name }}</span>
              <span class="text-sm text-gray-600 ml-2">
                ({{ cycle.steps.length }} steps)
              </span>
            </div>
            <div class="space-x-2">
              <button @click="loadCycle(cycle)" 
                      class="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Load
              </button>
              <button @click="runSavedCycle(cycle)" 
                      :disabled="loading"
                      class="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50">
                {{ loading ? 'Running...' : 'Run' }}
              </button>
              <button @click="deleteCycle(index)"
                      class="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-500">No saved cycles yet</p>
      </div>
  
      <!-- Cycle Editor -->
      <div class="border rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-4">Create/Edit Cycle</h3>
        
        <!-- Cycle Name -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Cycle Name</label>
          <input v-model="currentCycle.name" 
                 type="text"
                 class="w-full px-3 py-2 border rounded-md" 
                 placeholder="Enter cycle name"/>
        </div>
  
        <!-- Steps Editor -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Steps</label>
          <div v-for="(step, index) in currentCycle.steps" 
               :key="index"
               class="flex gap-2 mb-2">
            <select v-model="step.action" 
                    class="px-3 py-2 border rounded-md">
              <option value="withdraw">Withdraw from Bank</option>
              <option value="deposit">Deposit to Bank</option>
              <option value="craft">Craft</option>
              <option value="move">Move</option>
            </select>
  
            <!-- Action-specific inputs -->
            <template v-if="['withdraw', 'deposit', 'craft'].includes(step.action)">
              <input v-model="step.item" 
                     type="text"
                     class="px-3 py-2 border rounded-md"
                     placeholder="Item code"/>
              <input v-model.number="step.quantity" 
                     type="number"
                     class="px-3 py-2 border rounded-md w-24"
                     placeholder="Qty"/>
            </template>
  
            <template v-if="step.action === 'move'">
              <select v-model="step.location" 
                      class="px-3 py-2 border rounded-md">
                <option value="bank">Bank</option>
                <option value="woodcutting">Woodcutting</option>
                <option value="mining">Mining</option>
              </select>
            </template>
  
            <button @click="removeStep(index)"
                    class="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
              Remove
            </button>
          </div>
  
          <button @click="addStep"
                  class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Add Step
          </button>
        </div>
  
        <!-- Save/Run Controls -->
        <div class="flex gap-2">
          <button @click="saveCycle"
                  :disabled="!currentCycle.name || !currentCycle.steps.length"
                  class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50">
            Save Cycle
          </button>
          <button @click="runCurrentCycle"
                  :disabled="loading || !currentCycle.steps.length"
                  class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50">
            {{ loading ? 'Running...' : 'Run Current Cycle' }}
          </button>
        </div>
      </div>
  
      <!-- Error Display -->
      <div v-if="error" class="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
        {{ error }}
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  import { useGameActions } from '~/composables/useGameActions'
  
  const {
    loading,
    error,
    withdrawFromBank,
    depositToBank,
    craft,
    moveToBank,
    moveToWoodcutting,
    moveToMining
  } = useGameActions()
  
  // State
  const savedCycles = ref([])
  const currentCycle = reactive({
    name: '',
    steps: []
  })
  
  // Movement map
  const locationMoves = {
    bank: moveToBank,
    woodcutting: moveToWoodcutting,
    mining: moveToMining
  }
  
  // Add empty step
  const addStep = () => {
    currentCycle.steps.push({
      action: 'withdraw',
      item: '',
      quantity: 1,
      location: 'bank'
    })
  }
  
  // Remove step at index
  const removeStep = (index) => {
    currentCycle.steps.splice(index, 1)
  }
  
  // Save current cycle
  const saveCycle = () => {
    if (!currentCycle.name || !currentCycle.steps.length) return
    
    const cycleIndex = savedCycles.value.findIndex(c => c.name === currentCycle.name)
    
    if (cycleIndex >= 0) {
      savedCycles.value[cycleIndex] = JSON.parse(JSON.stringify(currentCycle))
    } else {
      savedCycles.value.push(JSON.parse(JSON.stringify(currentCycle)))
    }
    
    // Reset current cycle
    currentCycle.name = ''
    currentCycle.steps = []
  }
  
  // Load saved cycle for editing
  const loadCycle = (cycle) => {
    currentCycle.name = cycle.name
    currentCycle.steps = JSON.parse(JSON.stringify(cycle.steps))
  }
  
  // Delete saved cycle
  const deleteCycle = (index) => {
    savedCycles.value.splice(index, 1)
  }
  
  // Execute a single step
  const executeStep = async (step) => {
    switch (step.action) {
      case 'withdraw':
        await withdrawFromBank(step.item, step.quantity)
        break
      case 'deposit':
        await depositToBank(step.item, step.quantity)
        break
      case 'craft':
        await craft(step.item, step.quantity)
        break
      case 'move':
        await locationMoves[step.location]()
        break
    }
  }
  
  // Run current cycle
  const runCurrentCycle = async () => {
    if (!currentCycle.steps.length) return
    
    try {
      for (const step of currentCycle.steps) {
        await executeStep(step)
      }
    } catch (err) {
      console.error('Error running cycle:', err)
    }
  }
  
  // Run saved cycle
  const runSavedCycle = async (cycle) => {
    try {
      for (const step of cycle.steps) {
        await executeStep(step)
      }
    } catch (err) {
      console.error('Error running saved cycle:', err)
    }
  }
  </script>