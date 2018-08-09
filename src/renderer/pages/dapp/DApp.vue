// 第三方应用列表界面
<template>
  <div class="page" dark  v-bind:class="{hidebackground: showScanner}">
    <toolbar :title="$t('Title.ThirdApp')" :showbackicon="false"  @goback="back" 
      :shadow="false" lockpass  ref="toolbar" v-if="!showScanner" menuName="Apps"  >
      <v-btn icon @click.native="showAccounts" slot="left-tool">
        <i class="material-icons font28">menu</i>
      </v-btn>
    </toolbar>

    <toolbar :title="$t('Title.Scan')" 
      :showmenuicon="false" 
      :showbackicon="false"
      ref="toolbar"
      v-else
      :shadow=false
      >
      <i class="material-icons font28" slot="right-tool" 
        @click="closeQRScanner">&#xE5CD;</i>
   </toolbar> 
<accounts-nav :show="showaccountsview" @close="closeView"/>
    <m-layout class="mt-4">
    <v-container fluid v-bind="{ [`grid-list-md`]: true }" v-if="!showScanner">
      <div class="dapp-subtitle subheading pl-2" @click="fetchApps">{{$t('hot_dapp')}}</div>
      <card padding="8px 0" margin="0 0" v-if="working">
        <div class="mt-5 textcenter">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
      </card>
      <card class="server-apps-layout" padding="8px 8px" margin="0 0" v-if="!working && err">
        <p v-if="err">
          {{err}}
        </p>
      </card>
      <v-layout class="server-apps-layout" row wrap  v-if="!working && apps && apps.length > 0">
        <v-flex
          xs2
          v-for="(app,index) in apps"
          :key="index"
          @click="choose(app)"
          class="app-card-wrapper"
        >
          <v-card flat tile class="pa-2 textcenter app-card" >
             <div class="pa-3">
                <v-avatar class="grey darken-4 app-avatar" :size="`100%`">
                 <img :src="app.image">
                </v-avatar>
             </div>
             <v-card-title primary-title class="app-title">
               <div class="textcenter" style="width: 100%;">{{app.title}}</div>
             </v-card-title>
          </v-card>
        </v-flex>
      </v-layout>


      <div class="dapp-subtitle subheading  pl-2">{{$t('CustomDApp')}}</div>

      <v-layout class="apps-layout" row wrap >
        <v-flex
          xs2
          v-for="(app,index) in myapps"
          :key="index"
          class="app-card-wrapper"
        >
          <v-card dark flat tile class="pa-2 textcenter app-card" >
            <div class="pa-3" @click="choose(app,true)">
              <v-avatar class="grey darken-4 app-avatar" :size="`62px`">
               <span class="white--text headline">{{app.title.substring(0,1)}}</span> 
             </v-avatar>
            </div>
             <v-card-title primary-title class="app-title" @click="choose(app,true)">
               <div class="textcenter" style="width: 100%;">{{app.title}}</div>
             </v-card-title>
             <span class="app-icon-del" @click="delDapp(index,app)"><i class="material-icons">delete_forever</i></span>
             <span class="app-icon-edit" @click="modifyDapp(index,app)"><i class="material-icons">edit</i></span>
          </v-card>
        </v-flex>
        <v-flex
          xs2
          @click="addDapp"
          class="app-card-wrapper"
        >
          <v-card dark flat tile class="pa-2 textcenter app-card mt-3" >
            <div class="pa-3">
              <v-avatar class="grey darken-4 app-avatar add-app-avatar" :size="`62px`">
               <v-icon :size="`38px`" color="primary">add</v-icon>
             </v-avatar>
            </div>
          </v-card>
        </v-flex>
      </v-layout>

      

    <v-dialog v-model="showConfirmDlg" max-width="360" persistent>
      <div>
        <div class="card-content dlg-content">
          <div class="avatar-div textcenter">
            <v-avatar>
              <img src="../../assets/img/logo-red.png" />
            </v-avatar>
          </div>
          <div class="t2 skip-white pt-2 pb-4">{{$t('Third.OpenAppHint',[choosed.title])}}</div>
          <div class="btns flex-row">
            <div class="flex1 skip-red textcenter" @click="openApp">{{$t('Button.OK')}}</div>
            <div class="flex1 skip-red textcenter" @click="showConfirmDlg = false">{{$t('Button.Cancel')}}</div>
          </div>
        </div>
      </div>
    </v-dialog>

    <!--新增弹窗-->
    <v-dialog v-model="showAddDlg" persistent max-width="460">
      <v-card>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              
              <v-flex xs12>
                <v-text-field :label="$t('ContactAdd.name')" clearable required v-model="apptitle"></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field :label="$t('ContactAdd.address')" clearable required v-model="appsite"></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary darken-1" :loading="addingApp" flat @click.stop="cancelAddApp">{{$t('Button.Cancel')}}</v-btn>
          <v-btn color="error darken-1" :loading="addingApp" flat @click.stop="doAddApp">{{$t('Save')}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    </v-container>
    </m-layout>

    <div class="dapp--container" v-if="dAppShow">
      <div class="dapp__toolbar">
        <div class="dapp__t__bar flex-row" :style="{backgroundColor:dappBgColor}">
          <div class="flex1 pt-2 pl-1" @click="closeDappContainer"><i class="material-icons">close</i></div>
          <div class="flex1 pt-2" @click="dappContainerBack"><i class="material-icons">keyboard_arrow_left</i></div>
          <div class="flex6 textcenter">{{choosed.title}}</div>
          <div class="flex1">&nbsp;</div>
          <div class="flex1">&nbsp;</div>
        </div>
      </div>
      <v-progress-linear class="dapp__progress" :indeterminate="true" height="5" color="info" v-if="dAppLoading"></v-progress-linear>
      <webview ref="dappWebView" id="dappWebView" :src="choosed.site" class="webView" disablewebsecurity></webview>
    </div>

    <send-asset v-if="showSendAsset" 
      :destination="sendTarget.destination"
      :appname="choosed.title"
      :asset_code="sendTarget.code"
      :asset_issuer="sendTarget.issuer"
      :memo_type="sendTarget.memo_type"
      :memo="sendTarget.memo"
      :amount="sendTarget.amount"
      :pathPayment="pathPayment"
      @exit="exitSendAsset"
      @sendsuccess="sendAssetSuccess"
       ></send-asset>
    <back-up-data v-if="appEventType === 'backup' && appEventData" 
      :appname="choosed.title" 
      @exit="exitBackUpEvent" @success="successBackUpEvent" />

    <recovery-data v-if="appEventType === 'recovery' && appEventData" 
      :appname="choosed.title" :encryptData="appEventData.data"
      @exit="exitRecoveryEvent" @success="successRecoveryEvent" />

    <trust-line v-if="appEventType === 'trust' && appEventData" 
      :appname="choosed.title" 
      :asset_code="appEventData.code"
      :asset_issuer="appEventData.issuer"
      @exit="exitTrustEvent" @success="successTrustEvent" />

    <sign-x-d-r v-if="appEventType === 'signXDR' && appEventData" 
      :appname="choosed.title"
      :message="appEventData.message"
      :xdr="appEventData.data"
      @exit="exitSignXDREvent"
      @success="successSignXDREvent"
      />
    
   <q-r-scan
      @finish="qrfinish"
      @close="qrclose"
      :validator="qrvalidator"
      ref="qrscanner"
      v-if="showScanner"></q-r-scan>

  </div>
</template>

<script>
import { mapState, mapActions} from 'vuex'
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import Loading from '@/components/Loading'
import defaultsDeep  from 'lodash/defaultsDeep'
import SendAsset from '@/components/dapp/SendAsset'
import RecoveryData from '@/components/dapp/RecoveryData'
import TrustLine from '@/components/dapp/TrustLine'
import BackUpData from '@/components/dapp/BackUpData'
import SignXDR from '@/components/dapp/SignXDR'
import QRScan from '@/components/QRScan'
import { FFWScript, FFW_EVENT_TYPE_PAY,FFW_EVENT_TYPE_PATHPAYMENT,FFW_EVENT_TYPE_SIGN
   ,FFW_EVENT_TYPE_BACKUP,FFW_EVENT_TYPE_RECOVERY,FFW_EVENT_TYPE_TRUST,
   FFW_EVENT_TYPE_SIGNXDR, FFW_EVENT_TYPE_SHARE,FFW_EVENT_TYPE_BALANCES,
   FFW_EVENT_TYPE_SCAN } from '@/api/ffw'
import { signToBase64, verifyByBase64 } from '@/api/keypair'
import isJson from '@/libs/is-json'
import debounce from 'lodash/debounce'
import { trustAll } from '@/api/operations'
import AccountsNav from '@/components/AccountsNav'
const os = require('os')
const COLOR_GREEN = '#21CE90'

// export const FFW_EVENT_TYPE_PAY = 'pay'
// export const FFW_EVENT_TYPE_PATHPAYMENT = 'pathPayment'
// export const FFW_EVENT_TYPE_SIGN = 'sign'
// export const FFW_EVENT_TYPE_BACKUP = 'backup'
// export const FFW_EVENT_TYPE_RECOVERY = 'recovery'
// export const FFW_EVENT_TYPE_TRUST = 'trust'

export default {
  data(){
    return {
      statusbarColor: COLOR_GREEN,
      // apps: [],
      working: false,
      err: null,
      showConfirmDlg: false,
      choosed: {}, //当前选中的app
      showSendAsset: false,
      sendTarget:{},
      pathPayment: true,//发送功能是否支持pathPayment
      appInstance: null,

      appEventType: null,//接收到的appevent事件
      appEventData: null,//接收的appevent的data

      showAddDlg: false,
      apptitle: null,
      appsite: null,
      addingApp: false,
      // showqrscan: false,
      showScanner: false,
      showaccountsview: false,

      showDappMenu: false,
      choosedMyDappIndex: -1,
      choosedMyDapp: null,
      isAddMyDapp: true,

      dAppShow: false,//是否显示当前的dapp
      dAppLoading: true,//是否正在加载dapp
      dappBgColor:"#21CE90",
      ismydapp: false,

    }
  },
   computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      islogin: state => (state.accounts.accountData.seed ? true : false),
      allcontacts: state => state.app.contacts||[],
      myaddresses: state => state.app.myaddresses||[],
      myapps: state => state.app.myapps,
      locale: state => state.app.locale,
      apps: state => state.dapps || [],
      balances: state=> state.account.data.balances,
    }),
  },
  beforeMount(){
    this.fetchApps()
  },
  mounted () {
    if(this.apps.length === 0){
      this.fetchApps()
    }
    if(!this.islogin){
      this.$refs.toolbar.showPasswordLogin()
    }
  },
  methods: {
    ...mapActions(['addMyApp','loadDApps', 'deleteMyApp', 'modifyMyApp','getAccountInfo']),
    fetchApps(){
      // this.working = true
      this.err = null
      this.loadDApps()
        .then(response=>{
          // this.working = false

        })
        .catch(err=>{
          // this.working = false
          console.error(err)
          // this.err = 'Error.AjaxTimeout'
          this.err = this.$t('FederationName.NetworkError') +  (err.message?  err.message : '')
        })

    },
    back(){
      this.$router.back()
    },
    choose(app,ismydapp){
      this.choosed = app
      this.ismydapp = ismydapp
      let val = localStorage.getItem(app.site)
      if(val){
        this.openApp()
        return
      }
      this.showConfirmDlg = true

    },
    openApp(){
      localStorage.setItem(this.choosed.site, "confirm")
      this.showConfirmDlg = false
      let color = this.choosed.color || this.statusbarColor
      if(color){
        this.dappBgColor = color
      }

      this.dAppShow = true
      this.$nextTick(()=>{
        this.appInstance = this.$refs.dappWebView
        this.appInstance.addEventListener('did-start-loading', ()=>{})
        this.appInstance.addEventListener('did-stop-loading', ()=>{
          console.log('---stop loadding')
          this.dAppLoading = false
        });
        this.appInstance.addEventListener('dom-ready', ()=>{
          let contacts = this.allcontacts
          let myaddresses = this.myaddresses
          let isIos =false
          let platform = 'desktop-'+process.platform
          let script = FFWScript(this.account.address, {contacts,myaddresses} ,isIos, platform, this.locale.key)
          let that = this;
          this.appInstance.executeJavaScript(script,false,(params)=>{
            console.log('---callback---')
          })
          if(this.ismydapp){
            this.appInstance.openDevTools()
          }
          let wc = this.appInstance.getWebContents()
          wc.enableDeviceEmulation({screenPosition:'mobile',
          size:{width:375, height: 667},
          viewSize:{width:375, height: 667}})
          
          
        });
        this.appInstance.addEventListener('console-message', e => {
            console.log('webview: ' + e.message);
            let msg = e.message
            if(!isJson(msg))return
            let d = JSON.parse(msg)
            let type = d.type
            this.appEventType = type;
            this.appEventData = d
            if(type === FFW_EVENT_TYPE_PAY){
              this.doPayEvent(d)
            }else if(type === FFW_EVENT_TYPE_PATHPAYMENT){
              this.doPathPaymentEvent(d)
            }else if(type === FFW_EVENT_TYPE_SIGN){
              this.doSign(d)
            }else if(type === FFW_EVENT_TYPE_SCAN){
              this.doCallbackEvent(this.callbackData('fail','unsupported'))
            }else if(type === FFW_EVENT_TYPE_SHARE){
              // this.doShare(e);
               this.doCallbackEvent(this.callbackData('fail','unsupported'))
            // }else if(type === 'after_fund'){
            //   that.doTrust(e.data.data)
            }else if(type === FFW_EVENT_TYPE_BALANCES){
              //查询账户余额
              this.getBalances()
            }else{
              // this.hideDapp()
              //this.doCallbackEvent(this.callbackData('fail','unsupported'))
              //that.doCallbackEvent( that.callbackData('fail','unknown event type'))
            }

          });
      })

      return

    },
    hideDapp(e){
      this.appInstance.hide()
      console.log('-----app-event--hideapp--'+JSON.stringify(this.appEventData))
    },
    doTrust(assets){
      //强制授信相应的资产
      // let source = config.account
      // if(!source)return
      
      trustAll(this.accountData.seed, assets)
        .then(resp => {
          //this.hideDapp()
          this.$toasted.show(this.$t('fund_success'))
          setTimeout(()=>{
            this.$router.push({name: 'MyAssets'})  
          },1000)
        })
        .catch(err=>{
          console.error(err)
          console.error('授信失败')
          this.$router.push({name: 'MyAssets'})
        })

    },
    doPayEvent(d){
      try{
        //this.appInstance.hide()
        this.showSendAsset = true
        this.sendTarget = d
        this.pathPayment = false
      }catch(err){
        console.error(err)
        //alert('error:'+err.message)
      }
    },
    getBalances(){
      this.getAccountInfo(this.account.address)
        .then(data=>{

          this.doCallbackEvent(this.callbackData('success', 'success', this.balances))
        })
        .catch(err=>{
          this.doCallbackEvent(this.callbackData('fail',err.message))
        })
    },
    doSign(d){
      //签名
      let data = d.data
      if(!isJson(data)){
        return this.doCallbackEvent(this.callbackData('fail','data is invalid'))
      }
      if(data){
        let cdata = signToBase64(this.accountData.seed, data)
        console.log('---------------encrypt data---' + cdata)
       // alert('sign---'+cdata)
        this.doCallbackEvent(this.callbackData('success', 'success', cdata))
      }else{
       // alert('sign-fail--')
        this.doCallbackEvent(this.callbackData('fail','no data to sign'))
      }
    },
    doPathPaymentEvent(d){
      try{
        // this.appInstance.hide()
        this.showSendAsset = true
        this.sendTarget = d
        this.pathPayment = true
      }catch(err){
        console.error(err)
        //alert('error:'+err.message)
      }
    },
    doCallbackEvent(data){
      console.log('-----------docallback event---' + JSON.stringify(this.appEventData))
      // alert('do callback event- ' + JSON.stringify(this.appEventData))
      if(this.appEventData && this.appEventData.callback){
        try{
          let cb = this.appEventData.callback
          let d = JSON.stringify(data)
          let code = `FFW.callback("${cb}",${d})`
          console.log('===============callback------event---')
          this.appInstance.executeJavaScript(code)
        }catch(err){
          console.error(err)
        }
      }
    },
    callbackData(code,message,data){
      // return JSON.stringify({code,message,data})
      return {code,message,data}
    },
    exitSendAsset(){
      this.showSendAsset = false
      this.$nextTick(()=>{
        this.appInstance.show()
        this.doCallbackEvent(this.callbackData('fail','cancel payment'))
      });
    },
    sendAssetSuccess(){
      this.showSendAsset = false
      this.$nextTick(()=>{
        this.appInstance.show()
        this.doCallbackEvent(this.callbackData('success','success'))
      });
    },
    shareCB(url){
      
    },
    exitEvent(msg){
      this.$nextTick(()=>{
        // this.appInstance.show()
        this.doCallbackEvent(this.callbackData('fail',msg))
        this.$nextTick(()=>{
          this.appEventType = null
          this.appEventData = null   
        })
      })
    },
    successEvent(msg='success',data){
      // alert('----success--event---'+ JSON.stringify(data))
      this.$nextTick(()=>{
        // this.appInstance.show();
        this.doCallbackEvent(this.callbackData('success',msg, data))
        this.$nextTick(()=>{
          this.appEventType = null
          this.appEventData = null   
        })
      })
    },
    exitBackUpEvent(){
      this.exitEvent('cancel back up')
    },
    successBackUpEvent(data){
      this.successEvent('success',data)
    },
    exitRecoveryEvent(){
      this.exitEvent('cancel recovery')
    },
    successRecoveryEvent(){
      this.successEvent()
    },
    exitTrustEvent(){
      this.exitEvent('cancel trust')
    },
    successTrustEvent(){
      this.successEvent()
    },
    exitSignXDREvent(){
      // alert('----exit---signxdr---')
      this.exitEvent('cancel signxdr')
    },
    successSignXDREvent(data){
      // alert('-----signxdr-success---' + data)
      this.successEvent('success',data)
    },
    toSetting(){
      this.$router.push({name: 'DAppSetting'})
    },
    addDapp(){
      this.showAddDlg = true
      this.apptitle = null
      this.appsite = null
    },
    cancelAddApp(){
      this.showAddDlg = false
      this.apptitle = null
      this.appsite = null
    },
    doAddApp(){
      if(this.addingApp)return
      if(!this.apptitle)return
      if(!this.appsite)return
      this.addingApp = true
      if(this.isAddMyDapp){
        this.addMyApp({title: this.apptitle, site: this.appsite})
        .then(response=>{
            this.cancelAddApp()
            this.addingApp = false
          })
          .catch(err=>{
            this.$toasted.error(this.$t('SaveFailed') +":" + (err.message ? err.message:''))
          })
      }else{
         this.modifyMyApp({index: this.choosedMyDappIndex, app: {title: this.apptitle, site: this.appsite}})
        .then(response=>{
          console.log('--------------ok----')
          console.log(this.myapps)
            this.cancelAddApp()
            this.addingApp = false
            this.isAddMyDapp = false
            this.choosedMyDappIndex = -1
            this.choosedMyDapp = null
          })
          .catch(err=>{
            this.$toasted.error(this.$t('SaveFailed') +":" + (err.message ? err.message:''))
          })
        
      }
      


    },
    doShare(e){
      try{
        let options = e.data.options
        window.plugins.socialsharing.shareWithOptions(options, result=>{
          this.successEvent("share ok", result);
          // console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
          // console.log("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
        }, msg=>{
          // console.log("Sharing failed with message: " + msg);
          this.exitEvent(msg);
        });
      }catch(err){
        console.error(err)
      }
    },
    doQRScanEvent(e){
      try{
        this.appInstance.hide()
        this.showScanner = true
        //隐藏底部tab
        this.$store.commit('HIDE_TABBAR')
      }catch(err){
        console.error(err)
        //alert('error:'+err.message)
      }
    },
    qrvalidator(text){
      if(!text)return false
      return true;
    },
    qrfinish(result){
      this.showScanner = false
      this.successEvent('success',result);
      this.$store.commit('SHOW_TABBAR')
    },
    qrclose(){
      this.exitEvent('qrscan closed')
      this.$store.commit('SHOW_TABBAR')
    },
    closeQRScanner(){
      this.$refs.qrscanner.closeQRScanner();
      this.showScanner = false
      this.$store.commit('SHOW_TABBAR')
    },
    showAccounts(){
        this.showaccountsview = true
    },
    closeView(){
        this.showaccountsview = false
    },
    chooseMyDapp(index,app){
      this.showDappMenu = true
      this.choosedMyDappIndex = index
      this.choosedMyDapp = app
      this.isAddMyDapp = true
    },
    openDapp(){
      this.choose(this.choosedMyDapp)
    },
    delDapp(index, app){
      console.log('-del----'+index+","+JSON.stringify(app))
      if(this.addingApp)return
      this.addingApp = true
      //直接删除
      this.deleteMyApp(index)
        .then(response=>{
            this.addingApp = false
          })
          .catch(err=>{
            this.addingApp = false
            this.$toasted.error(this.$t('SaveFailed') +":" + (err.message ? err.message:''))
          })
    },
    modifyDapp(index,app){
      this.isAddMyDapp = false
      this.showAddDlg = true
      this.choosedMyDappIndex = index
      this.choosedMyDapp = app
      this.apptitle = this.choosedMyDapp.title
      this.appsite = this.choosedMyDapp.site
    },

    closeDappContainer(){
      this.choosed = {}
      this.dAppShow = false
    },
    dappContainerBack(){
      // console.log('------' + this.$refs.dappWebView.canGoForward())
      if(this.$refs.dappWebView.canGoForward()){
        this.$refs.dappWebView.goBack()
      }
    }


  },
  components: {
    Toolbar,
    Loading,
    Card,
    SendAsset,
    TrustLine,
    RecoveryData,
    BackUpData,
    SignXDR,
    QRScan,
    AccountsNav,
  }
}
</script>


