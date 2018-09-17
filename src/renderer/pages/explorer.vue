// 数据查看，支持G地址、联邦地址、tx hash，直接嵌入steexp？
<template>
  <div class="explorer-page" dark >
    <toolbar :showmenuicon="false"  :showbackicon="false"  ref="toolbar">
      <v-btn icon @click.native="showAccounts" slot="left-tool">
        <i class="material-icons font28">menu</i>
      </v-btn>
    </toolbar> 
    <accounts-nav :show="showaccountsview" @close="closeView"/>
      
    <div class="webview-container mt-4">
      <v-progress-linear class="dapp__progress" :indeterminate="true" height="5" color="primary" v-if="loadingWebView"></v-progress-linear>
      <webview ref="webView" id="webView" src="https://steexp.com" class="webView"></webview>
    </div>

      <!--输入框，接收回车或点击后边的查询按钮-->

      <!--显示working动作-->

      <!--显示账户详情或tx详情-->

  </div>
</template>

<script>
import { mapState, mapActions} from 'vuex'
import Toolbar from '@/components/Toolbar'
import defaultsDeep  from 'lodash/defaultsDeep'
import AccountsNav from '@/components/AccountsNav'

export default {
  data(){
    return {
      loadingWebView: true,
      showaccountsview: false,
      site:'https://steexp.com',
      appInstance: null,
    }
  },
  components:{
    Toolbar,
    AccountsNav,
  },
  mounted(){
    this.appInstance = this.$refs.webView
    this.appInstance.addEventListener('did-start-loading', ()=>{
      this.loadingWebView = true
    })
    this.appInstance.addEventListener('did-stop-loading', ()=>{
      this.loadingWebView = false
    });
    this.appInstance.addEventListener('dom-ready', ()=>{
      this.appInstance.insertCSS(`.navbar-brand{display:none!important;}
      #footer{display:none!important;}
      .navbar,body{background: #212122!important;}`);
//      this.appInstance.executeJavaScript(`document.body.style.backgroundColor="#212122";`)

    })
  },
  methods:{    
    showAccounts(){
        this.showaccountsview = true
    },
    closeView(){
        this.showaccountsview = false
    },
  }

  

}
</script>

<style lang="stylus" scoped>
@require '../stylus/color.styl'
.webview-container
  padding-left: 65px
  height: calc(100vh - 65px - 40px)
  overflow-y: hidden

.webView
  width:100%
  height:100%
  margin: auto auto
  background: #3c4452;
  &.hide
    visibility: hidden
</style>
