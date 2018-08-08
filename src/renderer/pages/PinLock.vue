/**
 * 锁屏密码
 */
<template>
  <div class="page pinlock-page">
   <v-layout style="height:100%;">
     <v-flex xs4>&nbsp;</v-flex>
     <v-flex xs4 class="lockcontent">
       <v-text-field name="input-name" required dark
          :label="$t('Lock')" v-model="lockpwd"
          :append-icon="pwdvisible ? 'visibility' : 'visibility_off'"
          :append-icon-cb="() => (pwdvisible = !pwdvisible)"
          :type="pwdvisible ? 'text':'password'"
        ></v-text-field>
        <v-btn block color="error" 
          :disabled="lockpwd === null || lockpwd.length ===0"
          :loading="working" @click="unlock">{{$t('Button.OK')}}</v-btn>
     </v-flex>
     <v-flex xs4>&nbsp;</v-flex>
   </v-layout>

    
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import PinCode from '@/components/PinCode'
import { mapState, mapActions} from 'vuex'
import Vue from 'vue'

export default {
  data(){
    return {
      title: 'PinCode',//'resetPin'
      showmenuicon: false,
      showbackicon: false,
      lockpwd: null,
      pwdvisible: false,
      working: false,
    }
  },
  computed:{
    ...mapState({
        alldata: state => state,
      })
  },
  components: {
    PinCode,
    Toolbar,
  },
  methods: {
    ...mapActions([ ]),
    unlock(){
      if(this.lockpwd === this.alldata.app.pin){
        //跳转到main界面上
        this.$router.push({name:'MyAssets'})
      }else{
        this.$toasted.error(this.$t('lock_pwd_wrong'))
      }
    },
  }
}
</script>

<style lang="stylus" scoped>
.pinlock-page
  z-index: 9999
  position: fixed
  top: 0
  right: 0
  left: 0
  bottom: 0
.lockcontent
  padding-top: 25%
</style>
