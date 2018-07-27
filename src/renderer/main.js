// main
import Vue from 'vue'
//import Vuetify from 'vuetify'
import 'babel-polyfill'
import './stylus/main.styl'
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

// animate.css
// import 'animate.css'
Vue.directive('image-wrapper', imageHW)

import VueAwesomeSwiper from 'vue-awesome-swiper'
Vue.use(VueAwesomeSwiper)

import Toasted from 'vue-toasted';
Vue.use(Toasted,{ 
  theme: "primary", 
  position: "bottom-center", 
  duration : 3000
})

import '@/libs/pkgs/initVuetify'

Vue.config.productionTip = false


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
