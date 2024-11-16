import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface LogEntry {
  id: string
  timestamp: number
  botName: string
  message: string
  type: 'info' | 'error' | 'success' | 'warning'
  details?: any
}

export const useLogStore = defineStore('logs', () => {
  // State
  const logs = ref<LogEntry[]>([])
  const maxLogs = ref(1000)
  const filters = ref({
    botName: '',
    type: '' as '' | LogEntry['type'],
    search: ''
  })

  // Getters
  const filteredLogs = computed(() => {
    return logs.value.filter(log => {
      const matchesBot = !filters.value.botName || log.botName === filters.value.botName
      const matchesType = !filters.value.type || log.type === filters.value.type
      const matchesSearch = !filters.value.search || 
        log.message.toLowerCase().includes(filters.value.search.toLowerCase()) ||
        log.botName.toLowerCase().includes(filters.value.search.toLowerCase())
      
      return matchesBot && matchesType && matchesSearch
    })
  })

  const botNames = computed(() => {
    return Array.from(new Set(logs.value.map(log => log.botName)))
  })

  // Actions
  const addLog = (
    botName: string,
    message: string,
    type: LogEntry['type'] = 'info',
    details?: any
  ) => {
    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      botName,
      message,
      type,
      details
    }

    logs.value.unshift(newLog)

    // Trim logs if they exceed the maximum
    if (logs.value.length > maxLogs.value) {
      logs.value = logs.value.slice(0, maxLogs.value)
    }

    return newLog.id
  }

  const clearLogs = (botName?: string) => {
    if (botName) {
      logs.value = logs.value.filter(log => log.botName !== botName)
    } else {
      logs.value = []
    }
  }

  const setFilter = (
    filterType: keyof typeof filters.value,
    value: typeof filters.value[keyof typeof filters.value]
  ) => {
    filters.value[filterType] = value as any
  }

  const setMaxLogs = (max: number) => {
    maxLogs.value = max
    if (logs.value.length > max) {
      logs.value = logs.value.slice(0, max)
    }
  }

  const getLogsByBot = (botName: string) => {
    return logs.value.filter(log => log.botName === botName)
  }

  const getLogById = (id: string) => {
    return logs.value.find(log => log.id === id)
  }

  // Export store methods and state
  return {
    // State
    logs,
    maxLogs,
    filters,
    // Getters
    filteredLogs,
    botNames,
    // Actions
    addLog,
    clearLogs,
    setFilter,
    setMaxLogs,
    getLogsByBot,
    getLogById
  }
})