<template>
    <v-dialog class="pa-4" max-width="760px" v-model="dlgView">
      <v-card>
        <v-layout row wrap >
          <v-flex xs12 class="textcenter pa-2 primarycolor">
            {{$t('Trade.AddTradePair')}}
          </v-flex>
          <v-flex xs6 class="pa-2">
            <div :class="'item cursorpointer flex-row pa-2 ma-2 ' +  (leftActiveValue === item.value ? 'active':'')"
               v-for="(item,index) in data" :key="index" @click="selectItem(true,item)">
              <div class="pr-2 pl-2">
                <i :class="'iconfont primarycolor font28 ' + assetIcon(item.text.code,item.text.issuer)"></i>
              </div>
              <div>
                <div>
                  {{item.text.code}}<small class="secondaryfont pl-1">{{item.text.issuer | miniaddress}}</small>
                </div>
                <div class="secondaryfont">{{item.text.host}}</div>
              </div>
              
            </div>
          </v-flex>
          <v-flex xs6  class="pa-2">
            <div :class="'item cursorpointer flex-row pa-2 ma-2 ' +  (rightActiveValue === item.value ? 'active':'')"
              v-for="(item,index) in data" :key="index" @click="selectItem(false,item)">
              <div class="pr-2 pl-2">
                <i :class="'iconfont primarycolor font28 ' + assetIcon(item.text.code,item.text.issuer)"></i>
              </div>
              <div>
                <div>
                  {{item.text.code}}<small class="secondaryfont pl-1">{{item.text.issuer | miniaddress}}</small>
                </div>
                <div class="secondaryfont">{{item.text.host}}</div>
              </div>
              
            </div>
          </v-flex>
          <v-flex xs6>
            <v-btn flat block color='primary' @click="cancel">{{cancelTxt}}</v-btn>
          </v-flex>
          <v-flex xs6>
            <v-btn flat block color='primary' @click="confirm">{{confirmTxt}}</v-btn>
          </v-flex>
        </v-layout>
      </v-card>
    </v-dialog>
</template>

<script type="text/ecmascript-6">
  import { COINS_ICON, FF_ICON, DEFAULT_ICON, WORD_ICON} from '@/api/gateways'

  const STATE_HIDE = 0
  const STATE_SHOW = 1

  const COMPONENT_NAME = 'picker'
  const EVENT_SELECT = 'select'
  const EVENT_VALUE_CHANGE = 'valuechange'
  const EVENT_CANCEL = 'cancel'
  const EVENT_CHANGE = 'change'

  export default {
    name: COMPONENT_NAME,
    props: {
      data: {
        type: Array,
        default() {
          return []
        }
      },
      title: {
        type: String
      },
      cancelTxt: {
        type: String,
        default: 'cancel'
      },
      confirmTxt: {
        type: String,
        default: 'confirm'
      },
      selectedIndex: {
        type: Array,
        default() {
          return []
        }
      },
      value: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        dlgView: false,
        pickerSelectedIndex: this.selectedIndex || [],
        leftActiveValue: null,
        rightActiveValue: null,
        pickerSelectedVal: [],
        pickerSelectedText: [],
      }
    },
    methods: {
      assetIcon(code,issuer){
        return COINS_ICON[code] || WORD_ICON[code.substring(0,1)] || DEFAULT_ICON
      },
      selectItem(left, item){
        let index = left ? 0 : 1
        this.pickerSelectedIndex[index] = item.value
        this.pickerSelectedVal[index] = item.value
        this.pickerSelectedText[index] = item.text
        console.log(this.pickerSelectedVal)
        this.leftActiveValue = this.pickerSelectedVal[0]
        this.rightActiveValue = this.pickerSelectedVal[1]
      },
      confirm() {
        if(this.leftActiveValue !== null && this.rightActiveValue !== null 
          && this.leftActiveValue !== this.rightActiveValue){
            this.$emit(EVENT_SELECT, this.pickerSelectedIndex)
            this.$emit(EVENT_SELECT, this.pickerSelectedIndex)
            this.dlgView = false
        }
      },
      cancel() {
        this.dlgView = false
        this.$emit(EVENT_CANCEL)
      },
      show() {
        this.dlgView = true
      },
    },
    watch: {
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@require '~@/stylus/color.styl'
.item
  border: 1px solid $primarycolor.gray
  border-radius: 5px
  &.active
    border: 1px solid $primarycolor.green
</style>
