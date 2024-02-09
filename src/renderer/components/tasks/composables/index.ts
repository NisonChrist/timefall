import { computed, ref, shallowRef } from 'vue'
import type { TaskWithRecords } from '~/services/api/types'
import { timeFormat } from '@/utils'

const { api } = window.electron

let timer: NodeJS.Timeout

const tasks = shallowRef<TaskWithRecords[]>([])

const sec = ref(0)
const currentTaskId = ref<string>()
const currentTaskItemId = ref<string>()
const lastTaskId = ref<string>()
const isStarted = ref(false)

const lastTask = computed(() => {
  return tasks.value.find(t => t.id === lastTaskId.value)
})

const timeFormatted = computed(() => {
  return timeFormat(sec.value)
})

function start(id: string) {
  if (currentTaskItemId.value)
    stop()

  timer = setInterval(() => {
    sec.value++
  }, 1000)

  currentTaskId.value = id
  currentTaskItemId.value = api.addTaskRecord({ taskId: id })
  lastTaskId.value = id

  isStarted.value = true
}

function stop() {
  clearInterval(timer)

  api.updateTaskRecordDuration(currentTaskItemId.value, sec.value)
  getTasks()

  sec.value = 0
  isStarted.value = false
  currentTaskItemId.value = undefined
  currentTaskId.value = undefined
}

function getTasks() {
  tasks.value = api.getTasks()
}

function addTask() {
  api.addTask({ name: 'Untitled Task', folderId: '' })
  getTasks()
}

function addTaskFolder() {
  api.addFolder({ name: 'Untitled Folder' })
  getTasks()
}

export function useTasks() {
  return {
    addTask,
    addTaskFolder,
    currentTaskId,
    currentTaskItemId,
    getTasks,
    isStarted,
    lastTask,
    sec,
    start,
    stop,
    tasks,
    timeFormatted,
  }
}