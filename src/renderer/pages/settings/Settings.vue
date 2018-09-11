/**
 *
 */
<template>
  <div class="page">
    <toolbar :title="$t(title)" :showbackicon="false" @goback="back" lockpass menuName="SettingsParent"  ref="toolbar">
      <v-btn icon @click.native="showAccounts" slot="left-tool">
        <i class="material-icons font28">menu</i>
      </v-btn>
    </toolbar>

<accounts-nav :show="showaccountsview" @close="closeView"/>
    <m-layout class="mt-4">
      <card padding="10px 10px" class="mycard primarygraybg">
        <div class="card-content primarygraybg" slot="card-content">
          <ul class="settings-ul primarygraybg">
            
            <li class="settings-li">
              <span>{{$t('redUpGreenDown') }}</span>
              <v-switch class="pincodeswitch f-right"
                  v-model="colorSwitch"
                  color="primary"
                  hide-details
                  @change="switchColor"
                  ></v-switch>
            </li>

            <li class="settings-li">
              <span>{{$t('PinCode')}}</span>
              <v-switch class="pincodeswitch f-right"
                  v-model="pinEnable"
                  color="primary"
                  hide-details
                  @change="switchPinCode"
                  ></v-switch>

            </li>
            <li class="settings-li" @click="toChangeLanguage">
              <span>{{$t('Language')}}</span>
              <i class="material-icons vcenter f-right s-right">keyboard_arrow_right</i>
            </li>
            <li class="settings-li" @click="toChangeHorizon">
              <span>{{$t('PublicNetUrl')}}</span>
              <i class="material-icons vcenter f-right s-right">keyboard_arrow_right</i>
            </li>
            <li class="settings-li" @click="toFederationService">
              <span>{{$t('FederationName')}}</span>
              <i class="material-icons vcenter f-right s-right">keyboard_arrow_right</i>
            </li>
            <li class="settings-li" @click="toAbout">
              <span>{{$t('About.Title')}}</span> 
              <i class="material-icons vcenter f-right s-right">keyboard_arrow_right</i>
            </li>
          </ul>
        </div>
      </card>
    </m-layout>

  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import { mapState, mapActions} from 'vuex'
import AccountsNav from '@/components/AccountsNav'
export default {
  data(){
    return {
      title: 'Menu.Settings',
      pinEnable: false,
      colorSwitch: false,
       showaccountsview: false,
    }
  },
  computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      app: state => state.app,
      redUpGreenDown: state => state.app.redUpGreenDown,
    }),

  },
  watch: {
    redUpGreenDown(){
      this.colorSwitch = this.redUpGreenDown
    }
  },
  beforeMount(){
    this.pinEnable = this.app.enablePin || false
    this.colorSwitch = this.redUpGreenDown
  },
  beforeUpdate(){
    this.pinEnable = this.app.enablePin || false
    this.colorSwitch = this.redUpGreenDown
  },
  mounted(){
  },
  methods: {
    ...mapActions({
      changeUpDownColor:'changeUpDownColor',
    }),
    back(){
      this.$router.back()
    },
    switchPinCode(val){
      //value=true，跳转到设置ping界面
      if(val){
        this.$router.push({name: 'SetPinCode'})
        return
      }
      // value=false，则要求输入ping码，正确后才可以取消
      this.$router.push({name: 'DelPinCode'})
    },
    toManageAccount(){
      this.$router.push({name: 'ManageAccount'})
    },
    toChangeLanguage(){
      this.$router.push({name: 'Language'})
    },
    toFederationService() {
      this.$router.push({name: 'Federation'})
    },
    toChangeHorizon(){
      this.$router.push({name: 'Horizon'})
    },
    toAbout(){
      this.$router.push({name: 'About'})
    },
    switchColor(){
      this.changeUpDownColor(!this.redUpGreenDown)
    },
    showAccounts(){
        this.showaccountsview = true
    },
    closeView(){
        this.showaccountsview = false
    },
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
.page
  background: $primarycolor.gray
  color: $primarycolor.font
  font-size: 16px
  //  position: absolute
  // top: 0
  //bottom:0
  //left:0
  //right: 0
.mycard
  background: $secondarycolor.gray
  .card-content
    .settings-ul
      padding-left: 10px
      .settings-li
        font-size: 16px
        padding-top: 5px
        padding-bottom: 5px
        .pincodeswitch
          float: right
          width: 50px!important
          padding-top: 0px
.s-right
  margin-right: 10px
</style>
