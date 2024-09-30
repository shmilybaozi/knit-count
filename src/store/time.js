import { defineStore } from 'pinia'

export const useStore = defineStore('knitTime', {
  state: () => { // state 推荐用箭头函数的方式 利于类型推断
    return {
      timeRunning: false,
      milliseconds: 0,
      contentArray: [],
    }
  }
})
