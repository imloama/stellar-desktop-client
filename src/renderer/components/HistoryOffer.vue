/**
* 历史页面
* 我的委单
*/
<template>
  <div class="">
    <card class="offer-card" padding="10px 10px" v-if="!refreshing && !moreloading && offers.length ==0">
      {{$t("Error.ValueIsNull")}}
    </card>
    
    <div class="mt-1 mb-1">
      <card class="offer-card" padding="10px 10px">
        <div class="myoffer-table offer-table" slot="card-content">
          <div class="textcenter ma-4" v-if="refreshing">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </div>
          <div class="flex-row offerrow"  v-else v-for="(offer, index) in offers" :key="index">
            <div class="flex1 pa-2">
              <span class=" value down">+{{Number(offer.total)}}</span>
              <span class="code">{{offer.to.code}}</span>
              <span class="label" v-if="assethosts[offer.to.code]">{{assethosts[offer.to.code] | miniaddress}}</span>
              <span class="label" v-else-if="assethosts[offer.to.issuer]">{{assethosts[offer.to.issuer] | miniaddress}}</span>
              <span class="label" v-else>{{offer.to.issuer | miniaddress}}</span>
            </div>
            <div class="flex1 pa-2">
              <span class=" value up">-{{Number(offer.amount)}}</span>
              <span class="code">{{offer.from.code}}</span>
              <span class="label" v-if="assethosts[offer.from.code]">{{assethosts[offer.from.code] | miniaddress}}</span>
              <span class="label" v-else-if="assethosts[offer.from.issuer]">{{assethosts[offer.from.issuer] | miniaddress}}</span>
              <span class="label" v-else>{{offer.from.issuer | miniaddress}}</span>
            </div>

            <div class="flex1 pa-2">
              <span class="label">{{$t('UnitPriceAbbreviation')}}</span>
              <span class="value">{{Number(offer.price)}}{{offer.from.code}}</span>
            </div>
           

            <div class="flex1 textright pa-2">
              <a href="javascript:void(0)" @click="cancelMyOffer(offer,index)">{{$t('Trade.Cancel')}}</a>
            </div>
          </div>
          
          <div class="textcenter mt-2" v-if="!refreshing && hasnomore">{{$t('NoMoreData')}}</div>
        </div>
      </card>
    </div>
    <v-btn block flat color="primary" v-if="!refreshing && !hasnomore"  :loading="moreloading" @click="loadmore">
      {{$t('LoadMore')}}
    </v-btn>

   <loading :show="working" :loading="sending" :success="dealok" :fail='dealfail' 
      color="red" :title="loadingTitle" :msg="loadingMsg" :closeable="dealfail" @close="hiddenLoadingView"/>

  <password-sheet v-if="showPasswordInput" @cancel="showPasswordInput=false" @ok="doCancel"/>

  </div>
</template>


