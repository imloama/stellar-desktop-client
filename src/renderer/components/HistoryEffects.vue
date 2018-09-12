<template>
    <v-card class="pt-2">
        <div class="textcenter ma-4" v-if="loading_flag">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
            <div class="templatestyle" v-else>
                <v-flex xs12 class="line" v-for="item in effectsData" :key="item.id+item.paging_token" >
                    <v-flex xs12 v-if="item.type=='account_credited'" class="content_style pa-2">
                        <v-layout>
                            <v-flex xs6 class="itemtype_account_credited">
                                {{$t('Receive')}}&nbsp;&nbsp;+{{item.amount}}{{item.asset_type==="native"?"XLM":item.asset_code}}
                            </v-flex>
                            <v-flex xs6 class="itemtime_account_credited" >{{getlocaltime(item.time)}}</v-flex>
                        </v-layout>
                        <v-layout>
                            <v-flex xs12 class="itemstylef_trustline_c underline cursorpointer" @click="showDetails(1,item.tx)" v-if="item.tx!=undefined&&item.tx.length!=0" >TX:{{item.tx}}</v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex v-if="item.type=='trade'" xs12 class="content_style  pa-2">
                        <v-layout xs12>
                             <v-flex xs6 class="itemtype_trade">{{$t("Trade")}}&nbsp;&nbsp;
                                 +{{item.bought_amount}}{{item.bought_asset_type==='native'? 'XLM':item.bought_asset_code}}
                                /-{{item.sold_amount}}{{item.sold_asset_type==="native"?"XLM":item.sold_asset_code}}
                             </v-flex>
                            <v-flex xs6 class="itemtime_trade">{{item.time}}</v-flex>
                        </v-layout>
                         <v-layout xs12>
                            <v-flex xs10 class="itemstylef_trustline_c underline cursorpointer" @click="showDetails(1,item.tx)" v-if="item.tx!=undefined&&item.tx.length!=0">Tx:{{item.tx}}</v-flex>
                           
                        </v-layout>
                    </v-flex>
                    <v-flex v-if="item.type=='trustline_created'" xs12 class="content_style  pa-2">
                        <v-layout>
                            <v-flex xs6 class="itemtype_trustline_c">{{$t("CreateTrustLine")}}&nbsp;&nbsp;
                                {{item.asset_code}}({{getEffectsDataMiniAddress(item.asset_issuer)}})
                            </v-flex>
                            <v-flex xs6 class="itemtime_trustline_c">{{getlocaltime(item.time,item.tx)}}</v-flex>
                        </v-layout>
                        <v-layout xs12>
                            <v-flex xs10 class="itemstylef_trustline_c underline cursorpointer" @click="showDetails(1,item.tx)" v-if="item.tx!=undefined&&item.tx.length!=0">TX:{{item.tx}}</v-flex>
                           
                        </v-layout>
                    </v-flex>
                    <v-flex v-if="item.type=='trustline_removed'" xs12 class="content_style  pa-2">
                        <v-layout xs12>
                            <v-flex xs6 class="itemtype_trustline_r">{{$t("RemoveTrustLine")}}&nbsp;&nbsp;
                                {{item.asset_code}}({{getEffectsDataMiniAddress(item.asset_issuer)}})
                            </v-flex>
                            <v-flex xs6 class="itemtime_trustline_c">{{getlocaltime(item.time,item.tx)}}</v-flex>
                        </v-layout>
                        <v-layout xs12>
                            <v-flex xs12 class="itemstylef_trustline_c underline cursorpointer" @click="showDetails(1,item.tx)" v-if="item.tx!=undefined&&item.tx.length!=0">TX:{{item.tx}}</v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex v-if="item.type=='account_debited'" xs12 class="content_style  pa-2">
                        <v-layout>
                            <v-flex xs6 class="itemtype_account_debited">{{$t('Send')}}&nbsp;&nbsp;
                                -{{item.amount}}{{item.asset_type==="native"?"XLM":item.asset_code}}
                            </v-flex>
                            <v-flex xs6 class="itemtime_account_debited">{{getlocaltime(item.time)}}</v-flex>
                        </v-layout>
                         <v-layout xs12>
                            <v-flex xs12 class="itemstylef_trustline_c underline cursorpointer" @click="showDetails(1,item.tx)" v-if="item.tx!=undefined&&item.tx.length!=0">TX:{{item.tx}}</v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex v-if="item.type=='signer_updated'" xs12 class="content_style  pa-2">
                        <v-layout xs12>
                            <v-flex xs10 class="itemstylef_trustline_c" v-if="item.tx!=undefined&&item.tx.length!=0"> {{item.tx}}</v-flex>
                            <v-flex xs2 class="itemtype">{{$t("SignerUpdated")}}</v-flex>
                        </v-layout>
                        <v-layout>
                            <v-flex xs12 class="itemtime">{{getlocaltime(item.time)}}</v-flex>
                        </v-layout>
                        <v-layout xs12>
                            <v-flex xs5 class="itemstyleo">{{getEffectsDataMiniAddress(item.account)}}1</v-flex>
                            <v-flex xs5 class="itemstylet">{{item.weight}}</v-flex>
                            <v-flex xs2 class="itemstyleth">{{item.type_i}}</v-flex>
                        </v-layout>
                          <v-layout>
                        </v-layout>
                    </v-flex>
                    <v-flex v-if="item.type=='signer_created'" xs12 class="content_style  pa-2">
                        <v-layout xs12>
                            <v-flex xs10 class="itemstylef_trustline_c" v-if="item.tx!=undefined&&item.tx.length!=0">Tx:{{item.tx}}</v-flex>
                            <v-flex xs2 class="itemtype_signer_created">{{$t("SignerCreated")}}</v-flex>
                        </v-layout>
                        <v-layout xs12>
                            <v-flex xs12 class="itemtime_signer_created">{{getlocaltime(item.time)}}</v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex v-if="item.type=='account_home_domain_updated'" xs12 class="content_style  pa-2">
                        <v-layout xs12>
                            <v-flex xs10 class="itemstylef_trustline_c underline cursorpointer" @click="showDetails(1,item.tx)" v-if="item.tx!=undefined&&item.tx.length!=0">TX:{{item.tx}}</v-flex>
                            <v-flex xs2 class="itemtype_ahdu">{{$t("AccountHomeDomainUpdated")}}</v-flex>
                        </v-layout>
                        <v-layout>
                            <v-flex xs12 class="itemtime_ahdu">{{getlocaltime(item.time)}}</v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex v-if="item.type=='account_inflation_destination_updated'" xs12 class="content_style  pa-2">
                        <v-layout xs12>
                            <v-flex xs10 class="itemstyleo_aidu underline cursorpointer" @click="showDetails(1,item.tx)" v-if="item.tx!=undefined&&item.tx.length!=0">TX:{{item.tx}}</v-flex>
                            <v-flex xs2 class="itemtype_aidu">{{$t("AccountInflationDestinationUpdated")}}</v-flex>
                        </v-layout>
                        <v-layout>
                            <v-flex xs12 class="itemtime_aidu">{{getlocaltime(item.time)}}</v-flex>
                        </v-layout>
                          <v-layout>
                        </v-layout>
                    </v-flex>
                    <v-flex v-if="item.type=='account_created'" xs12 class="content_style  pa-2">
                        <v-layout xs12>
                            <v-flex xs10 class="itemstylef_trustline_c underline cursorpointer" @click="showDetails(1,item.tx)" v-if="item.tx!=undefined&&item.tx.length!=0">TX:{{item.tx}}</v-flex>
                            <v-flex xs2 class="itemtype_account_created">{{$t("AccountCreated")}}</v-flex>
                        </v-layout>
                        <v-layout xs12>
                            <v-flex xs12 class="itemtime_account_created">{{getlocaltime(item.time)}}</v-flex>
                        </v-layout>
                    </v-flex>
                </v-flex>
                    <v-flex xs12 class="loadmorestyle">
                        <v-layout xs12>
                            <v-flex v-if="!loading_flag && !hasnomore" xs12>
                                <v-btn block flat color="primary" :loading="loadmore_isflag" @click="loadmore">
            {{$t('LoadMore')}}
            </v-btn>
                             </v-flex>
                            <v-flex v-if="hasnomore" xs12>{{$t("NoMoreData")}}</v-flex>
                        </v-layout>
                    </v-flex>
            </div>
        <steexp-dlg v-if="detailsView" :i="detailsI" :v="detailsV" @close="detailsView = false" />
    </v-card>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import {mapState, mapActions, mapGetters} from 'vuex'
