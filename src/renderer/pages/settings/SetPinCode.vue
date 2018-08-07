/**
 * pin码设置界面（从设置中打开时）
 */
<template>
  <v-card class="pa-4">
    <v-switch
        :label="pinEnabled ? $t('lock_enable'):$t('lock_disable')"
        color="primary"
        v-model="pinEnabled"
        @change="switchLock"
      ></v-switch>
    <v-text-field name="input-name" required dark
        :label="$t('Lock')" v-model="lockpwd"
        v-if="showIput"
      ></v-text-field>
    <v-btn color="error" block @click="doSave"  v-if="showIput"
      :disabled="lockpwd===null || lockpwd.length===0"
      :loading="working">{{$t('Save')}}</v-btn>
</v-card>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import PinCode from '@/components/PinCode'
import { mapState, mapActions} from 'vuex'

export default {
  data(){
    return {
      title: 'SetPinCode',//'resetPin'
      showmenuicon: false,
      showbackicon: true,
      working:false,

      pinEnabled: false,
      showIput: false,
      lockpwd: null,
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
  beforeMount(){
    this.pinEnabled = this.app.enablePin || false
  },
  beforeUpdate(){
    this.pinEnabled = this.app.enablePin || false
  },
  components: {
    PinCode,
    Toolbar
  },
  methods: {
    ...mapActions([
      'enablePing','disablePing'
    ]),
    switchLock(val){//改变
      console.log('---------------change----------'+ val)
      if(!val){
        //清理锁屏码
        this.disablePing()
          .then(data=>{
            this.pinEnabled = false
          })
          .catch(err=>{
            this.$toasted.error(err.message)
            this.pinEabled = true
          })
      }else{
        //设置锁屏码
        this.pinEnabled = true
        this.showIput = true
      }

    },
    doSave(){
      if(this.working)return
      if(this.lockpwd === null || this.lockpwd.length ===0 )return
      this.working = true
      this.enablePing(this.lockpwd)
        .then(data=>{
          this.$toasted.success(this.$t('SaveSuccess'))
          this.working = false
          this.lockpwd = null
          this.showIput = false
        })
        .catch(err=>{
          this.working = false
          this.$toasted.error(this.$t('SaveFailed')+" " + err.message)
        })
    },
  }
}
</script>

<style lang="stylus" scoped>
</style>
