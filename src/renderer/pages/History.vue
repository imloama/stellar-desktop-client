<template>
  <div class="page" dark>
    <toolbar :title="$t(title)" style="z-index:999;" menuName="History"
     :showbackicon="false" lockpass 
      ref="toolbar"
      :shadow=false
      >
      <v-btn icon @click.native="showAccounts" slot="left-tool">
        <i class="material-icons font28">menu</i>
    </v-btn>
   </toolbar> 
   <accounts-nav :show="showaccountsview" @close="closeView"/>
  
  <m-layout>
    <div class="flex-row mt-2 mb-2 tabsbar">
      <div class="flex5">
        <v-tabs  class="tabs-bg-sdark" hide-slider color="secondarygray"
      v-model="activeTab" @input="tabChange">
          <v-tab class="stabs" :key="`offer`" ripple>{{$t('History.Offer')}}</v-tab>
          <v-tab class="stabs" :key="`transaction`" ripple>{{$t('History.Transaction')}}</v-tab>
          <v-tab class="stabs" :key="`trade`" ripple>{{$t('History.Trade')}}</v-tab>
          <v-tab class="stabs" :key="`depositAndWithdraw`" ripple>{{$t('History.DepositAndWithdraw')}}</v-tab>
          <v-tab class="stabs" :key="`effects`" ripple>{{$t('History.Effects')}}</v-tab>
          <v-tab class="stabs" :key="`transactions`" ripple>{{$t('History.Transactions')}}</v-tab>
        </v-tabs>
      </div>
      <div class="flex1 pa-2 pr-4 textright"  v-if="!reloading">
        <v-icon class="cursorpinter" @click="doReload">refresh</v-icon>
      </div>
      <div class="flex1 pa-2 pr-4 textright" v-else>
        <v-progress-circular
            indeterminate size=24
            color="primary" 
          ></v-progress-circular>
      </div>
      
    </div>
        
          <component v-bind:is="show.component" ref="compRef"></component>
      </m-layout>
     
  </div>
</template>

<script>
  import {mapState, mapActions, mapGetters} from 'vuex'
  import Toolbar from '@/components/Toolbar'
  import HistoryOffer from '@/components/HistoryOffer'
  import HistoryTransaction from '@/components/HistoryTransaction'
  import HistoryTrade from '@/components/HistoryTrade'
  import HistoryDepositAndWithdraw from '@/components/HistoryDepositAndWithdraw'
  import Card from '@/components/Card'
  import { swiper, swiperSlide } from 'vue-awesome-swiper'
  import HistoryEffects from '@/components/HistoryEffects'
  import HistoryTransactions from '@/components/HistoryTransactions'
  import AccountsNav from '@/components/AccountsNav'
  export default {
    data() {
      return {
        title: 'History.Title',
        loading: false,
        activeTab: 0,
        keys:['offer','transaction','trade','depositAndWithdraw','effects','transactions'],
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
        swiperOptionTop: {
          notNextTick: true,
          spaceBetween: 10,
          centeredSlides: true,
          slidesPerView: 'auto',
          touchRatio: 0.2,
          slideToClickedSlide: true,
          watchSlidesProgress:true,
          },
        accountNotFundDlg: false,
        showaccountsview: false,
        reloading: false,
      }
    },
    created() {
      this.switchComponent(this.currentHistoryComponent)
    },
    computed: {
     ...mapState({
       currentHistoryComponent: state => state.accounts.currentHistoryComponent,
       islogin: state => state.accounts.accountData.seed ? true:false,
     }),
    swiperTop() {
        return this.$refs.swiperTop.swiper
      },
    getParams(){
        let routerParams = this.$route.params.active
        return routerParams==="offer"?0:1
      },
    },
    mounted () {  
      // console.log("2222-------------")
	    // this.swiperTop.on('slideChange', this.showinfo)
	    // this.swiperTop.slideTo(this.getParams,0,true)
    } ,
    methods: {
      ...mapActions([
        'changeCurrentHistoryComponent'
      ]),
      tabChange(){
        let name = this.keys[this.activeTab]
        this.switchComponent(name)
      },
      back(){
        this.$router.back()
      },
      switchComponent(name) {
        if (name == this.show.name) return
        this.show.name = name
        this.show.component = this.components[name]
      },
      showinfo(){
        console.log("this.showinfo():"+this.swiperTop.activeIndex)
        let typeNumber = this.swiperTop.activeIndex
        if(typeNumber==0){
          this.switchComponent('offer')
          console.log("11111")
        }
        if(typeNumber==1){
          this.switchComponent('transaction')
        }
        if(typeNumber==2){
          this.switchComponent('trade')
        }
        if(typeNumber==3){
          this.switchComponent('depositAndWithdraw')
        }
        if(typeNumber==4){
          this.switchComponent('effects')
        }
        if(typeNumber==5){
          this.switchComponent('transactions')
        }
      },
      showAccounts(){
          this.showaccountsview = true
      },
      closeView(){
          this.showaccountsview = false
      },
      doReload(){
        this.reloading = true
        this.$refs.compRef.reload().then(()=>{
          this.reloading = false
        }).catch(err=>{
          this.reloading = false
        })
      }
    },
    beforeDestroy() {
      this.changeCurrentHistoryComponent(this.show.name)
    },
    components: {
      Toolbar,
      Card,
      AccountsNav,
    }
  }
</script>
<style lang="stylus" scoped>
  @require '~@/stylus/color.styl'
    .menu-wrapper
      margin-top: 10px
      .menu-ul
        width: 100%
        display: flex;
        justify-content: center;
        .menu-li
          float: left
          color: $secondarycolor.font
          padding-left: 10px
          padding-right: 10px
          height: 32x
          line-height: 32px
          text-align: center
          font-size: 16px
        .menu-li.active
          border-bottom: 2px solid $primarycolor.green
          color: $primarycolor.green
.swiper-container
  background: $primarycolor.green
  height: 46px
  margin: 0 !important
  min-height:42px !important
.swiper-slide
  width:100px
  height: 100%;
  opacity: 0.6;
  margin-top:6px
  cursor: pointer
.swiper-slide-active 
  opacity: 1;
  font-weight 600 

.tabsbar
  background: $secondarycolor.gray
</style>