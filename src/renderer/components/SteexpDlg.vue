//使用dialog展示steexp的界面
<template>
  <v-dialog v-model="dlgView" max-width="1120px">
    <div class="bgcontainer">
    <div class="flex-row pa-2 head secondaryfont">
      <div class="flex3">{{$t('explorer')}}</div>
      <div class="flex1 textright">
        <v-icon class="cursorpointer" @click="close">close</v-icon>
      </div>
    </div>
    <v-progress-linear class="dapp__progress" :indeterminate="true" height="5" color="primary" v-if="loadingWebView"></v-progress-linear>
    <webview ref="webView" id="webView" :src="site" class="webView"></webview>
    </div>
  </v-dialog>
</template>

<script>
const TYPE_I_ACCOUNT = 0//账户类型
const TYPE_I_TX = 1//tx hash类型
const HOST = 'https://steexp.com'
export default {
  data(){
    return {
      dlgView: true,
      loadingWebView:true,
      site: null,
      appInstance: null,
    }
  },
  props:{
    i: {
      type: Number,
      default: TYPE_I_ACCOUNT
    },
    v: {
      type: String,
      required: true
    }
  },
  watch:{
    
  },
  mounted(){
    if(this.i === TYPE_I_ACCOUNT){
      this.site = HOST + '/account/' + this.v
    }else if(this.i === TYPE_I_TX){
      this.site = HOST + '/tx/' + this.v
    }
    console.log('------------show---------------' + this.site)
    this.appInstance = this.$refs.webView
    this.appInstance.addEventListener('did-start-loading', ()=>{
      this.loadingWebView = true
    })
    this.appInstance.addEventListener('did-stop-loading', ()=>{
      console.log('---loading stop-0-')
      this.loadingWebView = false
    });
    this.appInstance.addEventListener('dom-ready', ()=>{
      this.appInstance.insertCSS(`.navbar-brand{display:none!important;}
      #footer{display:none!important;}
      .navbar, body{background: #212122!important;}`)
    })
  },
  methods:{
    close(){
      this.$emit('close')
    }
  }
}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.bgcontainer
  background: #3c4452!important
  .head
    border-bottom: 1px solid $primarycolor.gray
    .t
      font-size: 18px
.webView
  width: 100%
  height: 80vh
  overflow: auto
  background: #3c4452;
  &.hide
    visibility: hidden
</style>
