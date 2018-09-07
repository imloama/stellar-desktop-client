/**
 * 
 */
<template>

  <div class="page">
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      ref="toolbar"
      >
      <!-- <v-btn icon slot='left-tool' @click="toThirdApps">
        <i class="material-icons">apps</i>
      </v-btn> -->
      <v-btn icon @click="showAccounts" slot="left-tool">
          <i class="material-icons font28">menu</i>
      </v-btn>

      <v-btn icon slot='right-tool' @click="toAddAsset">
        <i class="material-icons font28">&#xE145;</i>
      </v-btn>
      <span slot="switch_password">{{$t('Account.Password')}}</span>
    </toolbar>
    <accounts-nav :show="showaccountsview" @close="closeView"/>
     <!--=======================================================-->
<m-layout>

   
   <div class="assets-xcontent mt-2"> 
      <card padding="0px 0px" margin="0px 0px" class="myassets_infocard_thirdassets full-width">
        <div class="assets full-width" slot="card-content">

                
      <div class="accountandtotalasset flex-row  pt-2 pb-2 mt-4">
          <div id="TotalSum" class="myassets_totalSum flex6" >
            <span class="myassets_TotalSumWord" >{{$t('Menu.MyAssets')}}≈</span>
            <span>{{TotalSum.toFixed(7)}}</span><!-- 要改成资产数组数据的累加的和-->
            <span>XCN</span>
          </div>
          <div class="textright flex1 pt-2 pr-3 primarycolor" style="cursor:pointer;"
            @click="toAddAsset">
            <v-icon>add</v-icon>
          </div>
          <div class="textcenter flex1 pt-2 primarycolor" style="cursor:pointer;"
            @click="doRefresh" v-if="!reloading">
            <v-icon>refresh</v-icon>
          </div>
          <div class="textcenter flex1 pt-2 primarycolor" v-else><v-progress-circular
            indeterminate size=24
            color="primary"
          ></v-progress-circular></div>
      </div>

        <div class="assets-content">
          <div class="assets-row" v-for="item in assets" :key="item.issuer+item.code" >

            <v-layout class="myassets-li third-li" row wrap >
              <v-flex xs1 class="myassets-wrapper ">
                <div class="icon-wrapper textright">
                  <i :class="'iconfont ' + assetIcon(item.code,item.issuer)"></i>
                </div>
              </v-flex>
            <v-flex xs3 class="myassets-wrapper">
              <div class="myassets">
                <div class="myassets-name">{{item.code}}
                  <span class="myassets-issuer" v-if="item.home_domain">{{item.home_domain}}</span>
                  <span class="myassets-issuer" v-else-if="assethosts[item.issuer]">{{assethosts[item.issuer] }}</span>
                  <span class="myassets-issuer" v-else>{{item.issuer | miniaddress}}</span>
                </div>
                <div class="myassets-issuer">{{item.issuer | shortaddress}}</div>
              </div>
            </v-flex>
            <v-flex xs5 class="myassets-wrapper">
              <div class="myassets-balance third">
                 
                 <span v-if="nativeAsset(item)" class="pr-2">{{$t('Reserve')}}:{{reserve}}</span>
                 <span class="balance">{{item.balanceStr}}</span>
                 <span class="label">{{$t('Total')}}</span> 
                 <br/>
                 <span v-if="item.total >=0">≈{{item.total > 0 ? item.total : 0}}&nbsp;XCN</span>
                 
                  
              </div>
            </v-flex>
            <v-flex xs3 class="myassets-wrapper">
              <div class="myassets-operate-box">
                <span  v-if="nativeAsset(item)" class="del cursorpointer">&nbsp;</span>
                <span v-else class="del cursorpointer" @click.stop="del(item)">{{$t('Delete')}}</span>

                <span class="receive cursorpointer" @click.stop="receive(item)">{{$t('Receive')}}</span>
                <span class="send cursorpointer" @click.stop="send(item)">{{$t('Send')}}</span>
              </div>
            </v-flex>
          </v-layout>
          
          </div>
        </div>

        </div>
      </card>
    </div>


  </m-layout>

<!--   
  <tab-bar />
   -->
  
   <bottom-notice :show.sync="notice" :text="noticeText"></bottom-notice>

  <!-- <bottom-notice :show.sync="accountNotFundDlg" @update:show="closeAccountNotFoundDlg">
    <div slot>
      <div @click="toHelp">{{$t('Error.AccountNotFund')}}<v-icon color="primary">help</v-icon></div>
      <div @click="toKYC"><span class="underline">{{$t('kyc_active')}}</span></div>
      
    </div>
  </bottom-notice> --><!--v-if="accountNotFundDlg"-->
  <un-fund-notice  v-if="accountNotFundDlg" @close="closeAccountNotFoundDlg">></un-fund-notice>
  

   <loading :show="working" :loading="working" :success="delok" :fail='delerror' />
   <password-sheet v-if="needpwd" @cancel="cancelpwd" @ok="checkpwd" />
  </div>

