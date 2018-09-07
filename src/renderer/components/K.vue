/**
 * K线图
 * @Author: mazhaoyong@gmail.com 
 * @Date: 2018-01-25 11:53:34 
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-09-07 17:29:09
 * @License: MIT 
 */
<template>
<card class="k-card info-card" padding="0px 0px">
  <div slot="card-content" class="k">
      <div class="atitle pa-2" v-if="showTitle && titleData && titleData.price !== null">

          <div class="flex-row">
              <div class="flex1 font24 pt-1">
                  <v-icon @click="back" class="cursorpointer font28">keyboard_arrow_left</v-icon>
                  <span>{{base.code}}</span>/<span>{{counter.code}}</span></div>
              <div :class="'flex1 pt-1 '  + ( (titleData.change >=0 ^ redUpGreenDown) ? 'up':'down') ">
                <span class="price font24">{{titleData.price}}</span>
                <span v-if="titleData.rate>0"> +{{titleData.rate}}%</span>
                <span v-else>{{titleData.rate}}%</span>
              </div>  
              <div class="flex2">
                    <div class="flex-row pt-1">
                      <!-- <div class="flex1"><div v-if="titleData.open" class="label">24H {{$t('open_price')}}</div><div class="value" v-if="titleData.open">{{titleData.open}}</div></div>
                      <div class="flex1"><div v-if="titleData.close" class="label">24H {{$t('close_price')}}</div><div class="value" v-if="titleData.close">{{titleData.close}}</div></div> -->
                      <div class="flex1"><div v-if="titleData.high" class="label">24H {{$t('high_price')}}</div><div class="value" v-if="titleData.high">{{titleData.high}}</div></div>
                      <div class="flex1"><div v-if="titleData.low" class="label">24H {{$t('low_price')}}</div><div class="value" v-if="titleData.low">{{titleData.low}}</div></div>
                      <div class="flex1"><div v-if="titleData.base_volume" class="label">24H {{$t('volumes')}}</div><div class="value" v-if="titleData.base_volume">{{titleData.base_volume}}</div></div>
                  </div>

              </div>
          </div>

         
<!--          
          <div :class="'flex5 textcenter ' + ( (titleData.change >=0 ^ redUpGreenDown) ? 'up':'down') ">
              <div class="price textcenter">
                  <span class="price">{{titleData.price}}</span>
              </div>
              <div class="flex-row">
                  <div class="flex2 textright lchange">
                        <span v-if="titleData.change>0">+{{titleData.change}}</span>
                        <span v-else>{{titleData.change}}</span>
                  </div>
                  <div class="flex2 textleft lchange pl-1">
                        <span v-if="titleData.rate>0"> +{{titleData.rate}}%</span>
                        <span v-else>{{titleData.rate}}%</span>
                  </div>
              </div>
          </div>
          <div class="flex5 values">
              <div class=""><span class="label">24H {{$t('high')}} </span><span v-if="titleData.high">{{titleData.high}}</span></div>
              <div class=""><span class="label">24H {{$t('low')}} </span><span v-if="titleData.low">{{titleData.low}}</span></div>
              <div class=""><span class="label">24H {{$t('volume')}} </span><span v-if="titleData.base_volume">{{Number(titleData.base_volume).toFixed(4)}}</span></div>
          </div>
         
          -->
      </div>
       
      
      <!-- <div v-show="showKgraph" class="kgraph" :id="id" v-bind:style="{height: lineHeight}"></div> -->
<!--      
      <v-tabs class="tabs-bg-dark" v-model="resolutionIndex" grow hide-slider color="transparent" v-show="showKgraph">
        <v-tab @click="chgResolution('week')">{{$t('week')}}</v-tab>
        <v-tab @click="chgResolution('day')">{{$t('day')}}</v-tab>
        <v-tab @click="chgResolution('hour')">{{$t('hour')}}</v-tab>
        <v-tab @click="chgResolution('15min')">15{{$t('minute')}}</v-tab>
        <v-tab @click="chgResolution('1min')">1{{$t('minute')}}</v-tab>
      </v-tabs> -->
  </div>
