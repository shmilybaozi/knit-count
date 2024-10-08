<script setup>
import { DeleteFilled, Minus, Plus } from '@element-plus/icons-vue'
import { computed, onMounted, ref, toRefs } from 'vue'
import { useStore } from '../store/time.js'
import { formatTime, getFormattedDate } from '../util/index.js'
import emitter from '../util/mitt.js'

let store = useStore()

const props = defineProps({
  knit: Object
})

let { knit } = toRefs(props)

const emit = defineEmits(['update:knit'])

function handleUpdate() {
  emit('update:knit', {
    ...knit.value,
    count: count.value,
    contentArray: store.contentArray[knit.value.name]
  })
}

function handleRemove() {
  store.contentArray[knit.value.name] = []
  handleUpdate()
}

onMounted(() => {
  count.value = knit.value.count || 0
})

const count = ref(10)
const percentage = computed(() => {
  const ratio = count.value / knit.value.row
  // 保留整数并转换为百分数
  return Math.floor(ratio * 100)
})

function handleMinus() {
  if (count.value > 0) {
    count.value--
    if (store.contentArray[knit.value.name][0] && store.contentArray[knit.value.name][0].isCount) {
      store.contentArray[knit.value.name][0].isCount = false

    }
    store.contentArray[knit.value.name].unshift({
      content: `1 >>> ${count.value.toString().padStart(2, '0')} 行`,
      now: getFormattedDate(),
      isCount: false
    })
    emitter.emit('resetTimer', knit.value.name)
    handleUpdate()
  }
}

function handlePlus() {
  if (count.value < knit.value.row || knit.value.row === 0) {
    count.value++
    emitter.emit('endShow', { name: knit.value.name, status: count.value === knit.value.row })
    store.contentArray[knit.value.name].unshift({
      type: 'plus',
      content: `1 >>> ${count.value.toString().padStart(2, '0')} 行`,
      time: store.milliseconds[knit.value.name],
      now: getFormattedDate(),
      isCount: true
    })
    if (count.value) {

    }
    emitter.emit('resetTimer', knit.value.name)
    emitter.emit('startTimer', knit.value.name)
  }
  handleUpdate()

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
  </template>
  <div class="knit-ing">
    您正在编织的是第 <span>{{ count }}</span> 行
  </div>
  <div class="knit-btn">
    <el-button type="primary" plain :icon="Minus" :disabled="count === 0" @click="handleMinus" />
    <el-button
      type="primary"
      :icon="Plus"
      :disabled="count === knit.row && count !== 0"
      @click="handlePlus"
    />
    <el-popconfirm
      title="清空记录过程?"
      v-if="store.contentArray[knit.name].length > 0"
      @confirm="handleRemove"
    >
      <template #reference>
        <el-button
          style="max-width: 20px"
          type="primary"
          plain
          :icon="DeleteFilled"
        />
      </template>
    </el-popconfirm>

  </div>
  <div class="knit-content">
    <div class="content">
      <div v-for="(item, index) in store.contentArray[knit.name]" :key="index">
        <span
          v-if="item.time"
          class="diff-time"
          :class="{ 'deleted': !item.isCount }"
        >用时：{{ formatTime(item.time, true) }}</span> <span>
          <el-icon size="middle" style="vertical-align: initial">
            <Plus v-if="item.type==='plus'" color="#67C23A" />
            <Minus v-else color="#E6A23C" />
          </el-icon>
          {{ item.content }}
        </span> <span class="time">{{ item.now }}</span>
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
  flex: 1;
  overflow-y: auto;
}

.knit-btn {
  display: flex;
  .el-button {
    flex: 1;
  }
}

.content {
  color: #010101;
  width: 100%;
  overflow-y: auto;
  > div {
    padding-right: 10px;
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

.diff-time {
  margin-right: 10px;
  font-size: 12px;
  color: #999999;
}

.deleted {
  text-decoration: line-through;
}
</style>
