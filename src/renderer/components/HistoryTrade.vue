/**
* 历史页面
* 交易记录
*/
<template>
  <div class="">
    
  <div class="search-wrapper pl-3">
    <date-range-picker :start="start" :end="end" @doSearch="doSearch" />
  </div>

    <div class="mt-1 mb-1">
      <card class="offer-card" padding="10px 10px">
        <div class="myoffer-table offer-table" slot="card-content">
           <div class="textcenter ma-4" v-if="working">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
          <div class="flex-row trade-li" v-else v-for="(item, index) in deals" :key="index">
            
            <div class="flex4 pa-2">
              <span class="value up">+{{Number(item.bought_amount)}}</span>
              <span class="value">{{item.bought_asset_code}}</span>
              <span class="label" v-if="assethosts[item.bought_asset_code]">{{assethosts[item.bought_asset_code] | miniaddress}}</span>
              <span class="label" v-else-if="assethosts[item.bought_asset_issuer]">
                {{assethosts[item.bought_asset_issuer] | miniaddress}}
              </span>
              <span class="label" v-else>{{item.bought_asset_issuer | miniaddress}}</span>
            </div>
            <div class="flex4  pa-1">
              <span class="value down">-{{Number(item.sold_amount)}}</span>
              <span class="value">{{item.sold_asset_code}}</span>
              <span class="label" v-if="assethosts[item.sold_asset_code]">{{assethosts[item.sold_asset_code] | miniaddress}}</span>
              <span class="label" v-else-if="assethosts[item.sold_asset_issuer]">{{assethosts[item.sold_asset_issuer] | miniaddress}}</span>
              <span class="label" v-else>{{item.sold_asset_issuer| miniaddress}}</span>
            </div>
            <div class="flex3 pa-1">
                <span class="label">{{$t('UnitPriceAbbreviation')}}</span>
                <span class="value">{{Number(item.price)}}{{item.bought_asset_code}}</span>
            </div>
            <!-- <div class="flex2 pa-1">
              <span class="label">tx:{{item.tx | shortaddress}}</span>
              <i class="material-icons trade-icon">copy</i>
            </div>
             -->
            <div class="flex1 textright pt-2">
             <i class="material-icons trade-icon" v-if="item.type === 'canceled'">not_interested</i>
             <i class="material-icons trade-icon" v-else>done</i>
            </div>
          </div>
          
        </div>
      </card>
    </div>



  </div>
</template>


<script>
import Card from './Card'
import {mapState, mapActions, mapGetters} from 'vuex'
import {DEFAULT_INTERVAL} from '@/api/gateways'
import Scroll from '@/components/Scroll'
import DateRangePicker from '@/components/DateRangePicker'
import Loading from './Loading'
import { Decimal } from 'decimal.js'
import { getXdrResultCode } from '@/api/xdr'
var moment = require('moment')
import  defaultsDeep  from 'lodash/defaultsDeep'
import { isNativeAsset } from '@/api/assets'

  export default {
    data() {
      return {
        working: false,
        start: null,
        end: null,
      
      
      }
    },
    computed: {
      ...mapState({
        account: state => state.accounts.selectedAccount,
        assethosts: state => state.asset.assethosts,
        accountData: state => state.accounts.accountData,
        alloffers: state => state.account.alloffers,
      }),
      deals(){
        return this.filterOffers()
      }
    },
    beforeMount () {
      this.start = Number(moment().subtract(30,"days").format('x'))
      this.end = Number(moment().format('x'))
      this.queryAllOffers()
    },
    beforeDestroy(){
      this.$store.commit('CLEAN_ALL_OFFERS')
    },
    methods: {
      ...mapActions({
        getAllOffers: 'getAllOffers',
      }),
      doReload(){
         let _address = this.account.address
         return this.getAllOffers({
           account: _address,
           start_time: this.start,
           end_time: this.end
         })
        //return getAllEffectOffers(_address, this.start, this.end)
      },
      queryAllOffers(){
        this.working = true
        this.doReload().then(response=>{
          this.working = false
        }).catch(err=>{
          console.error(err)
          this.working = false
        })
      },
      reload(){
        return new Promise((resolve,reject) => {
          this.working = true
          this.doReload().then(response=>{
            this.working = false
            resolve()
          }).catch(err=>{
            this.working = false
            console.error(err)
            reject()
          })
        });
      },
      doSearch({start,end}){
        this.start =Number(moment(start + ' 00:00:00').format('x'))
        this.end = Number(moment(end + ' 23:59:59').format('x'))
        this.queryAllOffers()
      },
      
    filterOffers(){
      if(this.alloffers){
        //过滤掉不是当前要显示的数据
        return this.alloffers.map(item=>{
         if(item.bought_asset_code === null || typeof item.bought_asset_code ==='undefined'
             || item.bought_amount ===null || typeof item.bought_amount === 'undefined' ){
            let cancelObj = {
              bought_asset_code: item.base_asset,
              bought_asset_issuer: item.base_issuer,
              sold_asset_code: item.counter_asset,
              sold_asset_issuer: item.counter_issuer,
              sold_amount:item.amount,
              bought_amount:new Decimal(item.amount).times(item.price).toFixed(7)
            }
            return Object.assign({}, item, cancelObj)
          }else{
            return Object.assign({}, item)
          }
          
        })
      }
      return []
    },
    },
    components: {
      Card,
      Scroll,
      DateRangePicker,
    }
  }
</script>

<style lang="stylus" scoped>
@require '../stylus/color.styl'
.offer-card
  background: $secondarycolor.gray

  .table-head
    display: flex
    font-size: 18px
    color: $secondarycolor.font
    padding-top: 2px
    padding-bottom: 2px
    .headcol
      flex: 1
      text-align: right
    .headcol:nth-child(1)
      text-align: left

  .table-row
    display: flex
    font-size: 18px
    color: $secondarycolor.font
    padding-top: 10px
    /*margin-bottom: 20px*/
    .b-row
      flex: 1
      text-align: right
      padding-right: 1px
    .b-row.price
      text-align: left
    .b-row.depth
      text-align: right
      & > a
        color: $primarycolor.green

  .working
    display: block
    width: 20px
    height: 20px
    float: right
    background: url(../assets/img/refresh-icon.png) no-repeat center center
    background-size: 16px 16px
    animation: rotate 2s infinite
    animation-timing-function: linear
    margin: auto auto

  .up
    color: $primarycolor.green
  .down
    color: $primarycolor.red

  .pair-show
    display: flex
    text-align: center
    font-size: 14px
    overflow:hidden
    .pair-from
      flex: 4
      overflow:hidden
      .code
        font-size: 16px
      .issuer
        color: $secondarycolor.font
        font-size: 14px
    .pair-icon
      .material-icons
        //color: $primarycolor.green
        font-size: 20px
        padding-top: 8px
    .pair-to
      flex: 4
      overflow:hidden
      .code
        font-size: 16px
      .issuer
        color: $secondarycolor.font
        font-size: 14px
.myoffer-table
  font-size: 14px
.label
  color: $secondarycolor.font
.trade-icon
  color: $secondarycolor.font
  font-size: 16px
.over-hide
  overflow: hidden
.trade-li
  border-bottom: 1px solid $primarycolor.gray
  &:last-child
    border-bottom: 0
</style>
