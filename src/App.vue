<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import KnitCount from './components/KnitCount.vue'
import KnitTime from './components/KnitTime.vue'

let tabIndex = 0
const editableTabsValue = ref('1')
const editableTabs = ref([])

const addTab = ({ name, row, readyRow }) => {
  const newTabName = `${++tabIndex}`
  editableTabs.value.push({
    title: name,
    name: newTabName,
    row: row,
    count: readyRow
  })
  editableTabsValue.value = newTabName
}

const removeTab = (targetName) => {
  const tabs = editableTabs.value
  let activeName = editableTabsValue.value
  if (activeName === targetName) {
    tabs.forEach((tab, index) => {
      if (tab.name === targetName) {
        const nextTab = tabs[index + 1] || tabs[index - 1]
        if (nextTab) {
          activeName = nextTab.name
        }
      }
    })
  }

  editableTabsValue.value = activeName
  editableTabs.value = tabs.filter((tab) => tab.name !== targetName)

}
const dialogVisible = ref(false)
const dialogTitle = ref('新增')

const form = reactive({
  name: '',
  row: 0,
  readyRow: 0
})
const ruleFormRef = ref(null)
const rules = reactive({
  name: [
    { required: true, message: '请填写部位名称', trigger: 'blur' }
  ]
})

const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      addTab(form)
      dialogVisible.value = false
      formEl.clearValidate()
      formEl.resetFields()
    } else {
      console.log('error submit!', fields)
    }
  })
}

function saveTabsToLocalStorage() {
  // 将 tabs 转换为 JSON 字符串
  const tabsJson = JSON.stringify(editableTabs.value)

  // 保存到 localStorage
  localStorage.setItem('knit', tabsJson)
}

function loadTabsFromLocalStorage() {
  const tabsJson = localStorage.getItem('knit')
  if (tabsJson) {
    editableTabs.value = JSON.parse(tabsJson)
    if (editableTabs.value.length > 0) {
      editableTabsValue.value = editableTabs.value[editableTabs.value.length - 1].name
    }
  }
}

onMounted(() => {
  loadTabsFromLocalStorage()
})

watch(() => editableTabs.value,
  () => {
    saveTabsToLocalStorage()
  },
  { deep: true }
)

const resetForm = (formEl) => {
  if (!formEl) return
  formEl.clearValidate()
  formEl.resetFields()
  dialogVisible.value = false
}

function handleChange(knit) {
  const tabs = editableTabs.value.filter((item) => item.name !== knit.name)
  editableTabs.value = [...tabs, knit]
}
</script>

<template>
  <div class="knit-container" :class="{'init-knit': editableTabs.length === 0}">
    <el-button
      v-if="editableTabs.length === 0"
      @click="dialogVisible = true"
      type="primary"
    >
      开启美好编织
    </el-button>
    <div v-if="editableTabs.length > 0" style="margin-bottom: 10px">
      <el-button size="small" @click="dialogVisible = true">
        新增计算页
      </el-button>
    </div>
    <el-tabs
      v-if="editableTabs.length > 0"
      v-model="editableTabsValue"
      type="card"
      closable
      @tab-remove="removeTab"
    >
      <el-tab-pane
        v-for="item in editableTabs"
        :key="item.name"
        :label="item.title"
        :name="item.name"
      >
        <knit-time />
        <knit-count :knit="item" @update:knit="handleChange" />
      </el-tab-pane>
    </el-tabs>
  </div>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="500"
  >
    <el-form ref="ruleFormRef" :model="form" label-width="auto" :rules="rules">
      <el-form-item label="部位名称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="总行数" prop="row">
        <el-input-number v-model="form.row" :min="0" />
      </el-form-item>
      <el-form-item label="已织行数">
        <el-input-number v-model="form.readyRow" :min="0" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="resetForm(ruleFormRef)">取消</el-button>
        <el-button type="primary" @click="submitForm(ruleFormRef)">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.knit-container {
  width: 100%;
  height: 100%;
}

.init-knit {
  display: flex;
  align-items: center;
  justify-content: center;
}

.el-tabs {
  height: calc(100% - 34px);
}

:deep(.el-tab-pane) {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>

<style>
/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  /* 设置滚动条宽度 */
  height: 8px;
  /* 设置滚动条高度 */
}

::-webkit-scrollbar-thumb {
  background-color: #757b96;
  /* 设置滑块背景色 */
  border-radius: 3px;
  /* 设置滑块边角圆角程度 */
}

::-webkit-scrollbar-track {
  background-color: transparent;
  /* 设置滚动条轨道背景色 */
  border-radius: 50%;
  /* 设置滚动条轨道边角圆角程度 */
}

::-webkit-scrollbar-button {
  display: none;
  /* 不显示按钮 */
}
</style>
