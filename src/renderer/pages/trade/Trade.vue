/*
 * 新交易界面
 * @Author: mazhaoyong@gmail.com 
 * @Date: 2018-02-05 10:51:54 
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-09-07 17:22:41
 * @License MIT 
 */
<template>
  <div class="page">
    <!-- toolbar
    <trade-pair-tool-bar @choseTradePair="choseTradePair" @switchTradePair="switchTradePair"/>
  -->
  <toolbar :showbackicon="false" menuName="TradeCenter" ref="toolbar">
    <v-btn icon @click.native="showAccounts" slot="left-tool">
          <i class="material-icons font28">menu</i>
      </v-btn>
    </toolbar>
    <accounts-nav :show="showaccountsview" @close="closeView"/>

    <m-layout>
      <div class="trade-content flex-row">
        <div class="flex5">
              
          <!--K线图 -->
          <k :base="BaseAsset" :counter="CounterAsset" :incremental="true" :showTitle="true" ref="kgraph"/>
          <trading-view-chart 
              :base="BaseAsset" :counter="CounterAsset"
            />
          <div class="flex-row mt-2" v-if="needTrust.length  === 0">
            <div class="flex1 pb-2 pr-1">
              <order-book  ref="orderbook" @choose="chooseOrderBook"/>
            </div>
            <div class="flex1 pt-4 pb-2 pl-1">
              <v-card>
                <div class="textcenter cursorpointer flex-row pa-2 ottitle">
                <div :class="`flex1 ttitle` + (activeBuy === 0 ? ' primarycolor':' secondaryfont ')" @click="activeBuy=0">{{$t('Trade.Buy')}}</div>
                <div :class="`flex1 ttitle` + (activeBuy === 1 ? ' primarycolor':' secondaryfont ')" @click="activeBuy=1">{{$t('Trade.Sell')}}</div>
              </div>
              <trade-input v-show="activeBuy" ref="tradeInputBuy" flag="buy" @afterOffer="reloadOrderBook"></trade-input>
              <trade-input v-show="!activeBuy" ref="tradeInputSell" flag="sell" @afterOffer="reloadOrderBook"></trade-input>
              </v-card>
            </div>
          </div>
          <trade-trust v-else/>
          <!---->
         
        </div>
        <div class="flex2 pl-2">
          <!--最近成交记录-->
          <v-card class="trades-card">
            <div class="card-title pa-2">{{$t('latest_trade')}}</div>
            <div class="card-body pa-2 ">
              <v-layout class="textcenter">
                <v-flex xs4>{{$t('Trade.Price')}}</v-flex>
                <v-flex xs4>{{BaseAsset.code}}</v-flex>
                <v-flex xs2>{{$t('type')}}</v-flex>
                <v-flex xs2>{{$t(`DateTime`)}}</v-flex>
              </v-layout>
             <div class="card-body-content">
                <v-layout  v-for="(item,index) in trades" :key="index">
                  <v-flex xs4 class="textleft">{{(item.price.d / item.price.n).toFixed(7)}}</v-flex>
                  <v-flex xs4 class="pl-1 textleft">{{item.base_amount}}</v-flex>
                  <v-flex xs2 class="pl-1 textcenter">{{item.base_is_seller ? $t('Trade.Buy'):$t('Trade.Sell')}}</v-flex>
                  <v-flex xs2 class="pl-1 textright">{{item.ledger_close_time.substring(11,item.ledger_close_time.length-1)}}</v-flex>
                </v-layout>
             </div>
            </div>
          </v-card>

          <v-card class="mt-2">
            <order-book-l ref="orderbookl" @choose="chooseOrderBook"/>
          </v-card>
        </div>

      </div>
    
    </m-layout>

    <password-sheet v-if="needpwd" @cancel="cancelpwd" @ok="rightPwd" />


  </div>  
</template>

<script>
"use strict";
import { mapState, mapActions, mapGetters} from 'vuex'
import K from '@/components/K'
import Card from '@/components/Card'
import BottomNotice from '@/components/BottomNotice'
import Loading from '@/components/Loading'
import OrderBook from '@/components/OrderBook'
import TradePairToolBar from '@/components/TradePairToolBar'
import Toolbar from '@/components/Toolbar'
import { listenOrderbook } from '@/api/orderbook'
import { getTrades } from '@/api/trade'
import { cancel as cancelOffer, myofferConvert, offer as doOffer }  from '@/api/offer'
import { getAsset, isNativeAsset } from '@/api/assets'
import { DEFAULT_INTERVAL } from '@/api/gateways'
import { getXdrResultCode } from '@/api/xdr'
import  defaultsDeep  from 'lodash/defaultsDeep'
import PasswordSheet from '@/components/PasswordSheet'
import TradeInput from '@/components/TradeInput'
import TradeTrust from '@/components/TradeTrust'
import TradingViewChart from '@/components/TradingViewChart'
import AccountsNav from '@/components/AccountsNav'
import OrderBookL from '@/components/OrderBookL'

