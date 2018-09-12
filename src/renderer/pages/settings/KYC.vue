// 打开KYC界面
<template>
  <div class="kycpage">
      <div class="dapp--container">
      <div class="dapp__toolbar">
        <div class="dapp__t__bar flex-row">
          <div class="flex6 textcenter">{{title}}</div>
        </div>
      </div>
      <v-progress-linear class="dapp__progress" :indeterminate="true" height="5" color="primary" v-if="dAppLoading"></v-progress-linear>
      <webview ref="dappWebView" id="dappWebView" class="webView" :src="site" disablewebsecurity></webview>
    </div>

  </div>
</template>

<script>
import { mapState, mapActions} from 'vuex'
import  defaultsDeep  from 'lodash/defaultsDeep'
import { FFWScript, FFW_EVENT_TYPE_PAY,FFW_EVENT_TYPE_PATHPAYMENT,FFW_EVENT_TYPE_SIGN
   ,FFW_EVENT_TYPE_BACKUP,FFW_EVENT_TYPE_RECOVERY,FFW_EVENT_TYPE_TRUST,FFW_EVENT_TYPE_SIGNXDR } from '@/api/ffw'
import debounce from 'lodash/debounce'
import Toolbar from '@/components/Toolbar'
import { KYC_SITE } from '@/api/gateways'
import { signToBase64, verifyByBase64 } from '@/api/keypair'
import isJson from '@/libs/is-json'
// export const FFW_EVENT_TYPE_PAY = 'pay'
// export const FFW_EVENT_TYPE_PATHPAYMENT = 'pathPayment'
// export const FFW_EVENT_TYPE_SIGN = 'sign'
// export const FFW_EVENT_TYPE_BACKUP = 'backup'
// export const FFW_EVENT_TYPE_RECOVERY = 'recovery'
// export const FFW_EVENT_TYPE_TRUST = 'trust'

export default {
  data(){
    return {
      site: KYC_SITE+'?r='+Math.random(),
      title: null,
      appInstance: null,
      dAppLoading: true
    }
  },
   computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      islogin: state => (state.accounts.accountData.seed ? true : false),
      allcontacts: state => state.app.contacts||[],
      myaddresses: state => state.app.myaddresses||[],
      locale: state => state.app.locale,
    }),
  },
  mounted () {
    this.openApp()
  },
  methods: {
    back(){
      this.$router.back()
    },
    openApp(){
      // let site = 'https://fchain.io/kyc/accounts/login/?next=/portal/'+'?'+Math.random()
      this.title = this.$t('kyc')
      this.appInstance = this.$refs.dappWebView
      
      this.appInstance.addEventListener('did-start-loading', ()=>{
        this.dAppLoading = true
      })
      this.appInstance.addEventListener('did-stop-loading', ()=>{
          console.log('---stop loadding')
          this.dAppLoading = false
      })
      this.appInstance.addEventListener('dom-ready',()=>{
        let contacts = this.allcontacts
        let myaddresses = this.myaddresses
        let isIos =false
        let script = FFWScript(this.account.address, {contacts,myaddresses} ,isIos, "desktop-client", this.locale.key)
        let that = this;
        this.appInstance.executeJavaScript(script,false,(params)=>{
          console.log('---callback---')
        })
        // this.appInstance.openDevTools()
        let wc = this.appInstance.getWebContents()
        wc.enableDeviceEmulation({screenPosition:'mobile',
        size:{width:375, height: 667},
        viewSize:{width:375, height: 667}})
        
        this.appInstance.addEventListener('console-message', e => {
          console.log('webview: ' + e.message);
          let msg = e.message
          if(!isJson(msg))return
          let d = JSON.parse(msg)
          let type = d.type
          this.appEventType = type;
          this.appEventData = d
          if(type === FFW_EVENT_TYPE_SIGN){
            this.doSign(d)
          }
        })
      })

      return
      
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
    doCallbackEvent(data){
      console.log('-----------docallback event---' + JSON.stringify(this.appEventData))
      // alert('do callback event- ' + JSON.stringify(this.appEventData))
      if(this.appEventData && this.appEventData.callback){
        try{
          let cb = this.appEventData.callback
          let code = `FFW.callback("${cb}",{code: "${data.code}",message:"${data.message}",data:"${data.data}"})`
          console.log('===============callback------event---')
          console.log(code)
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
  },
  components: {
    Toolbar,
  }
}
</script>


<style lang="stylus" scoped>
@require '../../stylus/color.styl'
.dapp--container
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
  .webView
    width:375px
    height:667px
    margin: auto auto
    background: #ffffff
</style>
