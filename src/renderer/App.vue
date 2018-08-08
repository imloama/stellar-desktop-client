<template>
<div>

  <v-app :class="'app ' + (showFuzzyView?'fuzzy-app':'') " dark>
      <v-content class="contentx">
        <router-view />
      </v-content>
      <v-footer class="footright pa-3">
        <div>v{{version}}</div>
        <v-spacer></v-spacer>
        <div>
          <span v-for="(item,index) in languages" :key="index" 
            :class="'pl-1 pr-1 lanspan ' + (locale && locale.key===item.key ? 'activelan':'')"
            @click="changeLan(item)">
            <img :src="item.img" style="height: 24px;"/>
          </span>
        </div>
      </v-footer>

  </v-app>

  <div class="fuzzy-view" v-if="showFuzzyView">

  </div>


</div>
</template>

<script>
import Vue from "vue";
import { mapActions, mapState } from "vuex";
import PinCode from "@/components/PinCode";
import { defaultTradePairsAPI,initFundConfig,APP_VERSION } from "@/api/gateways";
import { closeStreams, initStreams } from "@/streams";
import { initStorage, checkPlatform } from "@/api/storage";
import { getDeviceLanguage, ZH_CN } from "@/locales";
import  TabBar from '@/components/TabBar'
import { getFchainRss } from '@/api/fchain'
import { PLATFORM_IS_IOS } from '@/store/modules/AppSettingStore'
import { FCHAIN_HORIZON } from '@/api/horizon'
import { LANGUAGES } from '@/locales'
import { ipcRenderer } from 'electron'
export default {
  data() {
    return {
      pauseStart: null, //暂时的起始时间
      pauseMaxSecond: 60, //最大
      isios: false,
      devicelang: null,
      showFuzzyView: false,
      tabBarShow: false,
      tabBarItems: ['MyAssets', 'TradeCenter', 'Apps', 'My'],

      messagesInterval: null,
      updateConfirmDlg: false,
      latestVersion: null,
      updating: false,
      // items:Store.fetch(),
      version: APP_VERSION,
      languages:LANGUAGES,
    };
  },
  watch: {
    '$route'(to,from){
      if(this.tabBarItems.indexOf(to.name) >= 0){
        this.tabBarShow = true
        this.$store.commit('SHOW_TABBAR')
      }else{
        this.tabBarShow = false
        this.$store.commit('HIDE_TABBAR')
      }
    },
    showTabbar(value){
      // console.log('-------------2:'+value)
      this.tabBarShow = value
    }    
  },
  computed: {
    ...mapState({
      showloading: state => state.showloading,
      locale: state => state.app.locale,
      alldata: state => state,
      address: state => state.accounts.selectedAccount.address,
      iosstatusbarcolor: state => state.iosstatusbarcolor,
      accounts: state => state.accounts.data,
      showTabbar: state => state.showTabbar,
      isFull: state => state.isFull,
    }),
  },
  beforeMount() {
    if(this.locale){
      this.$i18n.locale = this.locale.key
    }
    
    this.getMessages()
    try {
        //获取默认交易对
        // defaultTradePairsAPI();
        // initFundConfig();
        this.loadDApps().then(data=>{}).catch(err=>{});
        this.loadFundConfig().then(data=>{}).catch(err=>{})
      } catch (err) {
        console.error(err);
      }
      //TODO 默认系统语言
      // this.$i18n.locale = this.devicelang.key
      this.loadAppSetting()
        .then(data=>{
           return this.loadAccounts();
        })
        .then(data => {
          //尝试加载当前账户信息
          try {
            if (this.address) {
              //this.getAccountInfo(this.address)
              //closeStreams();
              
              // initStreams(this.address);
              this.getAllAssetHosts();
            }
            this.saveDefaultTradePairsStat().then(()=>{}).catch(err=>{console.error(err)});
          } catch (err) {
            console.log(err);
          }
          if (this.alldata.app.enablePin) {
            this.$router.push({ name: "PinLock" });
          } else {
            if (this.accounts.length === 0) {
              this.$router.push({ name: "Wallet" });
            } else {
              this.$router.push({ name: "MyAssets" });
            }
          }
        })
        .catch(err => {
          console.log("load app setting error ");
          console.log(err);
          
          this.saveAppSetting({ locale: this.devicelang||ZH_CN });
          this.$router.push({ name: "Wallet" });
        });


    ipcRenderer.on('lock', (event, message)=>{
        if (this.alldata.app.enablePin) {
          this.$router.push({ name: "PinLock" });
        } 
    })
  },
  mounted() {
    //每小时执行一次
    this.messagesInterval = setInterval(()=>{
      this.getMessages()
    }, 3600000)    
  },
  destroyed() {
      clearInterval(this.messagesInterval)
  },
  methods: {
    ...mapActions([
      "deviceLang",
      "loadAppSetting",
      "getLedger",
      "loadAccounts",
      "saveAppSetting",
      "afterPauseAppSetting",
      "getAccountInfo",
      "getAllAssetHosts",
      "onPause",
      "onResume",
      "getMessages",
      "saveDefaultTradePairsStat",
      'loadDApps',
      'loadFundConfig',
      'setLocale',
    ]),
    showTabbarView(){
      this.tabBarShow = true
    },
    hideTabbarView(){
      this.tabBarShow = false
    },
    changeLan(item){
      this.setLocale(item)
        .then(()=>{
          this.$i18n.locale = item.key
        })
        .catch(err=>{
          console.log(err)
          this.$toasted.error(this.$t('SaveFailed'))
        })
    }
    // toPicklanguage(){
    //   this.$router.push({name:'Picklanguage'})
    // },
  },
  // beforeCreate(){
  //     var  toPicklanguage =function(){
  //     this.$router.push({name: 'Picklanguage'})
  //   }
  // },
  components: {
    PinCode,
    TabBar,
  }
};
</script>
<style lang="stylus" src="./stylus/all.styl">

</style>