import Card from '@/components/Card'
import * as accountapi from '@/api/account'
import {getAddressByAccountId} from '@/api/federation'
import { fetchEffects } from '@/api/effects'
import SteexpDlg from '@/components/SteexpDlg'
export default {
    data () {
        return {
            effectsData:[],
            effectsInstance: null,
            loadmore_count:0,
            loadmore_isflag:false,
            hasnomore: false,
            dataObj:[],
            loading_flag:false,
            detailsI: 1,//1表示tx值0表示account
            detailsV: null,
            detailsView: false
        }
    },
    mounted(){
        this.getEffectsData()
    },
    computed: {
        ...mapState({
            account: state => state.accounts.selectedAccount,
            accountData: state => state.account.data,
            assethosts: state => state.asset.assethosts,
            selectedAccountIndex: state => state.accounts.selected,
                 }),
        ...mapGetters([
            'balances',
                ]),
    },
    methods: {
      ...mapActions([
        'getAccountInfo',
        'getTransactionsPage',
        'selectPayment',
        'cleanAccount'
      ]),
      reload(){
        this.effectsInstance = null
        return new Promise((resolve,reject)=>{
          this.getEffectsData(resolve,reject)
        });
      },
      load() {
        let address = this.account.address
        return Promise.all([this.getAccountInfo(this.account.address)])
      },
      onRefresh: function () {
        console.log('-----on refresh---------')
        return this.load()
      },
      toTranscation(item) {
        this.selectPayment(item)
        this.$router.push({name: 'Transaction'})
      },
      getEffectsData(resolve,reject){
          if(this.effectsInstance){
              this.loadmore_isflag = true
              this.effectsInstance.next().then(response=>{
                  this.loadmore_isflag = false
                  this.loadmore_count= this.effectsData.length
                  this.effectsData = this.effectsData.concat(response.records)
                  this.effectsData = this.effectsData.map(item=> Object.assign({time: '',tx: ''},item))
                  this.effectsInstance = response
                  console.log(this.effectsData.length)
                  if(this.loadmore_count == this.effectsData.length){
                      this.hasnomore = true
                  }
                this.effectsData.forEach((item)=>{
                    item.operation().then((response)=>{
                        console.log(item)
                        console.log(response.created_at)
                        item.time = response.created_at
                        item.tx = response.transaction_hash
                        console.log(item)
                    })
                    })
              }).catch(err=>{
                  this.loadmore_isflag = false
                  console.error(err)
              })
          }else{
              this.loading_flag = true
              fetchEffects(this.account.address).then(response=>{
                this.loading_flag = false
                this.effectsInstance = response
                this.effectsData = this.effectsData.concat(response.records)
                this.effectsData = this.effectsData.map(item=> Object.assign({time: '',tx: ''},item))
                // console.log(this.effectsData)
                  this.effectsData.forEach((item)=>{
                    item.operation().then((response)=>{
                    item.time = response.created_at
                    item.tx = response.transaction_hash
                    let tempObj = {}
                    tempObj.id  = item.id
                    tempObj.time =response.created_at
                    this.dataObj.push(tempObj)
                    })
                  })
                  
                  this.loading_flag = false
                  if(resolve){
                      resolve()
                  }
              }).catch(err=>{
                  this.$emit('reloadfail')
                this.loading_flag = false
                console.error(err)
                if(reject){
                    reject()
                }
              })
          }
      },
      loadmore(){
        this.getEffectsData()
      },
      getEffectsDataMiniAddress(address){
          return accountapi.miniAddress(address)
      },
      getlocaltime(itemtime,itemtx){
          if(itemtime.length!=0){
                var date = new Date(itemtime)
                let tempdate   = date.toLocaleDateString().replace(/\//g,"-")
                // console.log(tempdate+" "+date.toLocaleTimeString())
                return tempdate+" "+date.toLocaleTimeString()
          }else{
                return ''
          }
      },
      showDetails(i,v){
        this.detailsI = i
        this.detailsV = v
        this.detailsView = true
        console.log(this)
      },

    },
    components: {       
      Toolbar,
      Card,
      SteexpDlg,
    }



}
</script>

<style lang="stylus" scoped>
  @require '~@/stylus/color.styl'
.templatestyle
    padding: 5px 5px

.line 
    border-bottom: 1px solid $primarycolor.gray
    font-size: 14px
    &:last-child
        border-bottom: 0
.itemtime
    color:$secondarycolor.font
    padding-left:5px
    padding-top:3px
.itemtype
    color:$primarycolor.green
    text-align:center
    padding-top:3px
.itemtx_signer_updated
    color:$secondarycolor.font
    text-align:left
.itemstyleo
    color:$secondarycolor.font
    padding-left:5px
    padding-bottom:3px
.itemstylet
    color:$secondarycolor.font
    padding-bottom:3px
    word-break:break-all
.itemstyleth
    color:$secondarycolor.font
    text-align:center
    padding-bottom:3px


.itemtype_account_created
    color:$primarycolor.green
    padding-left:5px
.itemtime_account_created
    color:$secondarycolor.font
    padding-left:5px
.itemstyleo_account_created
    color:$secondarycolor.font
    text-align:left

.itemtime_trustline_c
    color:$secondarycolor.font
    padding-left:5px
    padding-top:3px
.itemtype_trustline_c
    color:$primarycolor.green
    padding-left:5px
    padding-top:3px
    // text-align:center
.itemstylet_trustline_c
    color:$secondarycolor.font
    padding-left:5px
    padding-top:3px
    word-break:break-all
    text-align:left
.itemstyleth_trustline_c
    color:$secondarycolor.font
    padding-top:3px
    text-align:left
.itemstylef_trustline_c
    color:$secondarycolor.font
    word-break:break-all
    text-align:left
    padding-left: 5px


.itemtime_trustline_r
    color:$secondarycolor.font
    padding-left:5px
    padding-top:3px
.itemtype_trustline_r
    color:$primarycolor.red
    padding-left:5px
    padding-top:3px
    // text-align:center
.itemstylet_trustline_r
    color:$secondarycolor.font
    padding-left:5px
    padding-top:3px
    word-break:break-all
    text-align:left
.itemstyleth_trustline_r
    color:$secondarycolor.font
    padding-top:3px
    text-align:left
.itemstylef_trustline_r
    color:$secondarycolor.font
    text-align:left

.itemtype_signer_created
    color:$primarycolor.green
    padding-left:5px
.itemtime_signer_created
    color:$secondarycolor.font
    padding-left:5px
.itemstyleo_signer_created
    color:$secondarycolor.font
    word-break:break-all
    text-align:left




.itemtime_account_debited
    color:$secondarycolor.font
    padding-left:5px
    padding-top:3px
.itemtype_account_debited
    color:$primarycolor.red
    padding-left:5px
    padding-top:3px
    // text-align:center
.itemstyleo_account_debited
    color:$secondarycolor.font
    padding-top:3px
    word-break:break-all
    text-align:left
    padding-left:5px
.itemstylet_account_debited
    color:$secondarycolor.font
    padding-top:3px
    word-break:break-all
    text-align:left

.itemstyleth_account_debited
    color:$secondarycolor.font
    padding-top:3px
    text-align:left
.itemstylef_account_debited
    color:$secondarycolor.font
    text-align:left




.itemtime_account_credited
    color:$secondarycolor.font
    padding-left:5px
    padding-top:3px
.itemtype_account_credited
    color:$primarycolor.green
    padding-left:5px
    padding-top:3px
    // text-align:center
.itemstyleo_account_credited
    color:$secondarycolor.font
    padding-top:3px
    word-break:break-all
    text-align:left
    padding-left:5px
.itemstylet_account_credited
    color:$secondarycolor.font
    // padding-left:5px
    padding-top:3px
    word-break:break-all
    text-align:left

.itemstyleth_account_credited
    color:$secondarycolor.font
    padding-top:3px
    text-align:left
.itemstylef_account_credited
    color:$secondarycolor.font
    padding-left:5px
    text-align:left
    




.itemtime_trade
    color:$secondarycolor.font
    padding-left:5px
    padding-top:3px
    // text-align:right
.itemtype_trade
    color:$primarycolor.green
    padding-left:5px
    padding-top:3px
    text-align:left
.itemstyleo_trade
    color:$secondarycolor.font
    padding-left:5px
    padding-top:3px
    word-break:break-all
.itemstylet_trade
    color:$secondarycolor.font
    padding-left:5px
    padding-top:3px
    word-break:break-all
.itemstyleth_trade
    color:$secondarycolor.font
    padding-left:5px
    padding-top:3px
.itemstylef_trade
    color:$secondarycolor.font
    text-align:left


.red_itemtime
    color:$secondarycolor.font
    padding-left:5px
    padding-top:3px
.red_itemtype
    color:$primarycolor.red
    text-align:center
    padding-top:3px
.red_itemstyleo
    color:$secondarycolor.font
    padding-left:5px
    padding-bottom:3px
.red_itemstylet
    color:$secondarycolor.font
    text-align:center
    padding-bottom:3px
.red_itemstyleth
    color:$secondarycolor.font
    text-align:center
    padding-bottom:3px

.trade_styleo
    color:$primarycolor.green
    padding-left:5px
    text-align:right
    padding-bottom:3px
.trade_stylet
    color:$primarycolor.font
    text-align:center
    padding-bottom:3px
.trade_styleth
    color:$primarycolor.red
    text-align:left
    padding-bottom:3px

.itemtype_aidu
    color:$primarycolor.green
    padding-left:5px 
.itemtime_aidu
    color:$secondarycolor.font
    padding-left:5px
.itemstyleo_aidu
    color:$secondarycolor.font
    word-break:break-all
    text-align:left



.itemtype_ahdu
    color:$primarycolor.green
    padding-left:5px
.itemtime_ahdu
    color:$secondarycolor.font
    padding-left:5px
.itemstyleo_ahdu
    color:$secondarycolor.font
    word-break:break-all
    text-align:left






.loadmorestyle
    text-align:center

</style>

