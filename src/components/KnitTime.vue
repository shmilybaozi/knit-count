<template>
  <div class="timer">
    <h1>{{ displayTime }}</h1>
    <div class="time-detail">
      <div class="total">
        总用时：{{ formatTime(totalTime, true) }}
      </div>
      <el-button
        type="primary"
        :disabled="!store.timeRunning"
        :icon="VideoPause"
        @click="pauseTimer"
      ></el-button>
      <el-button
        v-show="!store.timeRunning && store.milliseconds"
        type="primary"
        :icon="VideoPlay"
        @click="startTimer"
      ></el-button>
      <el-button
        v-show="endStatus"
        type="primary"
        @click="endTimer"
      >结束
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { VideoPause, VideoPlay } from '@element-plus/icons-vue'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useStore } from '../store/time.js'
import { formatTime } from '../util/index.js'
import emitter from '../util/mitt.js'

let store = useStore()

const displayTime = ref(formatTime(store.milliseconds))
let timerInterval = null

const totalTime = ref(0)

const startTimer = () => {
  if (!store.timeRunning) {
    store.timeRunning = true
    timerInterval = setInterval(() => {
      store.milliseconds += 10 // 更新10毫秒，以提高精度
      displayTime.value = formatTime(store.milliseconds)
    }, 10)
  }
}

const pauseTimer = () => {
  if (store.timeRunning) {
    store.timeRunning = false
    clearInterval(timerInterval)
  }
}

const resetTimer = () => {
  store.timeRunning = false
  clearInterval(timerInterval)
  store.milliseconds = 0
  displayTime.value = formatTime(store.milliseconds)
}

const endStatus = ref(false)

function endShow(status) {
  endStatus.value = status
}

const endTimer = () => {
  totalTime.value += store.milliseconds
  resetTimer()
}

watch(() => store.contentArray, () => {
  let time = 0
  store.contentArray.forEach(item => {
    if (item.time && item.isCount) {
      time += item.time
    }
  })
  totalTime.value = time
}, { deep: true, immediate: true })

onMounted(() => {
  emitter.on('startTimer', startTimer)
  emitter.on('resetTimer', resetTimer)
  emitter.on('endShow', endShow)

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      console.log('标签页失去焦点')
      if (store.timeRunning) {
        const startTime = Date.now()
        localStorage.setItem('timerStartTime', startTime.toString())

      }
    } else if (document.visibilityState === 'visible') {
      console.log('标签页重新获得焦点')
      if (store.timeRunning) {
        const savedStartTime = localStorage.getItem('timerStartTime')
        if (savedStartTime) {
          const nowTime = Date.now()
          const diff = nowTime - Number(savedStartTime)
          store.milliseconds += diff
          console.log(`💙💙💙💙  -> diff ==>`, diff)
        }

      }
    }
  })
})

// 清除定时器
onUnmounted(() => {
  clearInterval(timerInterval)
  emitter.off('startTimer', startTimer)
  emitter.off('resetTimer', resetTimer)
})
</script>

<style scoped>
.timer {
  text-align: center;
  font-family: Arial, sans-serif;
  .total {
    margin-right: 20px;
  }
}

.time-detail {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.button {
  margin: 5px;
}
</style>
