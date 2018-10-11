import Vue from 'vue'
import App from './App'
import router from './router'
import Vuex from 'vuex'
import store from './vuex/store'
import comJS from './common/common'
import 'element-ui/lib/theme-chalk/index.css'
import { Input, Loading, Button } from 'element-ui'

Vue.use(Vuex)
Vue.use(Input);
Vue.use(Button);
Vue.use(Loading.directive)

Vue.prototype.$com = comJS // 这是公共方法

Vue.config.productionTip = false

if (!store.state.connectStatus) { // 判断是不是连接状态，不是的话就进行连接
  comJS.RongIMInit()
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