<style lang="stylus" scoped>
@require '../../stylus/color.styl'
.app-card
  background: $secondarycolor.gray
.app-title
  padding: .1rem .1rem
  overflow: hidden
  white-space: nowrap
  font-size: 14px
.card-content
  padding: 20px 10px
.t2
  font-size: 16px
.btns
  font-size: 16px
.dlg-green
  color: $primarycolor.green
.dlg-content
  background: $secondarycolor.gray
  color: $primarycolor.red

.server-apps-layout
  background: $secondarycolor.gray
  margin: 8px 8px!important
  border-radius: 5px

.apps-layout
  background: $secondarycolor.gray
  margin: 8px 8px!important
  border-radius: 5px
.app-card
  background: $secondarycolor.gray!important
.app-card-wrapper
  border: 1px solid $primarycolor.gray!important
.app-avatar
  border-radius: 50%!important
.dapp-subtitle
  color: $secondarycolor.font
.add-app-avatar
  background: $secondarycolor.gray!important
.hidebackground
  background: none!important

.dapp--container
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  overflow-y: auto
  background: $primarycolor.gray
  z-index: 9
  .dapp__progress
    width:375px
    margin: 0 auto
  .dapp__toolbar
    margin: auto auto
    height: 48px
    line-height: 48px
    .dapp__t__bar
      line-height: 48px
      background: $primarycolor.green
      width:375px
      margin: 0 auto
      .material-icons
        cursor: pointer
  .webView
    width:375px
    height:667px
    margin: auto auto
    background: #ffffff

.app-icon-del
  position: absolute
  top: 4px
  right: 4px
  cursor: pointer
  .material-icons
    font-size: 20px
    color: #999999
.app-icon-edit
  position: absolute
  cursor: pointer
  top: 4px
  right: 28px
  .material-icons
    font-size: 20px
    color: #999999
</style>