</card>
</template>

<script>
//var echarts = require('echarts')
import echarts from '@/libs/pkgs/initEcharts'
import NP from 'number-precision'
import { getTradeAggregation, getTradeAggregation1min, 
    getTradeAggregation15min, getTradeAggregation1hour, 
    getTradeAggregation1day, getTradeAggregation1week,
    RESOLUTION_1MIN, RESOLUTION_15MIN, RESOLUTION_1HOUR, RESOLUTION_1DAY, RESOLUTION_1WEEK } from '@/api/tradeAggregation'
import { getAsset,isNativeAsset } from '@/api/assets'
import { mapState, mapActions, mapGetters} from 'vuex'
import { getTrades } from '@/api/trade'
import { DEFAULT_INTERVAL } from '@/api/gateways'
var moment = require('moment')
import  defaultsDeep  from 'lodash/defaultsDeep'
import {Decimal} from 'decimal.js'
import Card from '@/components/Card'
const RESOLUTIONS = {
    "week": RESOLUTION_1WEEK,
    "day": RESOLUTION_1DAY,
    "hour": RESOLUTION_1HOUR,
    "15min": RESOLUTION_15MIN,
    "1min": RESOLUTION_1MIN
}

const RESOLUTIONS_ITEMS = {
    "week": "0",
    "day": "1",
    "hour": "2",
    "15min": "3",
    "1min": "4"
    }


