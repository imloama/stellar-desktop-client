// 交易详情展示，主要是展示面积图和成交历史数据
<template>
  <div class="tpd secondaryfont">
    <!--面积图-->
    <v-card class="pa-2">
      <div class="tpd--title secondaryfont">
        <div class="code ">
          <div>{{base.code}}/{{counter.code}}</div>
          <div class="issuer" v-if="assethosts[base.code]">{{assethosts[base.code]}}</div>
          <div class="issuer" v-else-if="assethosts[base.issuer]">{{assethosts[base.issuer]}}</div>
          <div class="issuer" v-else>{{base.issuer | miniaddress}}</div>
        </div>
        <div class="chart" id="tpdchart" style="height:200px;width:100%;"></div>
      </div>
    </v-card>

    <!--成交数据-->
    <v-card class="pa-2 mt-2 trade-card">
      <div class="card-title pa-2">{{$t('latest_trade')}}</div>
      <div class="card-body pa-2 ">
        <v-layout class="textcenter">
          <v-flex xs4>{{$t('Trade.Price')}}</v-flex>
          <v-flex xs4>{{base.code}}</v-flex>
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


  </div>
</template>

<script>
import {mapState, mapActions } from 'vuex'
import { getTrades } from '@/api/trade'
import { getTradeAggregation,RESOLUTION_1DAY } from '@/api/tradeAggregation'
import { getAsset,isNativeAsset } from '@/api/assets'
import echarts from '@/libs/pkgs/initEcharts'
import {Decimal} from 'decimal.js'
var moment = require('moment')

export default {
  data(){
    return {
      trades:[],//成交的历史数据
      ele: null,
      opt: null,
      days: [],
      prices: [],
    }
  },
  props:{
    base:{
      type: Object,
      required: true
    },
    counter:{
      type: Object,
      required: true
    },
  },
  computed:{
    ...mapState({
      assethosts: state => state.asset.assethosts,
      tradePairsStat: state => state.accounts.tradePairsStat,
    })
  },
  beforeMount(){
    this.init()
  },
  mounted(){
    // this.initChart()
  },
  methods:{
    init(){
      // this.initChart()
      this.initTrade()
      this.initTradeAggregation()
    },
    //最新成交数据
    initTrade(){
      let counterasset = getAsset(this.counter)
      let baseasset = getAsset(this.base)
      getTrades(baseasset,counterasset,"desc",50)
          .then(data=>{
            this.trades = data.records
          }).catch(err=>{
            console.log(err)
          })
    },
    initTradeAggregation(){ // 获取前50天的数据
      let start_time = Number(moment().subtract(50,"days").format('x'))
      let end_time= new Date().getTime()
      getTradeAggregation(getAsset(this.base), getAsset(this.counter), 
        start_time, end_time, RESOLUTION_1DAY, 200, 'desc')
            .then(data => {
                let records = data.records
                this.days = []
                this.prices = []
                records = records.reverse()
                records.forEach(item=>{                   
                    this.days.push(new Date(item.timestamp).Format('MM-dd hh:mm'))
                    this.prices.push(item.avg)
                })
                // console.log(this.data)\
                console.log(this.opt)
                if(this.opt){
                  this.opt.xAxis.data = this.days
                  this.opt.series[0].data = this.prices
                  this.ele.setOption(this.opt, true)
                }else{
                  this.initChart()
                }
                // this.initChart()
                
                // console.log(this.opt)
            })
            .catch(err=>{
                console.error(`-----err on get trade aggregation -- `)
                console.error(err)
            })
    },
    initChart(){
      this.ele = echarts.init(document.getElementById("tpdchart"))
      this.opt = {
        color:['#212122','#999999'],
        grid:{
          show: false,
          left: 5,
          top: 10,
          bottom: 5,
          right: 5
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                lineStyle: {
                    color: '#57617B'
                }
            }
        },
        xAxis: {
                type: 'category',
                boundaryGap: false,
                // axisLabel:{show: true},
                data: this.days
            },
            yAxis: {
                type: 'value',
                axisTick: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        color: '#303034'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#999999'
                    }
                }

            },
            series: [{
                data: this.prices,
                type: 'line',
                smooth: true,
                areaStyle:{normal:{
                  color: '#212122'
                }},
                symbol: 'circle',
                symbolSize: 1,
                itemStyle: {
                    normal: {
                        color: '#999999',
                        borderColor:'#999999'
                    },
                },
            }]
      }
      this.ele.setOption(this.opt, true)
      
    },
    reload(){
      console.log('reload------')
      this.trades = []
      this.days = []
      this.prices = []
      if(this.ele){
        this.ele.dispose()
        this.ele = null
        this.opt = null
      }
      this.$nextTick(()=>{
        this.init()
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
@require '../stylus/color.styl'

.trade-card
  color: $secondarycolor.font
  .card-body-content
    height: 40vh
    overflow-y: auto
    overflow-x: hidden
  .card-title
    border-bottom: 1px solid $primarycolor.gray

</style>