</template>

<script>
import Toolbar from '@/components/Toolbar'
import { mapState, mapActions, mapGetters} from 'vuex'
import Card from '@/components/Card'
import BottomNotice from '@/components/BottomNotice'
import  { miniAddress } from '@/api/account'
import { isNativeAsset } from '@/api/assets'
import { COINS_ICON, FF_ICON, DEFAULT_ICON, WORD_ICON} from '@/api/gateways'
import Loading from '@/components/Loading'
import backbutton from '@/mixins/backbutton'
import loadaccount from '@/mixins/loadaccount'
import Scroll from '@/components/Scroll'
import TabBar from '@/components/TabBar'
import  defaultsDeep  from 'lodash/defaultsDeep'
import { getAssetPrice } from '@/api/fchain'
import { Decimal } from 'decimal.js'
import throttle from 'lodash/throttle'
import AccountsNav from '@/components/AccountsNav'
import {SET_PRICE_BY_API} from '@/store/modules/AppSettingStore'
//过滤0资产
const FLAG_FILTER_ZERO = "filter_zero";
//不过滤资产
const FLAG_DEFAULT = "none";
//按名称排序
const SORT_NAME = "name";
const SORT_BANLANCE = "balance";
const SORT_DEFAULT = "none";
import UnFundNotice from '@/components/UnFundNotice'
import HistoryDepositAndWithdraw from '@/components/HistoryDepositAndWithdraw'
import HistoryEffects from '@/components/HistoryEffects'
import HistoryOffer from '@/components/HistoryOffer'
import HistoryTrade from '@/components/HistoryTrade'
import HistoryTransaction from '@/components/HistoryTransaction'
import HistoryTransactions from '@/components/HistoryTransactions'

