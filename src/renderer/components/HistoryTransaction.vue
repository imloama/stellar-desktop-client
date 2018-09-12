<template>
  <div>
      <div class="mt-2 mb-2">
        <card padding="10px 10px" class="infocard">
          <div class="history" slot="card-content">
            <v-layout class="history-li" row wrap v-for="item in history" :key="item.id">
              <v-flex xs4 class="history-wrapper">
                <div class="history">
                  <div class="history-flag">{{$t(item.flag)}} &nbsp;
                    <span class="tx cursorpointer underline" @click="showDetails(1,item.origin.transaction_hash)">{{item.counterparty|miniaddress}}</span></div>
                  <div class="history-time tx">{{item.origin.created_at}}</div>
                </div>
              </v-flex>
              <v-flex xs8 class="history-wrapper">
                <div v-if="item.isInbound!=null && item.isInbound!=undefined"
                     :class="'history-amount' + (item.isInbound ? ' add ':' minus ') ">
                  <span class="inbound" v-if="item.isInbound">+</span>
                  <span class="inbound" v-else>-</span>
                  <span class="amount">{{item.amount}}</span>
                  <span class="code" v-if="item.asset">{{item.asset.code}}</span>
                </div>
                <div class="textright tx cursorpointer underline" @click="showDetails(1,item.origin.transaction_hash)">tx:{{item.origin.transaction_hash}}</div>
              </v-flex>
            </v-layout>
          </div>
        </card>

        <steexp-dlg v-if="detailsView" :i="detailsI" :v="detailsV" @close="detailsView = false" />

        <div class="loadmore textcenter" v-if="history.length > 0">
           <v-btn block flat color="primary" v-if="!loadmore && hasmore"  :loading="loadmore" @click="loadmoreData">
            {{$t('LoadMore')}}
            </v-btn>
        </div>
      </div>
  </div>
</template>

<script>
  import Toolbar from '@/components/Toolbar'
  import {mapState, mapActions, mapGetters} from 'vuex'
  import Card from '@/components/Card'
  import * as accountapi from '@/api/account'
  import {getAddressByAccountId} from '@/api/federation'
  import paymentsMixin from '@/mixins/payments'
  import debounce from 'lodash/debounce'
  import SteexpDlg from '@/components/SteexpDlg'

  export default {
    data() {
      return {
        loadmore: false,
        hasmore: true,
        detailsI: 0,//1表示tx值0表示account
        detailsV: null,
        detailsView: false
      }
    },
    mixins: [paymentsMixin],
    computed: {
      ...mapState({
        account: state => state.accounts.selectedAccount,
        accountData: state => state.account.data,
        assethosts: state => state.asset.assethosts,
        selectedAccountIndex: state => state.accounts.selected,
      }),
      ...mapGetters([
        'balances',
        'paymentsRecords'
      ]),
      history() {
        let data = []
        if (!this.paymentsRecords) {
          return data;
        }
        this.paymentsRecords.forEach((ele) => {
          if (ele.type === 'payment' || ele.type === 'path_payment') {
            if (ele.isInbound) {
              ele.flag = 'Receive'
            } else {
              ele.flag = 'Send'
            }
          } else {
            ele.flag = ele.type
          }
          data.push(ele)
        });
        return data
      }

    },
    methods: {
      ...mapActions([
        'getAccountInfo',
        'getTransactionsPage',
        'selectPayment',
        'cleanAccount'
      ]),
      onRefresh(){
        return this.getPayments(this.account.address)
      },

      loadmoreData:debounce(function(){
        this.loadmore = true
        let startLen = this.paymentsRecords.length
        console.log('------------moremore----')
        this.loadmorePayments(this.account.address)
          .then(data=>{
            this.loadmore = false
            let endLen = this.paymentsRecords.length
            if(startLen === endLen){
              this.hasmore = false
            }
          })
          .catch(err=>{
            console.error(err)
            this.loadmore = false
          })
          
      },300),

      toTranscation(item) {
        this.selectPayment(item)
        this.$router.push({name: 'Transaction'})
      },
      reload(){
        return this.getPayments(this.account.address)
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
.infocard
  text-algin: center
  background: $secondarycolor.gray
   
  .history-li
    padding-top: 5px
    padding-bottom: 5px
    font-size: 16px
    border-bottom: 1px solid $primarycolor.gray
    &:last-child
      border-bottom: 0px
  .history-amount
    text-align: right

  .history-amount.add
    color: $primarycolor.green

  .history-amount.minus
    color: $primarycolor.red
  .loadmore
    padding-top: .3rem
  .tx
    color: $secondarycolor.font
    font-size: 14px
  
</style>