<script>
import Card from './Card'
import {mapState, mapActions, mapGetters} from 'vuex'
import {cancel as cancelOffer} from '@/api/offer'
import {DEFAULT_INTERVAL} from '@/api/gateways'
import Scroll from '@/components/Scroll'
import {myofferConvert} from '@/api/offer'
import Loading from './Loading'
import { Decimal } from 'decimal.js'
import { getXdrResultCode } from '@/api/xdr'
import PasswordSheet from '@/components/PasswordSheet'

  export default {
    data() {
      return {
        offers: [],
      
        working: false,
        sending: false,
        dealok: false,
        dealfail: false,
        loadingTitle: null,
        loadingMsg: null,

        refreshing:false,
        moreloading: false,
        hasnomore: false,
        showPasswordInput: false,

        cancelItem: null,
        cancelIndex: null,
      
      }
    },
    computed: {
      ...mapState({
        my: state => state.accounts.selectedTradePair.my.records,
        assethosts: state => state.asset.assethosts,
        accountData: state => state.accounts.accountData,
      }),
    },
    watch:{
      my(){
        this.offers = this.my.map(item=>Object.assign({origin: item}, this.convertOffer(item)))
      }
    },
    mounted() {
      this.reload();
    },
    methods: {
      ...mapActions({
        queryMyOffers: 'queryMyOffers',
        queryMyNextPageOffers:'queryMyNextPageOffers',
        switchTradePair: 'switchTradePair'
      }),
      setup() {
        return this.queryMyOffers()
      },
      loadmore(){
        if(this.moreloading)return
        this.moreloading = true
        let len = this.my.length
        this.queryMyNextPageOffers().then(response=>{
          let nlen = this.my.length
          if(len === nlen){
            this.hasnomore = true
          }
          this.moreloading = false
        })
        .catch(err=>{
          this.moreloading = false
        })
      },
      switchPair(offer) {
        let index = offer.pair_id
        let tradepair = {from: offer.pair.to, to: offer.pair.from}
        this.switchTradePair({index, tradepair})
          .then(data => {
            this.setup()
          })
      },
      cancelMyOffer(item,index) {
        this.cancelItem = item
        this.cancelIndex = index
        if (this.accountData.seed) {
          this.doCancel();
        }else{
          this.showPasswordInput = true
        }
      },
      doCancel(){
        if (this.working) return
        this.onWorking()
        cancelOffer(this.accountData.seed, this.cancelItem.origin || this.my[this.cancelIndex])
          .then(data => {
            this.cancelItem = null
            this.cancelIndex = null
            return this.setup()
          }).then(()=>{
            this.onSuccess()
          }).catch(err => {
            console.log(err)
            this.cancelItem = null
            this.cancelIndex = null
            this.onFail()
            this.setup()
          })
      },

      convertOffer(offer){
        if(offer === null || typeof offer === 'undefined')return {}
        let data = {}
        if(offer.buying.asset_type === 'native'){
          data.to = { code: 'XLM', issuer: 'stellar.org'}  
        }else{
          data.to = {code: offer.buying.asset_code, issuer: offer.buying.asset_issuer }
        } 
        if(offer.selling.asset_type === 'native'){
          data.from = { code: 'XLM', issuer: 'stellar.org'}  
        }else{
          data.from =  {code: offer.selling.asset_code, issuer: offer.selling.asset_issuer }
        }

        data.amount = offer.amount
        data.id = offer.id
        data.price = Number(new Decimal(offer.price_r.d).div(offer.price_r.n).toFixed(7))//Number(offer.price)
        data.price_r = offer.price_r
        data.seller = offer.seller
        data.total = new Decimal(offer.amount).times(offer.price_r.n).div(offer.price_r.d).toFixed(7)
        return data
      },

      onWorking(){
        this.working = true
        this.sending = true
        this.dealok = false
        this.dealfail = false
        this.loadingTitle = null
        this.loadingMsg = null
      },
      onSuccess(){
        this.sending = false
        this.dealok = true
        this.loadingTitle = this.$t('Trade.CancelOfferSuccess')
        setTimeout(()=>{
          this.loadingTitle = null
          this.loadingMsg = null
          this.dealok = false
          this.working = false
        },1000)
      },
      onFail(err){
        this.sending = false
        this.dealfail = true
        this.loadingTitle = this.$t('Error.CancelOfferFailed')
        let msg = getXdrResultCode(err)
        if(msg){
          this.loadingMsg = this.$t(msg)
        }else if(err){
          this.loadingMsg = this.$t(err.message)
        }
      },
      hiddenLoadingView(){
        this.working = false
        this.loadingTitle = null
        this.loadingMsg = null
      },
      reload(){
        if(this.refreshing)return;
        this.refreshing = true
        this.queryMyOffers().then(response=>{
          this.refreshing = false
          this.$emit('reloadok')
        }).catch(err=>{
          this.refreshing = false
          this.$emit('reloadfail')
        });
      }

    },
    components: {
      Card,
      Scroll,
      Loading,
      PasswordSheet,
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
    width: 100%
    text-align: center
    font-size: 14px
    padding-top: 10px
    padding-bottom: 10px
    overflow: hidden
    .pair-from
      flex: 3
      overflow: hidden
      .code
        font-size: 16px
      .issuer
        color: $secondarycolor.font
        font-size: 14px
    .pair-icon
      flex: 1
      .material-icons
        //color: $primarycolor.green
        font-size: 20px
        padding-top: 8px
    .pair-to
      flex: 3
      overflow: hidden
      .code
        font-size: 16px
      .issuer
        color: $secondarycolor.font
        font-size: 14px
.myoffer-table
  font-size: 14px
.label
  color: $secondarycolor.font
.offerrow
  border-bottom: 1px solid $primarycolor.gray
  padding: .5rem 0
  &:last-child
    border-bottom: 0px
</style>
