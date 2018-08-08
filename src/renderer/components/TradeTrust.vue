/**
 * 
 */
<template>
  <div class="trade-input">

    <loading :show="working" :loading="sending" :success="sendsuccess" :fail='sendfail' 
      color="red" :title="loadingTitle" :msg="loadingError" :closeable="sendfail" @close="hiddenLoading"/>   
    <v-btn block color="error" class="full-width btn-reset" 
       @click.stop="doTrust">{{$t('ChangeTrust')}}{{needTrustCodes}}</v-btn>

    <password-sheet lock v-if="needpwd" @cancel="cancelpwd" @ok="rightPwd" />


  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import Loading from '@/components/Loading'
import PasswordSheet from '@/components/PasswordSheet'
import { offer as doOffer } from '@/api/offer'
import { myofferConvert } from '@/api/offer'
import { cancel as cancelOffer }  from '@/api/offer'
import { mapState, mapActions, mapGetters} from 'vuex'
import { getAsset, isNativeAsset } from '@/api/assets'
import { trustAll } from '@/api/operations'
import { getXdrResultCode } from '@/api/xdr'
import { Decimal } from 'decimal.js'
import debounce from 'lodash/debounce'
import defaultsDeep from 'lodash/defaultsDeep'
import loadaccount from '@/mixins/loadaccount'
import BottomNotice from '@/components/BottomNotice'
var moment = require('moment')
import UnFundNotice from '@/components/UnFundNotice'

const FLAG_BUY = 'buy'
const FLAG_SELL = 'sell'
const FLAG_MYOFFER = 'myOffer'
Decimal.rounding = Decimal.ROUND_DOWN

export default {
  mixins:[loadaccount],
  data(){
    return {
      title: 'Menu.TradeCenter',
      working: false,
      sending: false,
      sendsuccess: false,
      sendfail: false,
      txResult: null,

      loadingTitle: null,
      loadingError: null,
      needpwd: false,

    }
  },
  computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      assetAccounts: state => state.asset.assets,
      selectedTrade: state => state.accounts.selectedTradePair.tradepair,
      selectedTradeIndex: state => state.accounts.selectedTradePair.index,
      assethosts: state => state.asset.assethosts,
      islogin: state => state.accounts.accountData.seed ? true:false,
      bids: state => state.accounts.selectedTradePair.bids,//买单
      asks: state => state.accounts.selectedTradePair.asks,//卖单
      my: state => state.accounts.selectedTradePair.my.records,
      locale: state => state.app.locale,
    }),
    ...mapGetters([
      'balances',
      'native',
      'reserve',
      'base_reserve'
    ]),
    needTrust(){//返回当前需要授信的资产
      let result = []
      let basset = this.BaseAsset
      let casset = this.CounterAsset
      let hasBaseAsset = isNativeAsset(basset) || false
      let hasCounterAsset = isNativeAsset(casset)  || false
      this.balances.forEach(item=>{
        if(item.code === basset.code && item.issuer === basset.issuer){
          hasBaseAsset = true
        }else if(item.code === casset.code && item.issuer === casset.issuer){
          hasCounterAsset = true
        }
      })
      if(!hasBaseAsset){
        result.push(basset)
      }
      if(!hasCounterAsset){
        result.push(casset)
      }
      return result
    },
    needTrustCodes(){
      if(this.needTrust.length > 0){
        let result = '(';
        this.needTrust.forEach(item=> {
          result+=item.code+','
        })
        return result.substring(0, result.length-1)+')'
      }
    },
    BaseAsset(){
      return this.selectedTrade.from
    },
    BaseBalance(){
      if(isNativeAsset(this.BaseAsset)){
        return this.nativeBalance()
      }else{
        return this.assetBalance(this.BaseAsset)
      }
    },
    CounterAsset(){
      return this.selectedTrade.to
    },
    CounterBalance(){
      return this.assetBalance(this.CounterAsset)
    },
   
    
  },

  methods: {
    ...mapActions({
      getAssetsAccount:'assetsAccount',
      deleteTradePair: 'deleteTradePair',
      addTradePair: 'addTradePair',
      switchTradePair: 'switchTradePair',
      selectTradePair: 'selectTradePair',
      queryOrderBook: 'queryOrderBook',
      switchSelectedTradePair: 'switchSelectedTradePair',
      queryMyOffers: 'queryMyOffers',
      orderBookStreamHandler: 'orderBookStreamHandler',
      getAccountInfo:'getAccountInfo',
      getAllOffers: 'getAllOffers',

    }),
    
    hideLoading(){
      setTimeout(()=>{
          this.sending = false
          this.working = false
          this.txResult = null
        },5000)
    },
    
    hiddenLoading(){
      this.sending = false
      this.sendfail = false
      this.working = false
    },

    doTrust(){
      if(!this.islogin){
        this.needpwd = true;
        return;
      }
      //   <loading :show="working" :loading="sending" :success="sendsuccess" :fail='sendfail' 
      // :color="isSell?'red':'green'" :title="loadingTitle" :msg="loadingError" :closeable="sendfail" @close="hiddenLoading"/>
      if(this.working)return
      // this.isSell = true
      this.working = true
      this.sending = true
      this.loadingTitle = null
      this.loadingError = null
      try{
        trustAll(this.accountData.seed, this.needTrust)
          .then(response=>{
            this.sending = false
            this.sendsuccess = true
            this.loadingTitle = this.$t('AddAssetSuccess')
            try{
              this.getAccountInfo(this.account.address).then(response=>{}).catch(err=>{})
            }catch(err){
              console.error(err)
            }
            setTimeout(()=>{
              this.working = false
              this.sendsuccess = false
              this.loadingTitle = null
            },3000)
          })
          .catch(err=>{
            console.error(err)
            this.sending = false
            this.sendfail = true
            let msg = getXdrResultCode(err)
            this.loadingTitle = this.$t('AddAssetFail')
            if(msg){
            this.loadingError = this.$t(msg)
            }     
          })//end of trustAll
      }catch(error){
        console.error(error)
        this.sending = false
        this.sendfail = true
        let msg = getXdrResultCode(err)
        this.loadingTitle = this.$t('AddAssetFail')
        if(msg){
        this.loadingError = this.$t(msg)
        }     
      }
    },
    
    cancelpwd(){
      this.needpwd = false
    },
    rightPwd(){
      this.needpwd = false
    },

  },
  components: {
    Toolbar,
    Card,
    Loading,
    PasswordSheet
  }
}
</script>


<style lang="stylus" scoped>
@require '~@/stylus/trade.styl'
</style>

