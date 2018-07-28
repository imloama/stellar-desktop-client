<template>
<div>

  <v-app :class="'app ' + (showFuzzyView?'fuzzy-app':'') " dark>
      <v-system-bar status :color="iosstatusbarcolor" v-if="isios && !isFull" app>
        <v-spacer></v-spacer>
      </v-system-bar>
      <v-content class="contentx">
        <router-view />
      </v-content>
      <tab-bar v-if="tabBarShow"/>

    <v-dialog v-model="updateConfirmDlg" max-width="95%" persistent class="upDlg">
      <div>
        <div class="a-card-content">
          <div class="avatar-div textcenter">
            <v-avatar>
              <img src="./assets/img/logo-red.png" />
            </v-avatar>
          </div>
          <div class="a-t1 a-red textcenter" v-if="updating">{{$t('UpdateHint')}}</div>
          <div class="a-t1 a-red textcenter" v-if="!updating">{{$t('FindNewVersion',[latestVersion])}}</div>
          <div class="a-btns flex-row" v-if="!updating">
            <div class="flex1 a-red textcenter" @click="doUpdate">{{$t('Update')}}</div>
            <div class="flex1 a-red textcenter" @click="updateConfirmDlg = false">{{$t('Button.Cancel')}}</div>
          </div>
        </div>
      </div>
    </v-dialog>
   


  </v-app>

  <div class="fuzzy-view" v-if="showFuzzyView">

  </div>


</div>
</template>

<script>
import Vue from "vue";
import { mapActions, mapState } from "vuex";
import PinCode from "@/components/PinCode";
import { defaultTradePairsAPI,initFundConfig } from "@/api/gateways";
import { closeStreams, initStreams } from "@/streams";
import { initStorage, checkPlatform } from "@/api/storage";
import { getDeviceLanguage, ZH_CN } from "@/locales";
import  TabBar from '@/components/TabBar'
import { getFchainRss } from '@/api/fchain'
import updateMixin from '@/mixins/update'
import { PLATFORM_IS_IOS } from '@/store/modules/AppSettingStore'
import { FCHAIN_HORIZON } from '@/api/horizon'

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
  mixins: [updateMixin],
  beforeMount() {
    console.log('-----------------------------1:'+this.$route.name)
    if(this.tabBarItems.indexOf(this.$route.name) >=0 ){
      this.tabBarShow = true
      this.$store.commit('SHOW_TABBAR')
    }else{
      this.$store.commit('HIDE_TABBAR')
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
          
          //保存默认的设置数据
          // this.$router.push({name: 'Wallet'})
          if (window.localStorage.getItem("login_flag") == 1) {
            this.$router.push({ name: "Wallet" });
          } else {
            this.$router.push({ name: "Picklanguage" });
          }
        });
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
    ]),
    showTabbarView(){
      this.tabBarShow = true
    },
    hideTabbarView(){
      this.tabBarShow = false
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
