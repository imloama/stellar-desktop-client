// main
import Vue from 'vue'
//import Vuetify from 'vuetify'
import 'babel-polyfill'
import App from './App'
import router from './router'
import store from './store'
import { i18n }  from './locales/index'
require('./filters/index')
require('./directives/swiper')
import imageHW from './directives/imageHW'
require('./api/index')
import { setVuexStore } from './streams'
import { AXIOS_DEFAULT_TIMEOUT } from './api/gateways'
import axios from 'axios'
require('./api/utils') 
import electron from 'electron'
// animate.css
// import 'animate.css'
Vue.directive('image-wrapper', imageHW)

import VueAwesomeSwiper from 'vue-awesome-swiper'
Vue.use(VueAwesomeSwiper)

import MLayout from './components/MLayout.vue'
Vue.component('m-layout', MLayout)

import Toasted from 'vue-toasted';
Vue.use(Toasted,{ 
  theme: "primary", 
  position: "bottom-center", 
  duration : 3000
})

import '@/libs/pkgs/initVuetify'

Vue.config.productionTip = false

Vue.prototype.$electron = electron


axios.defaults.timeout = AXIOS_DEFAULT_TIMEOUT

/* eslint-disable no-new */
export const app =new Vue({
  el: '#app',
  router,
  store,
  i18n,
  template: '<App/>',
  components: { App }
})