export default {
  data(){
    return {
      needpwd: false,
      showaccountsview: false,
      trades: [],
      activeBuy: 0,
    }
  },

  beforeMount () {
    this.reloadTrades()
  },
  computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      assetAccounts: state => state.asset.assets,
      bids: state => state.accounts.selectedTradePair.bids,//买单
      asks: state => state.accounts.selectedTradePair.asks,//卖单
      my: state => state.accounts.selectedTradePair.my.records,
      selectedTrade: state => state.accounts.selectedTradePair.tradepair,
      selectedTradeIndex: state => state.accounts.selectedTradePair.index,
      assethosts: state => state.asset.assethosts,
      islogin: state => state.accounts.accountData.seed ? true:false,

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
    LatestPrice(){
      if(this.latestTrade){
        let p = Number(this.latestTrade[0].base_amount)/Number(this.latestTrade[0].counter_amount)
        return Number(p.toFixed(7))+''
      }else{
        return null
      }
    },
    tradeBalance(){
      if(this.tradeType === 'buy'){
        return this.CounterBalance.balance || 0
      }else if(this.tradeType === 'sell'){
        console.log(this.BaseAsset,this.BaseBalance.balance)
        return this.BaseBalance.balance  
      }else{
        return null
      }
    },
    tradeBalanceInt(){
      return this.tradeBalance - this.tradeBalance % (10 ** (String(parseInt(this.tradeBalance * 10**7)).length -1 )  /10**7)
    },
    
  },
  mounted () {
    this.needpwd = !this.islogin
    
  },

  methods: {
    ...mapActions({ }),
    nativeBalance(){
      let d = defaultsDeep({}, this.balances.filter(item=>isNativeAsset(item))[0])
      let t = this.native.balance - this.reserve - this.base_reserve - 0.0001
      if(t < 0 ) t = 0 
      d.balance = Number(t.toFixed(7))
      return d;
    },
    assetBalance(asset){
      //return defaultsDeep({}, this.balances.filter(item=> item.code === asset.code && item.issuer === asset.issuer)[0])
      let isNative = isNativeAsset(asset)
      let data = this.balances.filter(item => {
        if(isNative){
          return isNativeAsset(item)
        }else{
          return asset.code ===item.code && asset.issuer === item.issuer
        }
      })
      if(data.length === 0)return _.defaultsDeep({balance: 0}, asset)
      return defaultsDeep({}, data[0])
    },
    choseTradePair({index,tradepair}){//选择交易对
      this.$nextTick(()=>{
        this.$refs.kgraph.reload()
        this.$refs.orderbook.reload()
        this.$refs.orderbookr.reload()
      })
    },
    //交换了交易队
    switchTradePair(){
      this.$nextTick(()=>{
        this.$refs.kgraph.reload()
        this.$refs.orderbook.reload()
        this.$refs.orderbookl.reload()
      })
    },
    reloadOrderBook(){
      this.$refs.orderbook.reload()
      this.$refs.orderbookl.reload()
    },
    toBuy(){
      this.$router.push({name: 'TradeBuySell', params: {flag: 'buy'}})
    },
    toSell(){
      this.$router.push({name: 'TradeBuySell', params: {flag: 'sell'}})
    },
    cancelpwd(){
      this.needpwd = false
    },
    rightPwd(){
      this.needpwd = false
    },
    chooseOrderBook({type,data}){
      if(type === 'buy'){
        this.$refs.tradeInputSell.choose({type,data})
      }else{
        this.$refs.tradeInputBuy.choose({type,data})
      }
    },
    showAccounts(){
        this.showaccountsview = true
    },
    closeView(){
        this.showaccountsview = false
    },
    reloadTrades(){
      getTrades(this.BaseAsset, this.CounterAsset,"desc",50)
        .then(response=>{
          this.trades = response.records
        }).catch(err=>{
          console.error(err)
        })
    }


  },

  components: {
    K,
    Card,
    BottomNotice,
    Loading,
    OrderBook,
    TradePairToolBar,
    PasswordSheet,
    Toolbar,
    TradeInput,
    TradeTrust,
    TradingViewChart,
    AccountsNav,
    OrderBookL,
  }
  


}
</script>

<style lang="stylus"  scoped>
@require '~@/stylus/trade.styl'
.ottitle
  border-bottom: 1px solid $primarycolor.gray
</style>
