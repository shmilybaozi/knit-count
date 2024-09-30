<template>
  <div class="timer">
    <h1>{{ displayTime }}</h1>
    <div class="time-detail">
      <div class="total">
        总用时：{{ formatTime(totalTime, true) }}
      </div>
      <el-button
        type="primary"
        :disabled="!store.timeRunning[knit.name]"
        :icon="VideoPause"
        @click="pauseTimer"
      ></el-button>
      <el-button
        v-show="!store.timeRunning[knit.name] && store.milliseconds[knit.name]"
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
import { ElMessage } from 'element-plus'
import { onMounted, onUnmounted, ref, toRefs, watch } from 'vue'
import { useStore } from '../store/time.js'
import { formatTime } from '../util/index.js'
import emitter from '../util/mitt.js'

let store = useStore()

let timerInterval = null

const totalTime = ref(0)

const props = defineProps({
  knit: Object
})

let { knit } = toRefs(props)
const displayTime = ref(formatTime(store.milliseconds[knit.value.name]))

const startTimer = () => {
  if (!store.timeRunning[knit.value.name]) {
    store.timeRunning[knit.value.name] = true
    timerInterval = setInterval(() => {
      store.milliseconds[knit.value.name] += 10 // 更新10毫秒，以提高精度
      displayTime.value = formatTime(store.milliseconds[knit.value.name])
    }, 10)
  }
}

const pauseTimer = () => {
  if (store.timeRunning[knit.value.name]) {
    store.timeRunning[knit.value.name] = false
    clearInterval(timerInterval)
  }
}

const resetTimer = () => {
  store.timeRunning[knit.value.name] = false
  clearInterval(timerInterval)
  store.milliseconds[knit.value.name] = 0
  displayTime.value = formatTime(store.milliseconds[knit.value.name])
}

const endStatus = ref(false)

function endShow(status) {
  endStatus.value = status
}

const endTimer = () => {
  ElMessage({
    message: '🎉棒棒哦，这部分已经完成啦！',
    type: 'success'
  })
  totalTime.value += store.milliseconds[knit.value.name]
  resetTimer()
}

watch(() => store.contentArray[knit.value.name], () => {
  let time = 0
  store.contentArray && store.contentArray[knit.value.name] && store.contentArray[knit.value.name].forEach(item => {
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
      if (store.timeRunning[knit.value.name]) {
        const startTime = Date.now()
        localStorage.setItem('timerStartTime', startTime.toString())

      }
    } else if (document.visibilityState === 'visible') {
      console.log('标签页重新获得焦点')
      if (store.timeRunning[knit.value.name]) {
        const savedStartTime = localStorage.getItem('timerStartTime')
        if (savedStartTime) {
          const nowTime = Date.now()
          const diff = nowTime - Number(savedStartTime)
          store.milliseconds[knit.value.name] += diff
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