export default {
  data(){
    return {
      title: 'Title.MyAssets',
      showbackicon: false,
      showmenuicon: true,
      noticeText: '',  
      notice: false,
      

      showaccountsview: false,

      working:false,
      delok: false,
      delerror: false,

      reloading: false,
      paymentReloading: false,
      paymentLoadmoring: false,
      activeHistory: null,
      components: {
        offer: HistoryOffer,
        transaction: HistoryTransaction,
        trade: HistoryTrade,
        depositAndWithdraw: HistoryDepositAndWithdraw,
        effects: HistoryEffects,
        transactions: HistoryTransactions
      },
      show: {
        name: null,
        component: null
      },
      currentHistoryComponent: 'transaction',

      needpwd: false,
      is_Flag: FLAG_DEFAULT,
      sort_flag: SORT_BANLANCE,
      price:[],

      _getPriceFn: null,

      selectedItem: null,

      sortItems: [{
          key: SORT_DEFAULT,
          label: 'DefaultSort'
        },{
          key: SORT_NAME,
          label: 'SortByName'
        },{
          key: SORT_BANLANCE,
          label: 'SortByAsset'
        }],
      selectedSortItem:{key: SORT_BANLANCE,
          label: 'SortByAsset'}
    }
  },
  mixins: [backbutton, loadaccount],
  computed:{
    ...mapState({
      priceState: state => state.app.price,
    }),
     ...mapGetters([
      'balances',
      'paymentsRecords',
      'reserve',
      
    ]),
    history(){
      let data = []
      if(!this.paymentsRecords){
        return data;
      }
      return this.paymentsRecords.map(item=>{
        let ele = Object.assign({}, item)
        if(ele.type==='payment' || ele.type==='path_payment'){
            ele.flag = ele.isInbound ? 'Receive' : 'Send'
          }else{
            ele.flag = ele.type
          }
        return ele
      })
    },
 /**
     * 尝试修改的资产总和
     */
    TotalSum() {
      let pricemap = this.prices
      let data = this.balances.map(item=>{
        let v = isNativeAsset(item) ? pricemap['XLM'] : pricemap[item.code + '-' + item.issuer]
        return v ? new Decimal(v.price || 0).times(item.balance) : new Decimal(0)
      })
      if(data.length === 0)return 0
      return data.reduce((t,i)=> t.add(i ? i : 0))
    },
    ...mapState({
      account: state => state.accounts.selectedAccount,
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      islogin: state => (state.accounts.accountData.seed ? true : false),
      assethosts: state => state.asset.assethosts,
      notfunding: state => state.account.account_not_funding
    }),
    ...mapGetters(["balances", "paymentsRecords", "reserve", "native"]),
    prices(){
      let obj = {}
      this.price.forEach(item=>{
        if(isNativeAsset(item)){
          obj[item.code] = Object.assign({}, item)
        }else{
          obj[item.code+'-'+item.issuer] = Object.assign({}, item)
        }
      })
      return obj;
    },
    assets() {
      if (!this.balances) return [];
      let data = this.balances
        .map(item => {
          return defaultsDeep({}, item, { price: 0 }); // new Decimal(item.balance).times(1).toFixed(7) })
        })
        .filter(item => {
          if (this.is_Flag === FLAG_FILTER_ZERO) {
            return item.balance > 0;
          } else {
            return true;
          }
        });
      //按照名称排序或者是按照资产排序,默认直接返回。
        if (this.sort_flag != SORT_DEFAULT) {        
          data = data.sort((item1, item2) => {
            if (this.sort_flag === SORT_NAME) {
              return item1.code > item2.code ? 1 : -1;
            } else if (this.sort_flag === SORT_BANLANCE) {
              return item2.balance - item1.balance;
            }
          });
        }
      //添加价格
      data.forEach(item=>{
        
        if(item.balance > 0){
          let key = item.code
          if(!isNativeAsset(item)) {
            key += '-' + item.issuer    
          }
          let p = this.prices[key]
          if(p){
            item.price = p.price
            item.home_domain = p.home_domain
            item.total = new Decimal(p.price || 0).times(Number(item.balance)).toFixed(7);
          }
        }else{
          item.total = 0
        }
      }) 
      return data.map(item=> {
          item.balanceStr = item.balance > 0 ? item.origin_balance: 0
          return item
      })
    }
  },
  watch: {
    sort_flag(){
      this.selectedItem = null
    },
    balances(){
      if(this.balances && this.balances.length>0 && this._getPriceFn){
        this._getPriceFn()
      }
    }
  },
  created() {
      this.switchComponent(this.currentHistoryComponent)
    },
  beforeMount () {
    this.price = this.priceState
  },
  mounted() {
    this._getPriceFn = throttle(()=>{
      //this.balances.filter(item=> Number(item.balance)>0
      if(this.balances && this.balances.length > 0){
        getAssetPrice(this.balances.map(item=> {
          return {code: item.code, issuer:item.issuer }
        }))
        .then(response => {
          this.price = response.data;
          this.$store.commit(SET_PRICE_BY_API, response.data)
        }).catch(err => {});
      }
     },60000)

    this.$nextTick(() => {
      
      // TODO 优化
      // setTimeout(() => {
      //   if (this.notfunding) {
      //     this.noticeText = this.$t("Error.AccountNotFund");
      //     this.notice = true;
      //   }
      // }, 3000);

    });
  },
  methods: {
    ...mapActions([
      'getAccountInfo',
      'cleanAccount',
      'updateAccount',
      'getPayments',
      'loadmorePayments',
      'selectPayment',
      ]),
      
    switchComponent(name) {
      if (name == this.show.name) return
      this.show.name = name
      this.show.component = this.components[name]
    },
    nativeAsset(item){
      return isNativeAsset(item)
    },
    reload(){
      return this.getAccountInfo(this.account.address)
    },
    // updateFederationAndInflationInfo() {
    //   // update home_domain and inflation_destination from horizon.
    //   console.log("updateFederationAndInflationInfo")
    //   console.log(this.accountData)
    //   console.log()
    //   if (this.account.federationAddress !== this.accountData.inflation_destination || this.account.inflationAddress !== this.accountData.home_domain) {
    //     let data = Object.assign({}, this.account, {
    //       federationAddress: this.accountData.home_domain,
    //       inflationAddress: this.accountData.inflation_destination
    //     })
    //     let params = {index: this.selectedAccountIndex, account: data}
    //     console.log(params)
    //     this.updateAccount(params)
    //       .then(data => {
    //         console.log("success")
    //       })
    //       .catch(err => {
    //         console.log("failed")
    //         console.error(err)
    //       })
    //   }
    // },
    /*
     *
     * 尝试修改的我不同的资产转换为xcn时的值
    */
    myassetstoxcn: function(mybalance) {
      let data = 0;
      for (var i = 0; i < this.balances.length; i++) {
        for (var j = 0; j < this.price.length; j++) {
          if (
            this.price[j].code === this.balances[i].code &&
            this.price[j].issuer === this.balances[i].issuer &&
            mybalance != 0
          ) {
            data = Number(this.price[j].price) * mybalance;
            return data;
          }
        }
      }
    },
    toNameCard() {
      this.$router.push({name: 'AccountNameCard'})
    },
    //隐藏资产---------------------------------------------------------------
    hiddenMyAssets() {
      this.is_Flag =
        this.is_Flag === FLAG_FILTER_ZERO ? FLAG_DEFAULT : FLAG_FILTER_ZERO;
      this.selectedItem = null
    },
    ...mapActions({
      selectAsset:'selectAsset',
      delTrust:'delTrust',
    }),
    toAddAsset(){
      //跳转到授权菜单
      this.$router.push({name:'AddAsset'})
    },
    toAsset(item){
      this.selectAsset(item)
      this.$router.push({name:'Asset'})
    },
    // 发送资产
    send(item){
      if(!this.islogin){
        this.$toasted.error(this.$t('Error.NoPassword'))
        this.$refs.toolbar.showPasswordLogin()
        return
      }
      this.selectAsset(item)
      this.$router.push({name: 'SendAsset'})
    },
    // 接收资产
    receive(item){
      this.selectAsset(item)
      this.$router.push({name: 'ReceiveAsset'})
    },
    // 删除授信
    del(item){
      if(!this.islogin){
        this.$toasted.error(this.$t('Error.NoPassword'))
        this.$refs.toolbar.showPasswordLogin()
        return
      }
      if(this.working)return
      if(Number(item.balance) > 0){
        this.$toasted.error(this.$t('Error.AssetNotZero'))
        return
      }
      this.working = true
      this.delTrust({
            seed: this.accountData.seed,
            address: this.account.address,
            code: item.code,
            issuer: item.issuer})
        .then(data=>{
          this.$toasted.show(this.$t('DeleteTrustSuccess'))
          this.delok = true
          this.delerror = false
          this.selectedItem = null
          setTimeout(()=>{
            this.working = false
          },1000)
           try{
              let doms = window.document.querySelectorAll('.myassets-li')
              for(var i=0,n=doms.length;i<n;i++){
                let element = doms[i]
                element.style.transition = "0.3s"
                element.style.marginLeft = 0 + "px"
              }
            }catch(error){
              console.error(error)
            }
        })
        .catch(err=>{
          this.$toasted.error(this.$t('Error.DeleteTrustError'))
          this.delok = false
          this.delerror = true
          setTimeout(()=>{
            this.working = false
          },1000)
        })
    },
    refresh(){
      return this.load()
    },
    doRefresh(){
      if(this.reloading)return
      this.reloading = true
      this.load().then(response=>{
        this.reloading = false
      })
      .catch(err=>{
        this.reloading = false
      })
    },
    doPaymentRefresh(){
      //刷新
      if(this.paymentReloading)return
      this.paymentReloading = true
      this.getPayments(this.account.address).then(response=>{
        this.paymentReloading = false
      })
      .catch(err=>{
        this.paymentReloading = false
      })
    },
    doPaymentMore(){//查询更多的数据
      if(this.paymentLoadmoring)return
      if(this.paymentReloading)return
      this.paymentLoadmoring = true
      this.loadmorePayments(this.account.address).then(response=>{
        this.paymentLoadmoring = false
      })
      .catch(err=>{
        this.paymentLoadmoring = false
      })
    },
    assetIcon(code,issuer){
      return COINS_ICON[code] || WORD_ICON[code.substring(0,1)] || DEFAULT_ICON
    },
    chgSortItem(item){
      this.selectedSortItem = item;
      this.sort_flag = item.key; 
    },
    toThirdApps(){
      this.$router.push({name: 'Apps'})
    },
    toHelp(){
      // let t = new Date().getTime()
      let site = 'https://wallet.fchain.io/manual/#1'
      let title = this.$t('Menu.Help')
      this.$router.push({name: 'Help', params: { title, site }})
    },
    toKYC(){
      // let site = 'https://fchain.io/kyc/accounts/login/?next=/portal/'+'?'+Math.random()
      // let title = this.$t('kyc')
      this.$router.push({name: 'KYC'})
    },
    showAccounts(){
        this.showaccountsview = true
    },
    closeView(){
        this.showaccountsview = false
    },    
    toTranscation(item){
      this.selectPayment(item)
      this.$router.push({name: 'Transaction'})
    },
   
  },
  components: {
    Toolbar,
    BottomNotice,
    Card,
    Scroll,
    TabBar,
    'loading': Loading,
    AccountsNav,
    UnFundNotice,
    'hdaw':HistoryDepositAndWithdraw,
    HistoryEffects,
    HistoryOffer,
    HistoryTrade,
    HistoryTransaction,
    HistoryTransactions,
  }
}

</script>


<style lang="stylus" scoped>
@require '~@/stylus/asset.styl'
@require '~@/stylus/settings.styl'
</style>

