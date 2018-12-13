// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import iView from 'iview'
import '../my-theme/dist/iview.css'
import strings from '@/store/strings.js'
import utils from '@/store/utils.js'
import axios from 'axios'
import api from '@/api'
import VueBus from 'vue-bus'
import 'animate.css'

Vue.config.productionTip = false
Vue.use(iView)
Vue.use(VueBus)
Vue.prototype.$http = axios
Vue.prototype.$str = strings.simple
Vue.prototype.$util = utils.functions
Vue.prototype.$api = api

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