export default {
    data(){
        return {
            id: null,//元素主键
            ele: null,//echarts对象
            opt: null,
            colors: ['#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3'],
            
            resolution_key: 'hour',
            resolution: RESOLUTION_1HOUR,
            resolutionIndex: "2",
            lineHeight:'480px',

            dates:[],//日期
            volumes: [],//成交量
            subVolumes:[],//base_volumes与counter_volumes
            data: [],//每条数据是一个数组，[开盘价，收盘价，最低价，最高价]
            tinterval: null,//定时器
            lasttime: null,//上次的执行时间
            RESOLUTION_HOURS: {
                "week": 16800,//100周
                "day": 7200,//100天
                "hour": 720,//30天
                "15min": 120,//10天
                "1min": 120
            },
            
            
            //24小时的成交记录
            lastTradeAggregation: null,
            //最新的成交价格统计
            lastTrade:null,
            tradeInterval: null,//查询最新一次交易数据的interval
            
            showKgraph: true,
        }
    },
    props: {
        //交易资产
        base: {
            type: Object,
            require: true
        },
        //交易对手资产
        counter: {
            type: Object,
            require: true
        },
        //数据获取的起始时间，单位毫秒
        start: {
            type: Number,
            default: -1
        },
        //数据获取的截止时间，单位毫秒
        end: {
            type: Number,
            default: -1
        },
        //是否增量更新模式
        incremental: {
            type: Boolean,
            default: true
        },
        showTitle: {
            type: Boolean,
            default: false
        },
        fullscreen: {
            type: Boolean,
            default: false
        },
        //高度
        height: {
            type: String,
            default: '260px'
        },
        timeout: {
            type: Number,
            default: 100
        }
    },
    computed: {
      ...mapState({
          redUpGreenDown: state => state.app.redUpGreenDown,
          tradePairsStat: state => state.accounts.tradePairsStat,
      }),
      upColor(){
        return this.redUpGreenDown ? '#14b143' : '#ef232a'
      },
      downColor(){
        return this.redUpGreenDown ? '#ef232a' : '#14b143'
      },
      titleData(){
        let idf = isNativeAsset(this.base) ? 'XLM' : this.base.code+'-'+this.base.issuer
        let idt = isNativeAsset(this.counter) ? 'XLM' : this.counter.code +'-'+this.counter.issuer
        let key = idf + '_' + idt;
        let d = this.tradePairsStat[key]
        if(d){
            return this.genTitleData(d)
        }
        let key2 = idt + '_' + idf;
        d = this.tradePairsStat[key2]
        if(d){
            return this.genTitleDataEx(d)
        }
        return {}
      }  
    },
    beforeMount () {
        //生成随机的id
        this.id = 'k_'+ new Date().getTime()
         //如果是全屏模式，则切换为横屏
        if(this.fullscreen){
            screen.orientation.lock('landscape');
        }
        
    },
    beforeDestroy () {
        console.log('---------before destory --------')
        //关闭定时器
        if(this.tinterval){
            clearInterval(this.tinterval)
            this.tinterval = null
        }
        if(this.fullscreen){
            screen.orientation.lock('portrait');
        }
        this.deleteTradeInterval()
        
    },
    mounted () {
        console.log('----before mounted------')
        // this.$nextTick(()=>{

        //     setTimeout(()=>{
        //          //开启定时器
        //         this.tinterval = setInterval(this.fetch, this.resolution)
        //         this.reload();
        //     }, this.timeout)
           
        // })
    },
    methods: {

        ...mapActions({
            getAccountInfo: 'getAccountInfo',
        }),
        back(){
            this.$router.back()
        },
        reload(){
            this.cleanData()
            this.init();
            this.fetch();
        },
        cleanData(){
            this.ele = null
            this.opt = null
            this.dates = []
            this.volumes = []
            this.data = []
            this.tinterval =  null
            this.lasttime = null
        },
        init() {
            this.initView()
        },
        getStartTime(){
            let defHour = this.RESOLUTION_HOURS[this.resolution_key]
            if(!defHour){
                defHour = 500
            }
            return Number(moment().subtract(defHour,"hours").format('x'))
        },
        //请求api，获取数据
        fetch(){
          let start_time = null, end_time=null;
          if(this.lasttime){
              start_time = this.lasttime;
              end_time = new Date().getTime()
          }else{//初次请求，判断start是否存在
            if(this.start < 0){
                
                start_time = this.getStartTime()
            }else{
                start_time = this.start;
            }
            if(this.end < 0 ){
                end_time = new Date().getTime()
            }else{
                end_time = this.end
            }
          }
          getTradeAggregation(getAsset(this.base), getAsset(this.counter), 
            start_time, end_time, this.resolution, 200, 'desc')
            .then(data => {
                this.lasttime = end_time
                let records = data.records
                if(!this.incremental){
                    this.dates = []
                    this.volumes = []
                    this.data = []
                }
                records = records.reverse()
                records.forEach(item=>{                   
                    this.dates.push(new Date(item.timestamp).Format('MM-dd hh:mm'))
                    this.volumes.push(new Decimal(item.base_volume).add(item.counter_volume).toNumber())
                    this.subVolumes.push([Number(item.base_volume),Number(item.counter_volume)])
                    this.data.push([Number(item.open), Number(item.close), Number(item.high), Number(item.low), Number(item.counter_volume)])
                })
                // console.log(this.data)
                this.opt.xAxis[0].data = this.dates
                this.opt.xAxis[1].data = this.dates
                this.opt.series[0].data = this.data
                this.opt.series[1].data = this.volumes
                this.opt.series[2].data = this.calculateMA(5)
                this.opt.series[3].data = this.calculateMA(10)
                
                this.ele.setOption(this.opt, true)
                // console.log(this.opt)
            })
            .catch(err=>{
                console.error(`-----err on get trade aggregation -- `)
                console.error(err)
            })
        },
        initView() {
            this.ele = echarts.init(document.getElementById(this.id))
            this.opt = this.koption()
            this.ele.setOption(this.opt, true)
        },
        koption() {

            return {
                animation: true,
                color: this.colors,
                backgroundColor: "#212122",
                title: {left: 'center', text: this.base.code + '/' + this.counter.code },
                legend: { show: true, top: 0,data: [this.$t('minute'), 'MA5', 'MA10']},
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'cross' },
                    transitionDuration: 0,
                    confine: true,
                     position:  (pos, params, dom, rect, size)=>{
                        return pos[0] < size.viewSize[0] / 2 ? {top: 10, right: 10}:{top: 10, left: 10}
                    },
                    formatter: (params, tick)=>{
                        console.log(params)
                        let series = params.sort((a,b)=>a.seriesIndex>b.seriesIndex)
                        let result = `${series[0].name}<br/>`;
                        let openlabel = this.$t('open_price')
                        let closelabel = this.$t('close_price')
                        let highlabel = this.$t('high_price')
                        let lowlabel = this.$t('low_price')
                        let volumelabel = this.$t('volumes')
                        if(series[0].data){
                            // console.log(series[0].data)
                            result += `${openlabel}: ${series[0].data[1]}<br/>`
                            + `${closelabel}: ${series[0].data[2]}<br/>`
                            + `${highlabel}: ${series[0].data[3]}<br/>`
                            + `${lowlabel}: ${series[0].data[4]}<br/>`
                            
                        }
                        result += 
                             `MA5: ${series[2].data}<br/>`
                            + `MA10: ${series[3].data}<br/>`
                            + `${volumelabel}: ${series[1].data}<br/>`
                        return result
                    }
                },
                axisPointer: { 
                    link: [{xAxisIndex: [0,1]}]
                },
                dataZoom: [{
                    type: 'inside',
                    xAxisIndex: [0, 1],
                    start: 50,
                    end: 100
                }],
                xAxis: [{
                    type: 'category',
                    data: this.dates,
                    scale: true,
                    boundaryGap : false,
                    axisLine: { onZero: false, lineStyle: { color: '#777' } },
                    axisLabel: {
                        formatter: function (value) {
                            return value
                        }
                    },
                    min: 'dataMin',
                    max: 'dataMax',
                    axisPointer: {show: true}
                }, {
                    type: 'category',
                    gridIndex: 1,
                    data: this.dates,
                    scale: true,
                    boundaryGap : false,
                    splitLine: {show: false},
                    axisLabel: {show: false},
                    axisTick: {show: false},
                    axisLine: { onZero: false, lineStyle: { color: '#777' } },
                    splitNumber: 10,
                    min: 'dataMin',
                    max: 'dataMax',
                    axisPointer: {
                        type: 'shadow',
                        label: {show: false},
                        triggerTooltip: true,
                        handle: {show: false,margin: 30,color: '#B80C00'}
                    }
                }],
                yAxis: [{
                    scale: true,
                    splitNumber: 5,
                    axisLine: { lineStyle: { color: '#777' } },
                    splitLine: { show: true, lineStyle:{color: '#666666'} },
                    // axisTick: { show: false },
                    axisLabel: {
                        inside: true,
                        formatter: '{value}\n'
                    }
                }, {
                    scale: true,
                    gridIndex: 1,
                    splitNumber: 2,
                    axisLabel: {show: true,inside: true,
                        formatter: '{value}\n'},
                    axisLine: {show: true},
                    axisTick: {show: true},
                    splitLine: {show: false}
                }],
                grid: [{
                    left: 0,
                    right: 0,
                    top: 30,//110,
                    height: 320,
                    //bottom: 0
                }, {
                    left: 0,
                    right: 0,
                    height: 80,
                    top: 400,//260
                    //bottom: 0
                }],
                graphic: [],
                series: [ {
                    type: 'candlestick',
                    name: this.$t('minute'),
                    data: this.data,
                    itemStyle: {
                        normal: {
                            color: this.upColor,
                            color0: this.downColor,
                            borderColor: this.upColor,
                            borderColor0: this.downColor
                        },
                        emphasis: {
                            color: '#444',
                            color0: 'black',
                            borderColor: '#444',
                            borderColor0: 'black'
                        }
                    }
                }, {
                    name: 'Volume',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    itemStyle: {
                        normal: {
                            color: (params)=>{
                                let obj = this.subVolumes[params.dataIndex]
                                if(obj && obj[0] > obj[1]){
                                    return "#733520"
                                }
                                return '#216549'
                            }
                        }
                    },
                    data: this.volumes
                },{
                    name: 'MA5',
                    type: 'line',
                    data: this.calculateMA(5),
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        normal: {width: 2,opacity: 0.5}
                    }
                }, {
                    name: 'MA10',
                    type: 'line',
                    data: this.calculateMA(10),
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        normal: {
                            width: 2,opacity: 0.5
                        }
                    }
                }]
            }
        }, // end of koption
        calculateMA(dayCount) {
            var result = [];
            for (var i = 0, len = this.data.length; i < len; i++) {
                if (i < dayCount) {
                    result.push('-');
                    continue;
                }
                var sum = new Decimal(0);
                for (var j = 0; j < dayCount; j++) {
                    sum = sum.plus(this.data[i - j][1]);
                }
                result.push(sum.dividedBy(dayCount).toFixed(2))
            }
            return result;
        },
        setupTradeInterval(){
            if (!this.tradeInterval){
                this.tradeInterval = setInterval(()=>{
                this.fetchLastTrade()
                console.log(this.account.address)
                this.getAccountInfo(this.account.address)
                },DEFAULT_INTERVAL)
            }
            this.fetchLastTrade()
        },

        deleteTradeInterval(){
            if(this.tradeInterval!= null && typeof this.tradeInterval != 'undefined'){
                clearInterval(this.tradeInterval)
                this.lastTrade = null
            }
        },
        //查询最新一次成交记录
        fetchLastTrade(){
            let counterasset = getAsset(this.counter.code,this.counter.issuer)
            let baseasset = getAsset(this.base.code,this.base.issuer)
            getTrades(baseasset,counterasset,"desc",1)
                .then(data=>{
                    if(data.records && data.records.length > 0){
                        this.lastTrade = data.records[0]
                    }
                }).catch(err=>{
                    console.log(err)
                })
        },

        toFullscreen(){
            console.log(`------to fullscreen--`)
            this.$router.push({name: 'TradeK'})
        },
        back(){
            this.$router.back()
        },
        chgResolution(key){
            this.resolution_key = key
            this.resolution = RESOLUTIONS[key]
            this.resolutionIndex = RESOLUTIONS_ITEMS[key]
            this.reload()
        },
        switchKgraphShow(){
            this.showKgraph = !this.showKgraph
        },
        genTitleData(d){
            let price = new Decimal(d.latest_price||d.order_book_avg)//new Decimal(this.lastTrade.base_amount).dividedBy(this.lastTrade.counter_amount)
            let rate = new Decimal(0)
            let change = new Decimal(0)
            if(d.open){
                let open = new Decimal(d.open)
                change = price.minus(open)
                rate = change.toNumber() === 0 ? new Decimal(0) : change.times(100).dividedBy(open)
            }
            if(price.toNumber() === 0){
                price = null
            }else{
                price = price.toFixed(this.decimal)
            }
            return Object.assign({},d,{
                    price,
                    rate: Number(rate.toFixed(2)),
                    change: change.toNumber()
                    })
        },
        genTitleDataEx(d){
            let price = new Decimal(1).dividedBy(new Decimal(d.latest_price||d.order_book_avg))//new Decimal(this.lastTrade.base_amount).dividedBy(this.lastTrade.counter_amount)
            let rate = new Decimal(0)
            let change = new Decimal(0)
            if(d.open){
                let open = new Decimal(1).dividedBy(d.open)
                change = price.minus(open)
                rate = change.toNumber() === 0 ? new Decimal(0) : change.times(100).dividedBy(open)
            }
            if(price.toNumber() === 0){
                price = null
            }else{
                price = price.toFixed(7)
            }
            return Object.assign({},d,{
                    price: price,
                    rate: Number(rate.toFixed(2)),
                    change: Number(change.toFixed(7))
                    })
        }

    },
    components: {
        Card
    }

}
</script>

<style lang="stylus" scoped>
@require './K.styl'
</style>
