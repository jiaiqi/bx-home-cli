import Vue from 'vue'
import App from './App'
import store from './store'
import bxUtil from '@/common/util.js' // 公共方法(工具函数)
import bxBusinessFunction from '@/common/specific.js' // 通用业务函数
import cuCustom from './colorui/components/cu-custom.vue'
import themeUtil from '@/common/theme/themeUtil.js'
Vue.use(themeUtil)

Vue.component('cu-custom', cuCustom)
import uView from "uview-ui";
Vue.use(uView);

Vue.config.productionTip = false

Vue.use(bxUtil) // 公共方法
Vue.use(bxBusinessFunction) // 通用业务函数

App.mpType = 'app'

const app = new Vue({
  store,
  ...App
})

app.$mount()
