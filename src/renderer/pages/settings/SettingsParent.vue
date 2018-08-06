
<template>
<div>
  <toolbar :title="$t('Menu.Settings')" :showbackicon="false" lockpass :menuIndex="5"  ref="toolbar">
    <v-btn icon @click.native="showAccounts" slot="left-tool">
        <i class="material-icons font28">menu</i>
    </v-btn>
  </toolbar>

<accounts-nav :show="showaccountsview" @close="closeView"/>
<m-layout>
  <v-layout row class="mt-4">

    <v-flex xs3 class="pa-2">
      <v-list dark>
        <v-list-tile v-for="(item,index) in items" :key="index" @click="toPage(item,index)" :class="index === selected ? 'mactive':''">
          <v-list-tile-action>
            <v-icon :color="index === selected ? 'primary' : 'grey'">{{item.icon}}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title >{{$t(item.title)}}
                <span v-if="item.count>0">({{item.count}})</span></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-flex>
    <v-flex xs9 class="pa-2">
      <router-view></router-view>
    </v-flex>
  </v-layout>
  </m-layout>


</div>
</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import Toolbar from '@/components/Toolbar'
import AccountsNav from '@/components/AccountsNav'
import Card from '@/components/Card'

export default {
  components: {
    Toolbar,
    AccountsNav,
    Card,
  },
  data(){
    return {
      items: [{
          name: 'CustomTradeColor',
          title: 'redUpGreenDown',
          icon: 'color_lens'
        },
        {
            title: "Lock",
            name: "SetPinCode",
            icon: "lock"
        },
        {
            title: "Language",
            name: "Language",
            icon: "language"
        },
        {
            title: "PublicNetUrl",
            name: "Horizon",
            icon: "link"
        },
        {
            title: 'FederationName',
            name: 'Federation',
            icon: "credit_card"
        },
        {
            title: 'About.Title',
            name: 'About',
            icon: "info"
        },
        
      
      ],
      showaccountsview: false,
      selected: 0,//当前选中的菜单

    }
  },
  computed: {
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.account.data,
      app: state => state.app,
      islogin: state => (state.accounts.accountData.seed ? true : false),
    }),
    names(){
      let d = []
      this.items.forEach(item=>{
        d.push(item.name)
      })
      return d
    }
  },
  watch: {
    '$route'(to,from){
      let i = this.names.indexOf(to.name)
      if(i>=0){
        this.selected = i
      }
    }
  },
  mounted(){
    let i = this.names.indexOf(this.$route.name)
    if(i>=0){
      this.selected = i
    }
    if(!this.islogin){
      this.$refs.toolbar.showPasswordLogin()
      return
    }
  },
  methods: {
    toPage(item,index){
      this.selected = index
      this.$router.push({name: item.name})
    },
    showAccounts(){
        this.showaccountsview = true
    },
    closeView(){
        this.showaccountsview = false
    },
  }
}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.mactive
  color: $primarycolor.green
  background: #666666
</style>
