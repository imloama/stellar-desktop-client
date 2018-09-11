/**
 * 服务条款界面
 */
<template>

  <div class="terms-service-page">
    <m-layout>
    <!-- <v-toolbar class="tbar primary" dark  :flat="false" dense :clipped-left='true' app>
      <v-btn icon v-show="showbackicon" @click="goback" class="white--text">
            <i class="material-icons font28">&#xE5CB;</i>
      </v-btn>
      <v-toolbar-title class="white--text title">{{$t('TermsOfServiceTitle')}}</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar> -->
    <div class="headline mt-5 textcenter primarycolor">{{$t('TermsOfServiceTitle')}}</div>
    <div class="page-content" v-html="$t('TermsOfService')">
    </div>
    <div class="textcenter mt-5" v-if="!showbackicon">
       <v-layout row wrap>
        <v-flex xs6 @click="goback">
          <v-btn block  color="info">{{$t('Return')}}</v-btn>
        </v-flex>
        <v-flex xs6 @click="wallet">
          <v-btn block  color="primary">{{$t('Agree')}}</v-btn>
        </v-flex>
       </v-layout>  
    </div>  
  </m-layout>
  </div>
</template>

<script>
import { mapState,mapActions} from 'vuex'
import MLayout from '@/components/MLayout.vue'
export default {
  data(){
    return {
      showbackicon: false
    }
  },
  computed: {
    ...mapState({
      isImportAccount: state => state.isImportAccount,
      isCreateAccount: state => state.isCreateAccount
    })
  },
  beforeMount () {
    let active = this.$route.query.active
    if(active === 'back'){
      this.showbackicon = true
    }


  },
  methods: {
    ...mapActions({
      backToAccount: 'backToAccount'
    }),
    goback(){
      this.backToAccount()
      this.$router.back()
    },
    wallet(){
     if(this.isImportAccount){
        this.$router.push({name: 'ImportAccount'})
        return
      }
      this.$router.push({name: 'CreateAccount'})
    }
  },
  components: {
    MLayout,
  }
}
</script>

<style  lang="stylus" scoped>
@require '~@/stylus/color.styl'
.terms-service-page
  background: $primarycolor.gray
  position: fixed
  left: 0
  right: 0
  top: 0
  bottom: 0
  z-index:999
  overflow-y:auto
.tbar
  z-index: 99
.page-content
  color: $secondarycolor.font
  font-size: 14px
  padding: 20px 20px
  height: 100%
.page-content-showback
  bottom: 10px
.title
  width: 100%
  text-align: center
  height: 24px
  line-height: 24px
.footer
  position: fixed
  bottom: 0
  bottom: constant(safe-area-inset-bottom)
  bottom: env(safe-area-inset-bottom)
  left: 0
  right: 0
  z-index: 99
  background: $secondarycolor.gray
  height: 42px
  line-height: 42px
  font-size: 16px
  text-align: center
  color: $primarycolor.green
</style>
