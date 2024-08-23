<script setup>
import { Minus, Plus } from '@element-plus/icons-vue'
import { computed, onMounted, ref, toRefs } from 'vue'
import { getFormattedDate } from '../util/index.js'

const props = defineProps({
  knit: Object
})

const emit = defineEmits(['update:knit'])

let { knit } = toRefs(props)

onMounted(() => {
  count.value = knit.value.count || 0
  contentArray.value = knit.value.contentArray || []
})

const count = ref(10)
const percentage = computed(() => {
  const ratio = count.value / knit.value.row
  // 保留整数并转换为百分数
  return Math.floor(ratio * 100)
})

const contentArray = ref([])

function handleMinus() {
  if (count.value > 0) {
    count.value--
    contentArray.value.unshift({
      content: `-1行 ${count.value} 行`,
      time: getFormattedDate()
    })
    emit('update:knit', {
      ...knit.value,
      count: count.value,
      contentArray: contentArray.value
    })
  }
}

function handlePlus() {
  if (count.value < knit.value.row) {
    count.value++
    contentArray.value.unshift({
      content: `-1行 ${count.value} 行`,
      time: getFormattedDate()
    })
    emit('update:knit', {
      ...knit.value,
      count: count.value,
      contentArray: contentArray.value
    })
  }
}
</script>

<template>
  <template v-if="knit.row">
    <div class="knit-progress">
      <div class="knit-detail">
        <div class="percentage">{{ percentage }}%</div>
        <div class="count-row">{{ count }} / {{ knit.row }} 行</div>
      </div>
      <el-progress
        :percentage="percentage"
        :show-text="false"
        :stroke-width="15"
        striped
      />
    </div>
    <div class="knit-ing">
      您正在编织的是第 <span>{{ count }}</span> 行
    </div>
  </template>
  <div class="knit-btn">
    <el-button type="primary" plain :icon="Minus" :disabled="count === 0" @click="handleMinus" />
    <el-button type="primary" :icon="Plus" :disabled="count === knit.row" @click="handlePlus" />
  </div>
  <div class="knit-content">
    <div class="content">
      <div v-for="(item, index) in contentArray" :key="index">
        <span>{{ item.content }}</span> <span class="time">{{ item.time }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.knit-progress {
  display: flex;
  padding: 0 10px 10px;
}

.knit-detail {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .percentage {
    font-size: 20px;
    font-weight: 700;
    color: #409eff;
  }
  .count-row {
    font-size: 14px;
  }
}

.el-progress {
  margin-left: 10px;
  flex: 1;
}

.knit-content {
  display: flex;
}

.knit-btn {
  display: flex;
  .el-button {
    flex: 1;
  }
}

.content {
  flex: 1;
  color: #010101;
  > div {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  .time {
    margin-left: 10px;
    font-size: 12px;
    color: #999999;
  }
}

.knit-ing {
  height: 50px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: pink;
  color: #5d4242;
  margin: 10px 40px;
  span {
    font-size: 20px;
    font-weight: 700;
    margin: 6px;
  }
}
</style>
