import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/components/index'
import Locker from '@/components/locker'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Index',
      components: {
        default: Index,
        locker: Locker
      }
    }
  ]
})
